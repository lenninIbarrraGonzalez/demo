---
name: rls-policy-templates
description: Row Level Security policy templates for multi-tenant SaaS applications with organization-based access control
allowed-tools: Read, Write, Edit
---

# RLS Policy Templates

Common RLS policy patterns for multi-tenant SaaS applications.

## Enable RLS

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Organization-Scoped Access

**View Organization Data** (SELECT):
```sql
CREATE POLICY "Users can view org data"
ON projects FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM memberships
    WHERE user_id = auth.uid()
  )
);
```

**Create in Organization** (INSERT):
```sql
CREATE POLICY "Members can create in org"
ON projects FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM memberships
    WHERE user_id = auth.uid()
  )
);
```

**Update Organization Data** (UPDATE):
```sql
CREATE POLICY "Members can update org data"
ON projects FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id
    FROM memberships
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM memberships
    WHERE user_id = auth.uid()
  )
);
```

**Delete (Admin Only)** (DELETE):
```sql
CREATE POLICY "Admins can delete"
ON projects FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id
    FROM memberships
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);
```

## User-Owned Resources

```sql
CREATE POLICY "Users can manage own data"
ON profiles FOR ALL
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

## Public Read, Auth Write

```sql
-- Public read
CREATE POLICY "Public read access"
ON blog_posts FOR SELECT
USING (published = true);

-- Authenticated write
CREATE POLICY "Auth users can create"
ON blog_posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Owner can update
CREATE POLICY "Owners can update"
ON blog_posts FOR UPDATE
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());
```

## Helper Functions

**Check if User is Org Admin**:
```sql
CREATE OR REPLACE FUNCTION is_org_admin(org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships
    WHERE user_id = auth.uid()
    AND organization_id = org_id
    AND role IN ('admin', 'owner')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Usage
CREATE POLICY "Admins can delete"
ON projects FOR DELETE
USING (is_org_admin(organization_id));
```

## Testing Policies

```sql
-- Set user context
SET request.jwt.claims.sub = 'user-uuid';

-- Test query
SELECT * FROM projects; -- Should only see user's org projects

-- Reset
RESET request.jwt.claims.sub;
```

## Indexes for Performance

```sql
-- Index for policy lookups
CREATE INDEX memberships_user_org_idx
ON memberships(user_id, organization_id);

CREATE INDEX projects_org_idx
ON projects(organization_id);
```

## Complete Table Setup

```sql
-- 1. Create table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Members view" ON projects FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM memberships WHERE user_id = auth.uid()
));

CREATE POLICY "Members create" ON projects FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM memberships WHERE user_id = auth.uid()
));

CREATE POLICY "Members update" ON projects FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM memberships WHERE user_id = auth.uid()
))
WITH CHECK (organization_id IN (
  SELECT organization_id FROM memberships WHERE user_id = auth.uid()
));

CREATE POLICY "Admins delete" ON projects FOR DELETE
USING (organization_id IN (
  SELECT organization_id FROM memberships
  WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
));

-- 4. Add indexes
CREATE INDEX projects_org_idx ON projects(organization_id);
```
