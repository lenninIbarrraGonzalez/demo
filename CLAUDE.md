# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 SaaS template project using the App Router architecture, TypeScript, React 19, and Tailwind CSS v4.

## Development Commands

**Start development server:**
```bash
npm run dev
```
Server runs at http://localhost:3000 with hot reload enabled.

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

**Lint code:**
```bash
npm run lint
```

## Project Structure

- **`app/`** - Next.js App Router directory
  - `layout.tsx` - Root layout with font configuration (Geist Sans and Geist Mono)
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind v4 imports and CSS custom properties
  - `favicon.ico` - Site favicon
- **`public/`** - Static assets (SVG icons and images)
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration with path aliases (`@/*` maps to root)
- **`eslint.config.mjs`** - ESLint flat config with Next.js presets
- **`postcss.config.mjs`** - PostCSS config for Tailwind v4

## Key Technologies

- **Next.js 16** with App Router
- **React 19** (including react-dom)
- **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **ESLint 9** with Next.js config (core-web-vitals + TypeScript)
- **next/font** for optimized Google Fonts (Geist family)

## Architecture Notes

- Uses Next.js App Router with file-based routing in `app/` directory
- Server Components by default (add `"use client"` for Client Components)
- Metadata is exported from `layout.tsx` for SEO
- Font variables are applied via CSS custom properties in the root layout
- Tailwind v4 uses `@theme inline` in `globals.css` for theme configuration
- Path alias `@/*` allows importing from project root (e.g., `import { foo } from '@/lib/utils'`)
- Dark mode support via `prefers-color-scheme` media query in globals.css

## TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- Path aliases: `@/*` resolves to project root
- JSX: react-jsx (automatic runtime)
- Module resolution: bundler

## Custom Subagents & Skills

This template includes a comprehensive subagent system in `.claude/` for specialized assistance when building SaaS features.

### Subagents (`.claude/agents/`)

Specialized AI agents that are automatically invoked by Claude Code based on task context:

**Database & Backend**:
- `supabase-auth-expert` - Supabase authentication flows, session management, OAuth
- `drizzle-schema-expert` - Database schema design, migrations, type-safe queries
- `rls-security-expert` - Row-level security policies for multi-tenant data isolation
- `realtime-sync-expert` - Supabase Realtime subscriptions, presence, broadcast
- `multi-tenancy-architect` - Organization/workspace patterns, invitations, roles

**Frontend & UI**:
- `shadcn-designer` - Mobile-first UI with shadcn/ui, responsive design, accessibility
- `pwa-specialist` - Progressive Web App features, offline support, service workers

**Deployment & Performance**:
- `vercel-edge-expert` - Edge Runtime, middleware, geo-routing, edge functions
- `vercel-optimization-expert` - Performance optimization, Core Web Vitals, caching
- `api-routes-expert` - Server Actions, API routes, validation, error handling

**Quality & Type Safety**:
- `type-safety-expert` - End-to-end TypeScript type safety, Zod validation
- `testing-specialist` - Unit, integration, E2E tests with Vitest and Playwright

**Development Workflow**:
- `commit-writer` - Concise, meaningful git commit messages without filler

### Skills (`.claude/skills/`)

Lightweight instruction sets that Claude discovers contextually:

- `supabase-auth-patterns` - Quick auth patterns and code snippets
- `drizzle-workflows` - Common database workflows and migration steps
- `rls-policy-templates` - SQL policy templates for multi-tenant security
- `realtime-integration` - Realtime subscription patterns and hooks
- `shadcn-mobile-first` - Mobile-first responsive design patterns
- `pwa-checklist` - PWA implementation checklist and setup guide
- `vercel-edge-deployment` - Edge deployment patterns and configuration
- `performance-optimization` - Performance optimization checklist
- `multi-tenant-patterns` - Multi-tenancy implementation patterns
- `type-safety-patterns` - TypeScript and Zod type safety patterns
- `api-best-practices` - API design best practices and examples
- `saas-testing-guide` - Testing setup and patterns for SaaS
- `commit-message-guide` - Quick reference for writing great commit messages

### Using Subagents and Skills

Subagents and skills are automatically invoked based on your task description. For example:

- "Add authentication" → `supabase-auth-expert` will assist
- "Create a multi-tenant database schema" → `drizzle-schema-expert` and `multi-tenancy-architect` will help
- "Optimize page load time" → `vercel-optimization-expert` will provide guidance
- "Make this mobile-friendly" → `shadcn-designer` will help with responsive design
- "Write a commit message for my changes" → `commit-writer` will analyze changes and create a concise message

You don't need to explicitly call them; Claude Code will automatically use the most relevant agents and skills based on your request.
