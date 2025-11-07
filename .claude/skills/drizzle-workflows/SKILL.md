---
name: drizzle-workflows
description: Common Drizzle ORM workflows including schema creation, migrations, queries, and type generation for PostgreSQL with Supabase
allowed-tools: Read, Write, Edit, Bash
---

# Drizzle Workflows

Common workflows for working with Drizzle ORM in a Next.js + Supabase project.

## Initial Setup

1. **Install Dependencies**:
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

2. **Create drizzle.config.ts**:
```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema/*',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

3. **Add Scripts to package.json**:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Schema Creation Workflow

1. **Define Schema** (lib/db/schema/example.ts):
```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  organizationId: uuid('organization_id').notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Export types
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
```

2. **Generate Migration**:
```bash
npm run db:generate
```

3. **Review SQL** in `drizzle/migrations/`

4. **Apply Migration**:
```bash
npm run db:migrate
```

## Common Query Patterns

**Find Many**:
```typescript
const projects = await db.query.projects.findMany({
  where: eq(projects.organizationId, orgId),
  orderBy: [desc(projects.createdAt)],
  limit: 10,
})
```

**Find First**:
```typescript
const project = await db.query.projects.findFirst({
  where: eq(projects.id, projectId),
})
```

**With Relations**:
```typescript
const project = await db.query.projects.findFirst({
  where: eq(projects.id, projectId),
  with: {
    organization: true,
    members: true,
  },
})
```

**Insert**:
```typescript
const [project] = await db.insert(projects)
  .values({
    name: 'New Project',
    organizationId: 'org-id',
  })
  .returning()
```

**Update**:
```typescript
const [updated] = await db.update(projects)
  .set({ name: 'Updated Name', updatedAt: new Date() })
  .where(eq(projects.id, projectId))
  .returning()
```

**Delete**:
```typescript
await db.delete(projects)
  .where(eq(projects.id, projectId))
```

**Transaction**:
```typescript
await db.transaction(async (tx) => {
  const [project] = await tx.insert(projects).values({...}).returning()
  await tx.insert(memberships).values({...})
})
```

## Schema Modification Workflow

1. Update schema file
2. Generate migration: `npm run db:generate`
3. Review generated SQL
4. Apply migration: `npm run db:migrate`
5. Update types are automatically inferred

## Common Issues

**Migration Failed**: Check SQL in migration file, may need manual fix
**Type Errors**: Regenerate types with `npm run db:generate`
**Slow Queries**: Add indexes to frequently queried columns
