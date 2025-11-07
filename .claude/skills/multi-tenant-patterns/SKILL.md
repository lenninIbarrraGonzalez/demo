---
name: multi-tenant-patterns
description: Multi-tenancy patterns for SaaS including organization management, invitations, role-based access, and tenant isolation
allowed-tools: Read, Write, Edit
---

# Multi-Tenant SaaS Patterns

Common patterns for building multi-tenant SaaS applications.

## Data Model

```typescript
// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Memberships
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] })
    .notNull()
    .default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrgUser: unique().on(table.organizationId, table.userId),
}))

// Tenant-scoped resource
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

## Organization Context in URLs

```
/[orgSlug]/projects
/[orgSlug]/settings
/[orgSlug]/members
```

## Verify Organization Access

```typescript
'use server'

export async function verifyOrgAccess(orgSlug: string) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const membership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, session.user.id),
      exists(
        db.select().from(organizations)
          .where(and(
            eq(organizations.slug, orgSlug),
            eq(organizations.id, memberships.organizationId)
          ))
      )
    ),
    with: {
      organization: true,
    },
  })

  if (!membership) {
    throw new Error('Access denied')
  }

  return membership
}
```

## Organization Switcher

```tsx
'use client'

export function OrganizationSwitcher({ orgs, currentOrgSlug }) {
  const router = useRouter()
  const pathname = usePathname()

  const switchOrg = (newSlug: string) => {
    const newPath = pathname.replace(`/${currentOrgSlug}`, `/${newSlug}`)
    router.push(newPath)
  }

  return (
    <Select value={currentOrgSlug} onValueChange={switchOrg}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.slug}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

## Invitation System

**Create Invitation**:
```typescript
'use server'

export async function inviteUser(
  organizationId: string,
  email: string,
  role: string
) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.insert(invitations).values({
    organizationId,
    email,
    role,
    invitedBy: currentUserId,
    token,
    expiresAt,
  })

  await sendInvitationEmail(email, token, organizationName)
}
```

**Accept Invitation**:
```typescript
'use server'

export async function acceptInvitation(token: string) {
  const invitation = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.token, token),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date())
    ),
  })

  if (!invitation) {
    throw new Error('Invalid or expired invitation')
  }

  const session = await getSession()
  if (!session) {
    throw new Error('Must be logged in')
  }

  await db.transaction(async (tx) => {
    await tx.insert(memberships).values({
      organizationId: invitation.organizationId,
      userId: session.user.id,
      role: invitation.role,
    })

    await tx.update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invitation.id))
  })

  redirect(`/${invitation.organization.slug}`)
}
```

## Role-Based Permissions

```typescript
type Role = 'owner' | 'admin' | 'member' | 'viewer'
type Permission =
  | 'delete_org'
  | 'manage_billing'
  | 'manage_members'
  | 'create_project'
  | 'delete_project'

const permissions: Record<Role, Permission[]> = {
  owner: ['delete_org', 'manage_billing', 'manage_members', 'create_project', 'delete_project'],
  admin: ['manage_members', 'create_project', 'delete_project'],
  member: ['create_project'],
  viewer: [],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissions[role]?.includes(permission) ?? false
}

// Usage
if (!hasPermission(membership.role, 'delete_project')) {
  throw new Error('Insufficient permissions')
}
```

## Remove Member

```typescript
'use server'

export async function removeMember(organizationId: string, userId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // Check current user is admin/owner
  const currentMembership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.organizationId, organizationId),
      eq(memberships.userId, session.user.id)
    ),
  })

  if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
    throw new Error('Insufficient permissions')
  }

  // Can't remove owner
  const targetMembership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.organizationId, organizationId),
      eq(memberships.userId, userId)
    ),
  })

  if (targetMembership?.role === 'owner') {
    throw new Error('Cannot remove organization owner')
  }

  await db.delete(memberships)
    .where(and(
      eq(memberships.organizationId, organizationId),
      eq(memberships.userId, userId)
    ))

  revalidatePath(`/[orgSlug]/settings/members`)
}
```

## Create Organization

```typescript
'use server'

export async function createOrganization(name: string, slug: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // Check slug is available
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  })

  if (existing) {
    return { error: 'Slug already taken' }
  }

  const [org] = await db.insert(organizations)
    .values({
      name,
      slug,
      ownerId: session.user.id,
    })
    .returning()

  // Add creator as owner
  await db.insert(memberships).values({
    organizationId: org.id,
    userId: session.user.id,
    role: 'owner',
  })

  redirect(`/${slug}`)
}
```

## Tenant Isolation Checklist

- [ ] All tenant-scoped tables have organizationId
- [ ] RLS policies filter by organization
- [ ] Server Actions verify org access
- [ ] URLs include org identifier (slug)
- [ ] Organization switcher in UI
- [ ] Invitations system implemented
- [ ] Role-based permissions enforced
- [ ] Member management UI
- [ ] Can't remove org owner
- [ ] Indexes on organizationId columns
