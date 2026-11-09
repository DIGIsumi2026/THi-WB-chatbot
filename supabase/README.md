# Supabase database — Phase 2

Schema will contain:
- brands, categories, products and product_variants
- customers, conversations, messages, processed_message_ids
- inquiries, inquiry_items, quotations, orders and order_items
- support_tickets, staff_assignments, automation_jobs and audit_logs

V1 fulfillment is *showroom collection only*.
Source catalog does NOT contain live prices, stock quantities, or verified warranty terms.
No database migration is included in Phase 1 to avoid accidentally creating
insecure public tables before RLS and staff access policies are designed.
