---
name: vercel-edge-deployment
description: Patterns for deploying to Vercel Edge Runtime including middleware, edge functions, and configuration
allowed-tools: Read, Write, Edit, Bash
---

# Vercel Edge Deployment Patterns

Quick patterns for deploying code to Vercel's Edge Runtime.

## Edge API Route

```typescript
// app/api/hello/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'World'

  return Response.json({ message: `Hello, ${name}!` })
}
```

## Edge Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Runs on every request
  const response = NextResponse.next()

  // Add custom header
  response.headers.set('x-custom-header', 'value')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

## Auth Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
```

## Geolocation

```typescript
// app/api/location/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country')
  const city = request.headers.get('x-vercel-ip-city')
  const region = request.headers.get('x-vercel-ip-country-region')

  return Response.json({
    country: country || 'Unknown',
    city: city || 'Unknown',
    region: region || 'Unknown',
  })
}
```

## Rate Limiting

```typescript
import { kv } from '@vercel/kv'

export const runtime = 'edge'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const key = `rate-limit:${ip}`

  const requests = await kv.incr(key)

  if (requests === 1) {
    await kv.expire(key, 60) // 60 seconds window
  }

  if (requests > 10) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Process request...
  return Response.json({ success: true })
}
```

## Edge Config (Feature Flags)

```typescript
import { get } from '@vercel/edge-config'

export const runtime = 'edge'

export async function GET() {
  const featureFlags = await get('featureFlags')
  const isNewFeatureEnabled = featureFlags?.newFeature || false

  return Response.json({ isNewFeatureEnabled })
}
```

## Streaming Response

```typescript
export const runtime = 'edge'

export async function GET() {
  const encoder = new TextEncoder()

  const customReadable = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`Chunk ${i}\n`))
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      controller.close()
    },
  })

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
```

## A/B Testing

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const variant = request.cookies.get('ab-variant')?.value

  if (!variant) {
    const newVariant = Math.random() < 0.5 ? 'A' : 'B'
    const response = NextResponse.next()
    response.cookies.set('ab-variant', newVariant)

    if (request.nextUrl.pathname === '/landing') {
      return NextResponse.rewrite(
        new URL(`/landing-${newVariant.toLowerCase()}`, request.url)
      )
    }

    return response
  }

  return NextResponse.next()
}
```

## Environment Variables

```typescript
// Edge runtime only supports process.env

export const runtime = 'edge'

export async function GET() {
  return Response.json({
    publicKey: process.env.NEXT_PUBLIC_API_KEY,
    // Do NOT expose secret keys!
  })
}
```

## Deployment Checklist

- [ ] `export const runtime = 'edge'` in route files
- [ ] No Node.js APIs used (fs, path, etc.)
- [ ] Bundle size < 1MB
- [ ] Environment variables configured in Vercel dashboard
- [ ] Middleware matcher configured correctly
- [ ] Test in preview deployment
- [ ] Monitor edge function logs

## Common Issues

**Node.js API Error**: Use Web APIs only at edge
**Bundle Too Large**: Remove heavy dependencies
**Timeout**: Edge functions have CPU time limits
**CORS**: Set proper headers for API routes
