---
name: shadcn-mobile-first
description: Mobile-first design patterns with shadcn/ui including responsive layouts, touch interactions, and mobile navigation
allowed-tools: Read, Write, Edit, Bash
---

# shadcn/ui Mobile-First Patterns

Mobile-first responsive design patterns with shadcn/ui components.

## Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet form
```

## Responsive Layout

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {/* Cards */}
  </div>
</div>
```

## Mobile Navigation

```tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-4">
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">About</Button>
        <Button variant="ghost">Contact</Button>
      </nav>

      {/* Mobile Nav */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <nav className="flex flex-col space-y-4 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              About
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Contact
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

## Responsive Typography

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Heading
</h1>
<p className="text-sm sm:text-base md:text-lg text-muted-foreground">
  Body text
</p>
```

## Touch-Friendly Buttons

```tsx
{/* Minimum 44x44px touch target */}
<Button className="min-h-[44px] min-w-[44px]">
  Tap Me
</Button>

{/* Icon buttons */}
<Button size="icon" className="h-11 w-11">
  <Icon className="h-5 w-5" />
</Button>
```

## Responsive Dialog/Sheet

```tsx
'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function ResponsiveModal({ open, onOpenChange, children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">{children}</SheetContent>
    </Sheet>
  )
}
```

## Mobile Form

```tsx
<Form {...form}>
  <form className="space-y-4">
    {/* Full width inputs on mobile */}
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="you@example.com"
              className="text-base" // Prevent zoom on iOS
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Full width button on mobile, auto on desktop */}
    <Button type="submit" className="w-full md:w-auto">
      Submit
    </Button>
  </form>
</Form>
```

## Responsive Grid Cards

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <Card key={item.id} className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full sm:w-auto">Action</Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

## useMediaQuery Hook

```typescript
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

## Responsive Spacing

```tsx
{/* Increasing spacing on larger screens */}
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Content */}
</div>

{/* Padding */}
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

## Mobile-First Checklist

- [ ] Touch targets ≥ 44x44px
- [ ] Text inputs `text-base` (prevents iOS zoom)
- [ ] Test on actual devices
- [ ] Horizontal scrolling avoided
- [ ] Navigation accessible on mobile
- [ ] Forms easy to fill on mobile
- [ ] Images responsive with next/image
