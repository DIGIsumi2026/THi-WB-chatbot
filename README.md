# THi WhatsApp Chatbot — Local Starter (Phase 1)

**Goal:** Local QR-code connection, session persistence, basic THi menu and sample product lookup.

**V1 rule:** No delivery services. Purchase inquiries will become *showroom collection only* after staff confirmation.

## Prerequisites

- Node.js 22 LTS recommended (Baileys documentation requires Node.js 20+)
- npm and VS Code
- A dedicated **test WhatsApp number**, not the showroom's main business number

## Run on Windows (PowerShell)

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

When a QR code appears in the terminal, open WhatsApp on your test phone → **Linked Devices** → **Link a Device**, and scan it.

Send messages to that WhatsApp number from a *second WhatsApp account*:
- `hi` or `menu`
- `1` (Browse Categories)
- `3` (Kitchen Cookware & Food Prep; from the categories screen)
- `ST-9696`
- `D220`
- `BL59`

Use `npm test` to run local chatbot logic tests.

Use `npm run build` to compile or `npm run start` to run a compiled build.

## Included functionality

- QR connection via Baileys v7.0.0-rc14
- Authentication saved in `backend/sessions/` (excluded from Git)
- Reconnect with backoff, except when explicitly logged out
- Filters own messages, group chats, status broadcasts and history sync
- In-memory recent-message deduplication
- Basic stateful menus and direct product search
- Small **illustrative subset** of catalog products with verified specifications
- No invented prices, availability, warranty, or payment claims

## Not yet included

- Supabase connection, full PDF catalog import
- Persistent conversation history
- Purchase inquiry/quote/order creation
- Admin UI and human takeover
- Scheduled outbound notifications
- Production queue, durable deduplication, monitoring or audit logs

These are subsequent phases. The in-memory conversation states reset when Node.js restarts.

## Security

- **Do not commit or share `backend/sessions/`.** It contains WhatsApp login credentials and cryptographic session keys.
- Use only a dedicated test WhatsApp account.
- Do not send unsolicited promotions or bulk automated messages using Baileys.
- Baileys is an unofficial WhatsApp Web integration. It may disconnect, lose authorization or be restricted.
- Do not expose the bot's session files through an admin API or serve them publicly.

## Future phases

1. Database tables in Supabase for brands, categories, products, variants, customers, inquiries, quotations, orders and support.
2. Import and verify all 86 numbered catalog entries; ensure model numbers, product codes and variants are stored separately.
3. Replace in-memory state with persisted conversation states and message IDs.
4. Build a secure React admin portal and role-based staff access.
5. Add staff-reviewed quotes, showroom-collection orders and transactional updates.
6. Move to a VPS with persistent secured session storage. Keep exactly one active session owner.

The source catalog did not provide current selling prices, stock status, or warranty terms. Those must be maintained by showroom staff.
