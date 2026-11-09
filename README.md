# THi WhatsApp Chatbot — Phase 2: Supabase Catalog + Natural Language Search

A local-first WhatsApp chatbot for **THi — Tech Without Limits**, using an existing Baileys QR session and a Supabase PostgreSQL database.

## What this version does

- Includes **all 86 numbered catalog entries** from the supplied 47-page THi Product Catalog.
- Stores brand, category, product name, optional model number, optional internal product code, technical specifications, source PDF page, and search tags.
- Stores **price and stock as unverified** until confirmed by staff; no fake prices or availability.
- Supports natural messages such as `Bluetooth speaker`, `gaming mouse`, `air fryer`, `43 inch TV`, `FONENG headphones`, and `How much is D220?`.
- Returns up to five matching products with specification previews, with `MORE` for additional results. Type a model like `D220` for full details.
- Can display catalog-cropped product image thumbnails **if** you run the optional image upload.
- Still replies to greeting, location, staff, and warranty commands.
- Does **not** collect delivery information. **Showroom collection only.**

## IMPORTANT: Do not lose your current QR connection

Your live Baileys session is stored in `backend/sessions/` (or the path set by `SESSION_DIR`).

1. **Stop** the running bot (`Ctrl+C`).
2. Make a **private offline backup** of your `backend/sessions/` folder and your local `backend/.env` file.
3. Replace the code files with this Phase 2 starter. **Do not overwrite or delete the existing session folder or `.env`**.
4. Start the bot again using the **same `SESSION_DIR`**. If the WhatsApp session remains valid, it should reconnect without scanning a new QR code.

Never upload session backups, `.env`, or your Supabase service-role key to GitHub.

## Prerequisites

- Node.js >= 20 (Node 22 LTS recommended).
- Existing working Baileys-based local QR connection.
- New/available [Supabase](https://supabase.com) project (free tier can be used for the prototype).
- Windows PowerShell or another terminal.

## Step 1 — Create database tables and search function

1. Open **Supabase Dashboard → your project → SQL Editor**.
2. Open `supabase/migrations/001_catalog.sql` from this project.
3. Paste and run the **entire SQL file once**.
4. Open **Table Editor** and confirm there is a `public.products` table.

The migration enables RLS and deliberately does not permit anonymous browser access. Only the server-side key will access products in this phase.

## Step 2 — Configure backend secrets

Open `backend/.env` (create from `.env.example` if it doesn't exist).

```env
BOT_ENABLED=true
SESSION_DIR=./sessions/thi-local
LOG_LEVEL=warn
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVER-SIDE-SECRET-KEY
BOT_ALLOWED_CONTACTS=947XXXXXXXX
```

Find the project URL and **service_role / server-side secret** in Supabase Project Settings → API keys. Never use the service-role key in the frontend, GitHub, screenshots, or chats.

`BOT_ALLOWED_CONTACTS` is an allowlist for testing, separated by commas. You may enter a number in country-code format without `+` or the complete WhatsApp sender JID (e.g. `947XXXXXXXX@s.whatsapp.net`). On accounts that use `@lid`, send a test message and copy the *complete blocked JID* printed in the backend terminal into the allowlist. **If the allowlist is blank, the bot will reply to nobody**, protecting your other contacts.

## Step 3 — Install dependencies

```powershell
cd backend
npm install
npm run check:seed
```

You should see 86 products in the local catalog JSON file.

## Step 4 — Import all 86 catalog products to Supabase

```powershell
npm run import:catalog
```

Expected output: `✅ Catalog import complete. Database row count: 86` on a new database.

This is an **insert-only importer**. Running it again does not overwrite existing staff-edited catalog records, prices or stock values.

In Supabase SQL Editor, verify:

```sql
SELECT count(*) FROM public.products;
SELECT catalog_item_no, brand, name, model, product_code
FROM public.products ORDER BY catalog_item_no;
```

Catalog item number is the printed index (1–86), **not a physical product serial number**. `model` and `product_code` are separate fields. Some products do not have a distinct manufacturer model or internal code in the source PDF; these remain NULL rather than invented.

## Step 5 — Optional: Upload the 86 catalog image crops

The project includes `backend/data/catalog-images/001.jpg` through `086.jpg`. These are cropped from the uploaded PDF, **not original product photography**; review their quality and accuracy before using them with customers.

```powershell
npm run upload:images
```

This uploads the thumbnails into a public-readable `thi-catalog-images` storage bucket and saves each URL to the related `products` row. The backend sends one image with the full product details when a search matches one product, and falls back to text if media sending fails. Uploaded images are publicly accessible by URL; do not use these buckets for private customer data.

## Step 6 — Reuse your existing QR session and test

```powershell
npm run dev
```

From an **allowlisted test WhatsApp number**, try:

| Message | Expected behavior |
|---|---|
| `hi` | New THi natural-search welcome message |
| `Bluetooth speaker` | List W-KING speaker matches with short specs |
| `MORE` | Show next batch of speaker matches |
| `D220` | Detailed specifications, price/stock status and optional image |
| `How much is the D220?` | Lookup D220 and show verified price or staff confirmation required |
| `Air fryer` | Find Winning Star air fryer ST-9696 |
| `Gaming mouse` | Show multiple R8 gaming mouse models |
| `43 inch TV` | Find THi 43-inch TV |
| `FONENG headphones` | Show compatible FONENG headphone entries |
| `showroom` | Show address and contact details |
| `delivery` | Explain showroom collection only |

## Step 7 — Verify code

```powershell
npm run check
npm test
npm run build
```

The tests cover query normalization and verified price/stock labels. SQL search, media delivery and WhatsApp session behavior must be verified using your real Supabase project and test account.

## Database fields

| Field | Description |
|---|---|
| `catalog_item_no` | Original catalog entry number (1–86), not a serial number |
| `brand`, `category`, `name` | Display and grouping |
| `model` | Manufacturer model, where supplied |
| `product_code` | Separate internal stock/catalog code, where supplied |
| `specifications` | Product specifications extracted from the PDF |
| `tags`, `search_text` | Search terms and synonyms, used by database search |
| `image_url` | Optional catalog thumbnail URL |
| `price_lkr`, `price_verified_at` | Null until staff enters and verifies a price |
| `availability_status` | Defaults to `unverified` |
| `stock_quantity` | Null until staff manages inventory |

## Current limitations

- Product names/specifications were extracted from a PDF, including visual inspection for the first eight TVs; **review before using for live customer communication**. Some catalog details may need supplier verification.
- Price, inventory, and warranty data are not provided in the catalog.
- The bot does not yet *create* sales inquiries, quotations, orders, or support tickets. It correctly directs those requests to showroom staff until the admin module is built.
- Conversation pagination state and duplicate-message suppression are process-local; durable database-backed state is planned for Phase 3.
- Search is keyword/phrase-based, **not AI**; it handles useful natural-language requests but is not a full semantic language model, nor does it guarantee matches for all spelling mistakes or Sinhala/Tamil variations.
- Baileys is **unofficial WhatsApp Web automation**; use a separate test account and avoid unsolicited outbound promotions. For customer-facing production and campaigns, plan a migration to the official WhatsApp Business Platform.

## Next phase

Admin portal: secure login, product and price management, inbound customer inbox, showroom-only purchase inquiries, staff-reviewed quotations, and order-status notifications.
