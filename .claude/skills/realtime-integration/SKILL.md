---
name: realtime-integration
description: Patterns for implementing Supabase Realtime features including database subscriptions, presence tracking, and broadcast messaging
allowed-tools: Read, Write, Edit
---

# Realtime Integration Patterns

Quick patterns for Supabase Realtime in Client Components.

## Database Change Subscription

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useRealtimeProjects(organizationId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`projects:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Project>) => {
          if (payload.eventType === 'INSERT') {
            setProjects((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, supabase])

  return projects
}
```

## Presence Tracking

```typescript
'use client'

export function usePresence(roomId: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(Object.keys(state))
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [roomId, userId, supabase])

  return onlineUsers
}
```

## Broadcast Messaging

```typescript
'use client'

type Message = {
  userId: string
  text: string
  timestamp: string
}

export function useBroadcast(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase.channel(channelName)

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, supabase])

  const sendMessage = async (message: Omit<Message, 'timestamp'>) => {
    const channel = supabase.channel(channelName)
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        ...message,
        timestamp: new Date().toISOString(),
      },
    })
  }

  return { messages, sendMessage }
}
```

## Optimistic Updates

```typescript
'use client'

export function useOptimisticProject() {
  const [project, setProject] = useState<Project | null>(null)
  const [originalProject, setOriginalProject] = useState<Project | null>(null)

  const updateProject = async (updates: Partial<Project>) => {
    if (!project) return

    // Save original
    setOriginalProject(project)

    // Optimistic update
    setProject({ ...project, ...updates })

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id)

      if (error) throw error
    } catch (error) {
      // Revert on error
      setProject(originalProject)
      console.error('Update failed:', error)
    }
  }

  return { project, setProject, updateProject }
}
```

## Collaborative Cursors

```typescript
'use client'

type CursorPosition = { x: number; y: number; userId: string }

export function useCollaborativeCursors(roomId: string) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase.channel(`cursors:${roomId}`)

    channel
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        setCursors((prev) => new Map(prev).set(payload.userId, payload))
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setCursors((prev) => {
          const next = new Map(prev)
          leftPresences.forEach((p) => next.delete(p.user_id))
          return next
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  const updateCursor = (x: number, y: number, userId: string) => {
    const channel = supabase.channel(`cursors:${roomId}`)
    channel.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: { x, y, userId },
    })
  }

  return { cursors, updateCursor }
}
```

## Best Practices

1. **Always cleanup**: Unsubscribe when component unmounts
2. **Use filters**: Reduce event volume with SQL filters
3. **Debounce frequent updates**: Especially for cursor/mouse events
4. **Handle connection state**: Show online/offline status
5. **Error handling**: Handle subscription errors gracefully
