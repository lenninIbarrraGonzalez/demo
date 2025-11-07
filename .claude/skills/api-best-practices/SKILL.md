---
name: api-best-practices
description: Best practices for Next.js API routes and Server Actions including validation, error handling, authentication, and response formats
allowed-tools: Read, Write, Edit
---

# API Best Practices

Best practices for building robust APIs in Next.js.

## Server Action with Validation

```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
})

export async function createUser(formData: FormData) {
  // 1. Validate input
  const result = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!result.success) {
    return {
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  // 2. Check authentication
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  // 3. Perform action
  try {
    const user = await db.insert(users).values(result.data)

    // 4. Revalidate cache
    revalidatePath('/users')

    return { success: true, user }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { error: 'Failed to create user' }
  }
}
```

## Route Handler Pattern

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get query params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    // 3. Query data
    const projects = await db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    })

    // 4. Return response
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate
    const result = createProjectSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.errors,
        },
        { status: 400 }
      )
    }

    // Create
    const [project] = await db.insert(projects)
      .values(result.data)
      .returning()

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Consistent Error Handling

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// Usage
export async function GET(request: NextRequest) {
  try {
    if (!authorized) {
      throw new ApiError('Access denied', 403, 'FORBIDDEN')
    }

    // ... rest of handler
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Rate Limiting

```typescript
// lib/api/rate-limit.ts
import { kv } from '@vercel/kv'

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
) {
  const key = `rate-limit:${identifier}`
  const current = await kv.incr(key)

  if (current === 1) {
    await kv.expire(key, window)
  }

  return {
    success: current <= limit,
    limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + window * 1000,
  }
}

// Usage in route
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitResult = await rateLimit(ip, 5, 60)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    )
  }

  // Continue with request
}
```

## Pagination

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const [items, [{ count }]] = await Promise.all([
    db.query.projects.findMany({ limit, offset }),
    db.select({ count: count() }).from(projects),
  ])

  return NextResponse.json({
    data: items,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  })
}
```

## File Upload

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  // Upload to storage
  const supabase = createServerClient()
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file)

  if (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.path }, { status: 201 })
}
```

## Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckout(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object)
      break
    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
```

## HTTP Status Codes

- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (no access)
- **404**: Not Found
- **429**: Too Many Requests
- **500**: Internal Server Error

## API Checklist

- [ ] All inputs validated with Zod
- [ ] Authentication checked
- [ ] Authorization verified
- [ ] Try-catch for error handling
- [ ] Consistent response format
- [ ] Appropriate status codes
- [ ] Rate limiting on public endpoints
- [ ] Logging (no sensitive data)
- [ ] Database queries optimized
- [ ] Tests written
