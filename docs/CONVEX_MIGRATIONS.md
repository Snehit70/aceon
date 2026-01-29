# Convex Schema Migrations Guide

## Overview

Convex enforces strict schema validation at runtime. You **cannot** simply change the schema and deploy - if existing data doesn't match the new schema, deployment will fail. This guide documents the proper migration workflow.

## Key Principle

**Convex will reject schema changes if existing data doesn't match the new schema.**

This means:
- Removing a required field → FAILS (existing docs have that field)
- Making a field required → FAILS (existing docs might not have it)
- Removing a table → FAILS (table still has data)
- Changing field types → FAILS (existing data has wrong type)

## Exception: Optional Fields

**You CAN remove optional fields without migration** if:
- Field is `v.optional()`
- Field is never read/written in code
- No indexes depend on it

Convex ignores extra fields in documents that aren't in the schema. This is safe because:
```typescript
// Schema says: { name: string }
// Database has: { name: "John", oldField: "value" }
// Result: Works fine, oldField is ignored
```

**When to use this shortcut:**
- Dead fields that were never used
- Optional fields you added but never implemented
- Fields from abandoned features

**When NOT to use this shortcut:**
- Required fields (must migrate to optional first)
- Fields with indexes (must drop index first)
- Fields actively used in code (update code first)

## The Proper Migration Workflow

### Phase 1: Transition State (Make Schema Permissive)

**Goal**: Make schema accept both old and new data formats.

```typescript
// OLD SCHEMA (strict)
courses: defineTable({
  courseId: v.string(),  // Required
  code: v.string(),
  term: v.string(),      // Required
})

// TRANSITION SCHEMA (permissive)
courses: defineTable({
  courseId: v.optional(v.string()),  // ← Now optional
  code: v.string(),
  term: v.optional(v.string()),      // ← Now optional
})
```

**Actions**:
1. Make fields you want to remove `v.optional()`
2. Add new fields as `v.optional()`
3. Keep tables you want to delete (for now)
4. Deploy this transition schema: `bun x convex dev --once`

### Phase 2: Data Migration

**Goal**: Transform existing data to match the new schema.

#### Setup Migration Package

```bash
bun add @convex-dev/migrations
```

Create `convex/convex.config.ts`:
```typescript
import { defineApp } from "convex/server";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp();
app.use(migrations);

export default app;
```

#### Create Migration Functions

Create `convex/migrations.ts`:

```typescript
import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

export const migrations = new Migrations<DataModel>(components.migrations);

// Example 1: Remove fields from table
export const removeExtraFields = migrations.define({
  table: "courses",
  migrateOne: () => ({
    courseId: undefined,  // Remove field
    term: undefined,      // Remove field
  }),
});

// Example 2: Copy data between tables
export const migrateOldToNew = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oldRecords = await ctx.db.query("oldTable").collect();
    
    for (const record of oldRecords) {
      const existing = await ctx.db
        .query("newTable")
        .withIndex("by_key", (q) => q.eq("key", record.key))
        .first();
      
      if (!existing) {
        await ctx.db.insert("newTable", {
          key: record.key,
          value: record.value,
        });
      }
    }
    
    return { migrated: oldRecords.length };
  },
});

// Example 3: Delete all records from table
export const deleteOldTable = internalMutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("oldTable").collect();
    
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    
    return { deleted: records.length };
  },
});

// Create runner functions for CLI execution
export const runRemoveFields = migrations.runner(internal.migrations.removeExtraFields);
```

#### Run Migrations

```bash
# Deploy migration functions
bun x convex dev --once

# Run table-level migrations (uses batching, resumable)
bun x convex run migrations:runRemoveFields

# Monitor progress
bun x convex run --component migrations lib:getStatus '{"names": ["migrations:removeExtraFields"]}'

# Run simple mutations directly
bun x convex run migrations:migrateOldToNew
bun x convex run migrations:deleteOldTable
```

**Migration will process in batches of 100 by default. Large tables (2000+ docs) take time.**

### Phase 3: Final Schema (Strict)

**Goal**: Remove optional wrappers and deleted tables.

```typescript
// FINAL SCHEMA (strict again)
courses: defineTable({
  code: v.string(),      // Only fields we want
  title: v.string(),
})
// oldTable removed entirely
```

