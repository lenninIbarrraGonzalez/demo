---
name: type-safety-patterns
description: TypeScript patterns for end-to-end type safety including Drizzle types, Zod validation, and type-safe Server Actions
allowed-tools: Read, Write, Edit
---

# Type Safety Patterns

Patterns for end-to-end type safety in Next.js with TypeScript.

## Drizzle Type Inference

```typescript
// lib/db/schema/projects.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: uuid('organization_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Infer types from schema
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

// With relations
export type ProjectWithOrg = Project & {
  organization: Organization
}
```

## Zod Validation + TypeScript

```typescript
import { z } from 'zod'

// Define schema
export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  organizationId: z.string().uuid(),
})

// Infer TypeScript type
export type CreateProjectInput = z.infer<typeof createProjectSchema>

// Use in Server Action
export async function createProject(input: CreateProjectInput) {
  // Validate at runtime
  const validated = createProjectSchema.parse(input)

  // validated is fully typed
  const project = await db.insert(projects).values(validated)
  return project
}
```

## Type-Safe Server Actions

```typescript
'use server'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function updateProject(
  id: string,
  input: Partial<CreateProjectInput>
): Promise<ActionResult<Project>> {
  try {
    const validated = createProjectSchema.partial().parse(input)

    const [project] = await db.update(projects)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()

    return { success: true, data: project }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      }
    }

    return { success: false, error: 'Update failed' }
  }
}
```

## Branded Types

```typescript
// lib/types/branded.ts
declare const brand: unique symbol

export type Brand<T, TBrand extends string> = T & {
  [brand]: TBrand
}

export type UserId = Brand<string, 'UserId'>
export type OrganizationId = Brand<string, 'OrganizationId'>
export type ProjectId = Brand<string, 'ProjectId'>

// Constructor functions
export function toUserId(id: string): UserId {
  if (!id) throw new Error('Invalid user ID')
  return id as UserId
}

// Usage prevents mixing IDs
function getProject(projectId: ProjectId): Promise<Project> {
  // ...
}

const userId: UserId = toUserId('user-123')
// getProject(userId) // TypeScript error!
```

## Type-Safe Form with React Hook Form

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validation'

export function ProjectForm() {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationId: '',
    },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    // data is fully typed
    const result = await createProject(data)

    if (!result.success) {
      // Handle errors
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof CreateProjectInput, {
            message: messages[0],
          })
        })
      }
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} />
}
```

## Type-Safe API Client

```typescript
// lib/api/client.ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`/api${endpoint}`)
  const json = await response.json()

  if (!response.ok) {
    return { ok: false, error: json.error || 'Request failed' }
  }

  return { ok: true, data: json }
}

// Usage with type inference
const result = await apiGet<Project[]>('/projects')

if (result.ok) {
  console.log(result.data) // Project[]
} else {
  console.error(result.error) // string
}
```

## Utility Types

```typescript
// lib/types/utils.ts

// Make specific fields optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific fields required
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

// Extract async function return type
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : never

// Usage
type ProjectWithoutTimestamps = Optional<Project, 'createdAt' | 'updatedAt'>
type GetProjectResult = AsyncReturnType<typeof getProject>
```

## Environment Variables Typing

```typescript
// env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)

// Usage: env.DATABASE_URL is typed and validated
```

## Type Guards

```typescript
// lib/types/guards.ts
export function isProject(value: unknown): value is Project {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'organizationId' in value
  )
}

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

// Usage
function processData(data: unknown) {
  if (isProject(data)) {
    // data is typed as Project
    console.log(data.name)
  }
}
```

## Discriminated Unions

```typescript
// lib/types/result.ts
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Usage
export async function getProject(id: string): Promise<Result<Project>> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  })

  if (!project) {
    return err('Project not found')
  }

  return ok(project)
}

// Client usage
const result = await getProject(id)

if (result.ok) {
  console.log(result.value.name) // Project
} else {
  console.error(result.error) // string
}
```

## Type Safety Checklist

- [ ] TypeScript strict mode enabled
- [ ] Database types inferred from Drizzle
- [ ] All inputs validated with Zod
- [ ] Server Actions have proper return types
- [ ] Forms use zodResolver
- [ ] No `any` types in codebase
- [ ] Environment variables typed
- [ ] API responses properly typed
- [ ] Type guards for runtime checks
- [ ] Utility types for common patterns
