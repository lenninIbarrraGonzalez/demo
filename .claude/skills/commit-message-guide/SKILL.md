---
name: commit-message-guide
description: Quick reference guide for writing concise, meaningful git commit messages following conventional commits and best practices
allowed-tools: Read, Bash
---

# Commit Message Guide

Quick reference for writing great commit messages.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code restructuring
- **perf**: Performance improvement
- **style**: Formatting, whitespace
- **test**: Add/update tests
- **docs**: Documentation
- **chore**: Deps, build, tooling
- **ci**: CI/CD changes

## Rules

1. **Subject line ≤ 72 characters**
2. **Use imperative mood** ("add" not "added")
3. **Don't end subject with period**
4. **Capitalize subject line**
5. **One logical change per commit**
6. **Be specific, not vague**

## Examples

### ✅ Good

```
feat(auth): add Google OAuth provider
fix(dashboard): prevent crash on missing user
refactor(api): extract validation to middleware
perf(db): add index on user_id column
docs: update authentication guide
test(auth): add login integration tests
chore: upgrade Next.js to v16
style(button): fix indentation
```

### ❌ Bad

```
updated stuff
fixed bug
changes
WIP
asdfasdf
just added a feature
simply fixed the issue
Updated code and stuff
```

## Common Patterns

**Adding Features**:
```
feat(auth): add password reset flow
feat(dashboard): add project filtering
feat(api): add rate limiting
```

**Fixing Bugs**:
```
fix(login): handle invalid credentials correctly
fix(profile): prevent duplicate email updates
fix(api): validate organization access
```

**Refactoring**:
```
refactor(auth): simplify session validation
refactor(db): consolidate query helpers
refactor(ui): extract common button styles
```

**Performance**:
```
perf(api): cache user permissions
perf(db): optimize project query with index
perf(ui): lazy load heavy components
```

**Documentation**:
```
docs: add API authentication examples
docs: update deployment instructions
docs(readme): add troubleshooting section
```

**Tests**:
```
test(auth): add OAuth flow tests
test(api): add rate limiting tests
test(e2e): add project creation flow
```

## Scopes

Use scopes to indicate which part of the codebase changed:

- `(auth)` - Authentication
- `(db)` - Database
- `(api)` - API routes
- `(ui)` - UI components
- `(dashboard)` - Dashboard pages
- `(settings)` - Settings pages
- `(billing)` - Billing features
- `(ci)` - CI/CD
- `(deps)` - Dependencies

## Body Guidelines

Add a body when:
- Change needs context (why, not what)
- Breaking change
- Complex change requiring explanation

```
feat(api): migrate to Edge Runtime

Moves critical API routes to Edge Runtime for lower latency.
Routes now run globally at the edge instead of centralized
regions.

BREAKING CHANGE: Some Node.js APIs no longer available.
```

## Breaking Changes

Mark with `!` and explain in footer:

```
feat(auth)!: remove password authentication

BREAKING CHANGE: Password auth removed. Users must use OAuth.
Migration guide: https://docs.example.com/oauth-migration
```

## Multi-File Changes

When multiple files change for one logical purpose:

```
feat(org): add organization invitation system

- Add invitation model and schema
- Implement email notifications
- Create accept/decline flows
- Add invitation management UI
```

## Quick Checklist

Before committing, ask:
- [ ] Subject ≤ 72 characters?
- [ ] Imperative mood? (add, fix, not added, fixed)
- [ ] Specific, not vague?
- [ ] No filler words? (just, simply, basically)
- [ ] Single logical change?
- [ ] Type appropriate? (feat, fix, etc.)
- [ ] Scope included if relevant?

## When to Split Commits

Split if commit includes:
- Multiple unrelated changes
- Feature + unrelated bug fix
- Refactor + new feature
- Multiple features

Each should be its own commit for clearer history.

## Anti-Patterns

**Too Vague**:
```
❌ update code
❌ fix bug
❌ changes
✅ fix(auth): validate session expiry correctly
```

**Too Detailed**:
```
❌ fix: change if statement to switch case in user validation
✅ fix: improve user validation logic
```

**Wrong Tense**:
```
❌ added user authentication
❌ fixing the bug
✅ add user authentication
✅ fix login redirect bug
```

**Filler Words**:
```
❌ just add simple feature
❌ simply fix small bug
✅ add user export feature
✅ fix profile image upload
```

## Commit Message Template

Save this in `.gitmessage`:
```
# <type>(<scope>): <subject>
# |<----  ≤72 chars  ---->|

# Body: Why this change was made
# |<----  Wrap at 72 chars  ---->|

# Footer: Breaking changes, issue refs
# BREAKING CHANGE: description
# Fixes #123

# Types: feat, fix, refactor, perf, style, test, docs, chore, ci
# Scopes: auth, db, api, ui, dashboard, settings, billing
```

Configure git to use it:
```bash
git config commit.template .gitmessage
```
