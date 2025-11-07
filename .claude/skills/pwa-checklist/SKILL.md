---
name: pwa-checklist
description: Step-by-step checklist for implementing Progressive Web App features in Next.js including manifest, service workers, and offline support
allowed-tools: Read, Write, Edit, Bash
---

# PWA Implementation Checklist

Complete checklist for making your Next.js app a PWA.

## 1. Install next-pwa

```bash
npm install next-pwa
```

## 2. Configure Next.js

```typescript
// next.config.ts
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // Your existing Next.js config
})

export default nextConfig
```

## 3. Create Web App Manifest

```json
// public/manifest.json
{
  "name": "Your SaaS App",
  "short_name": "SaaS",
  "description": "Your app description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 4. Add Manifest to Layout

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Your SaaS App',
  },
}
```

## 5. Create Icons

Required sizes:
- **Android**: 192x192, 512x512 (maskable)
- **iOS**: 180x180 (apple-touch-icon.png)
- **Favicon**: 32x32, 16x16

Place in `public/icons/` directory.

## 6. Add Apple Touch Icon

```tsx
// app/layout.tsx (in <head>)
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

## 7. Create Install Prompt Component

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg">
      <p className="mb-2">Install our app for better experience</p>
      <Button onClick={handleInstall}>Install</Button>
    </div>
  )
}
```

## 8. Create Offline Page

```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">You're Offline</h1>
        <p className="text-muted-foreground">
          Please check your internet connection
        </p>
      </div>
    </div>
  )
}
```

## 9. Test PWA

1. **Build and Start**:
```bash
npm run build
npm start
```

2. **Open in Browser**: http://localhost:3000

3. **Run Lighthouse Audit**:
   - Open DevTools
   - Go to Lighthouse tab
   - Run PWA audit

4. **Test on Mobile**:
   - Use ngrok or similar for HTTPS
   - Test install prompt
   - Test offline functionality

## 10. PWA Checklist

- [ ] manifest.json created with all required fields
- [ ] Icons in required sizes (192x192, 512x512, 180x180)
- [ ] Manifest linked in layout
- [ ] Apple touch icon added
- [ ] Theme color set
- [ ] Service worker registered (next-pwa)
- [ ] HTTPS enabled (required for PWA)
- [ ] Install prompt component added
- [ ] Offline page created
- [ ] Tested on mobile devices
- [ ] Lighthouse PWA audit passed
- [ ] App works in standalone mode

## Debugging

**Check Service Worker**:
- DevTools → Application → Service Workers

**Check Manifest**:
- DevTools → Application → Manifest

**View Cache**:
- DevTools → Application → Cache Storage

**Common Issues**:
- **No install prompt**: HTTPS required, check manifest
- **Icons not showing**: Check file paths and sizes
- **Service worker not updating**: Clear cache, hard reload
