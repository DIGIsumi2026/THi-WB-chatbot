# Supabase — Catalog Phase

Run `migrations/001_catalog.sql` in your Supabase SQL editor.
Then run `npm run import:catalog` inside `backend/` to load the 86 catalog records.
Optionally run `npm run upload:images` for public, PDF-cropped product thumbnails.

The schema enables Row Level Security and doesn't grant anonymous or authenticated browser roles direct access. The local Node.js backend accesses products using a server-only service-role key. Never embed that key in React.

Later migrations will define customers, sessions, inquiries, quotations, staff accounts, orders, and fine-grained staff authorizations.
