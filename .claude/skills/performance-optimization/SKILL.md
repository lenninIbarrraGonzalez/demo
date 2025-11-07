---
name: performance-optimization
description: Performance optimization checklist for Next.js including image optimization, code splitting, caching, and Core Web Vitals
allowed-tools: Read, Write, Edit, Bash
---

# Performance Optimization Checklist

Quick wins for Next.js performance on Vercel.

## Image Optimization

```tsx
import Image from 'next/image'

// ✅ Correct
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Above fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ Avoid
<img src="/hero.jpg" alt="Hero" />
```

## Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function Layout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## Code Splitting (Dynamic Imports)

```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy component
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if not needed for SEO
})

export function Dashboard() {
  return <HeavyChart data={data} />
}
```

## Suspense Boundaries

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header /> {/* Renders immediately */}
      <Suspense fallback={<Loading />}>
        <SlowDataComponent /> {/* Streams in */}
      </Suspense>
    </>
  )
}
```

## Caching Strategies

**Static Data (ISR)**:
```typescript
// Revalidate every hour
export const revalidate = 3600

export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 },
  })

  return <div>{/* Render */}</div>
}
```

**Dynamic Data**:
```typescript
// Never cache
export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  })

  return <div>{/* Render */}</div>
}
```

## Third-Party Scripts

```tsx
import Script from 'next/script'

export function Layout() {
  return (
    <>
      {children}
      <Script
        src="https://analytics.example.com/script.js"
        strategy="lazyOnload" // Loads after interactive
      />
    </>
  )
}
```

## Bundle Analysis

```bash
# Install
npm install -D @next/bundle-analyzer

# Add to next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

# Run
ANALYZE=true npm run build
```

## React Server Components

```tsx
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <ServerComponent data={data} />
}

// ✅ Client Component (when needed)
'use client'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## Lighthouse Optimization

**next.config.ts**:
```typescript
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}
```

## Vercel Analytics

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Performance Checklist

**Images**:
- [ ] Use Next.js Image component
- [ ] Set width and height
- [ ] Use `priority` for above-fold images
- [ ] Use modern formats (AVIF, WebP)
- [ ] Implement blur placeholder

**Fonts**:
- [ ] Use next/font
- [ ] Set display: swap
- [ ] Subset fonts
- [ ] Preload critical fonts

**JavaScript**:
- [ ] Use Server Components by default
- [ ] Dynamic import heavy components
- [ ] Remove console.log in production
- [ ] Tree-shake unused code

**Loading**:
- [ ] Add Suspense boundaries
- [ ] Implement loading states
- [ ] Use skeleton screens
- [ ] Stream responses

**Caching**:
- [ ] Set revalidation times
- [ ] Use ISR for static content
- [ ] Cache static assets
- [ ] Set proper cache headers

**Core Web Vitals**:
- [ ] LCP < 2.5s
- [ ] FID/INP < 100ms
- [ ] CLS < 0.1

## Debugging Performance

```bash
# Local Lighthouse
npx lighthouse http://localhost:3000

# Vercel Speed Insights
# Check dashboard after deployment
```

## Common Issues

**Large Bundle**: Check with bundle analyzer
**Slow LCP**: Optimize largest image
**High CLS**: Set image/video dimensions
**Slow API**: Add caching, use edge functions