**Actions**:
1. Remove `v.optional()` from fields that should be required
2. Remove deleted tables from schema
3. Remove migration code that references deleted tables
4. Deploy: `bun x convex dev --once`

**This will only succeed if all data matches the new schema.**

## Common Pitfalls

### ❌ DON'T: Change schema and deploy immediately
```typescript
// Remove field from schema
courses: defineTable({
  code: v.string(),
  // courseId removed
})
```
**Result**: Deployment fails - existing docs have `courseId` field.

### ✅ DO: Use transition state
```typescript
// Step 1: Make optional
courses: defineTable({
  code: v.string(),
  courseId: v.optional(v.string()),
})
// Step 2: Migrate data
// Step 3: Remove from schema
```

### ❌ DON'T: Delete table from schema before deleting data
**Result**: Deployment fails - table still has records.

### ✅ DO: Delete data first, then remove from schema
```bash
bun x convex run migrations:deleteAllRecords
# Wait for completion
# Then remove table from schema.ts
```

### ❌ DON'T: Run migrations without runner functions
```bash
bun x convex run migrations:removeExtraFields  # Wrong - needs cursor
```

### ✅ DO: Use runner functions or provide cursor
```typescript
export const runIt = migrations.runner(internal.migrations.removeExtraFields);
```
```bash
bun x convex run migrations:runIt
```

## Migration Checklist

- [ ] **Backup data** (export from Convex dashboard or use backup script)
- [ ] **Create transition schema** (make fields optional, keep tables)
- [ ] **Deploy transition schema** (`bun x convex dev --once`)
- [ ] **Create migration functions** (`convex/migrations.ts`)
- [ ] **Deploy migrations** (`bun x convex dev --once`)
- [ ] **Run migrations** (CLI commands)
- [ ] **Verify data** (check Convex dashboard)
- [ ] **Update application code** (fix TypeScript errors)
- [ ] **Create final schema** (remove optional, remove tables)
- [ ] **Clean up migration code** (remove references to deleted tables)
- [ ] **Deploy final schema** (`bun x convex dev --once`)
- [ ] **Test application** (verify everything works)

## Example: Our Recent Migration

**Goal**: Remove dead fields, merge tables, delete unused tables.

### What We Changed
- Removed: `courses.courseId`, `courses.term`, `courses.forumUrl`, `courses.credits`
- Removed: `videos.isPublic`
- Merged: `studentProfile` + `userPreferences` → `users` table
- Deleted: `bookmarks`, `userPreferences`, `studentProfile` tables

### Steps Taken
1. Made all fields optional in transition schema
2. Added new fields to `users` table as optional
3. Deployed transition schema ✓
4. Created migration functions
5. Ran migrations:
   - `migrateStudentProfileToUsers` (2 records)
   - `removeCourseExtraFields` (22 courses)
   - `removeVideoIsPublic` (2002 videos)
   - `deleteAllUserPreferences` (0 records)
   - `deleteAllStudentProfiles` (2 records)
   - `deleteAllBookmarks` (2 records)
6. Updated application code (fixed TypeScript errors)
7. Removed deleted tables from schema
8. Cleaned up migration code
9. Deployed final schema ✓

**Total time**: ~30 minutes (mostly waiting for video migration)

## Useful Commands

```bash
# Check migration status
bun x convex run --component migrations lib:getStatus

# Cancel running migration
bun x convex run --component migrations lib:cancel '{"name": "migrations:myMigration"}'

# Dry run (test without committing)
bun x convex run migrations:runIt '{"dryRun": true}'

# Restart from beginning
bun x convex run migrations:runIt '{"cursor": null}'

# Export data (backup)
bun x convex export --path ./backups/backup-$(date +%Y%m%d-%H%M%S)
```

## Resources

- [Convex Migrations Component](https://github.com/get-convex/convex-helpers/tree/main/packages/migrations)
- [Migration Primer](https://stack.convex.dev/intro-to-migrations)
- [Migrating Data with Mutations](https://stack.convex.dev/migrating-data-with-mutations)
- [Lightweight Migrations](https://stack.convex.dev/lightweight-zero-downtime-migrations)
