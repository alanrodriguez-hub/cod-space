<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:db-migration-rules -->
# Database migrations

All new tables, policies, or schema changes must be added to `supabase/migration.sql`. Also keep a separate migration file (e.g., `migration_<feature>.sql`) as backup.
<!-- END:db-migration-rules -->
