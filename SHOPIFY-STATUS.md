# Shopify Integration Status — SikPix

## What's Connected

### Storefront API (Client-side)
- **Store:** `portraitive.myshopify.com`
- **API Version:** `2025-07`
- **Storefront Token:** `25ffbd89630ddf51a301deafcdd84ea0` (hardcoded in `src/lib/shopify.ts`)
- **Cart/Checkout:** Cart Create mutation exists in `src/lib/shopify.ts` but is NOT used for the main flow

### Draft Order API (Server-side — Primary Checkout Flow)
- **Edge Function:** `supabase/functions/create-draft-order/index.ts`
- **API Version:** `2025-01`
- **Auth:** Uses `SHOPIFY_ADMIN_TOKEN` from Supabase secrets (env var)
- **Flow:**
  1. User fills out `/create` form (style, bundle, add-ons, POD, photos, name/email)
  2. Photos uploaded to Supabase storage
  3. `createPortraitCheckout()` in `src/lib/shopify.ts` calls the edge function
  4. Edge function validates input (Zod), recalculates price server-side, creates a Shopify Draft Order
  5. Returns `invoice_url` which redirects customer to Shopify checkout
  6. Draft Order becomes a real order once paid

### Webhook: Order Paid
- **Edge Function:** `supabase/functions/shopify-order-webhook/index.ts`
- **Trigger:** Shopify `orders/paid` webhook
- **HMAC Verification:** Yes, via `SHOPIFY_WEBHOOK_SECRET` env var
- **Action:** Inserts paid orders into `portrait_orders` + `portrait_order_items` tables in Supabase
- **Extracts:** styles, digital add-ons, POD selections, bundle info, reference photo URLs, shipping address
- **Idempotent:** Yes, checks for duplicate `shopify_order_id`

### Admin Dashboard
- **Page:** `/admin` (`src/pages/AdminOrders.tsx`)
- **Reads from:** `portrait_orders` and `portrait_order_items` in Supabase
- **Shows:** order details, customer info, reference photos, POD status

## Required Environment Variables / Secrets

### In `.env` (client-side, Vite)
| Variable | Status | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Set | `https://akrntpszsujtsrhkxxxh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Set | Anon key present |

### In Supabase Edge Function Secrets
| Variable | Required By | Notes |
|---|---|---|
| `SHOPIFY_ADMIN_TOKEN` | `create-draft-order` | Shopify Admin API access token |
| `SHOPIFY_WEBHOOK_SECRET` | `shopify-order-webhook` | For HMAC signature verification |
| `SUPABASE_URL` | `shopify-order-webhook` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `shopify-order-webhook` | Auto-set by Supabase |

### Hardcoded (in source)
| Value | File | Notes |
|---|---|---|
| Storefront Token | `src/lib/shopify.ts:5` | Public token, OK to be in source |
| Store Domain | `src/lib/shopify.ts:3` | `portraitive.myshopify.com` |
| Variant ID | `src/lib/shopify.ts:65` | `gid://shopify/ProductVariant/56200788836700` (not used in draft order flow) |

## What's Missing / Needs Verification

1. **Shopify Webhook Registration** — The webhook handler exists but needs to be registered in Shopify Admin:
   - Go to Shopify Admin > Settings > Notifications > Webhooks
   - Add webhook for `Order payment` event
   - URL: `https://akrntpszsujtsrhkxxxh.supabase.co/functions/v1/shopify-order-webhook`
   - Format: JSON

2. **Supabase Tables** — Ensure these tables exist:
   - `portrait_orders` (shopify_order_id, shopify_order_number, customer_email, customer_name, total_price, currency, payment_status, pod_status, shipping_address, raw_payload)
   - `portrait_order_items` (order_id, shopify_line_item_id, title, quantity, unit_price, total_price, styles, digital_addons, pod_options, bundle_discount, properties)

3. **Gelato POD Integration** — POD options reference `fulfillmentService: "gelato"` in config but no Gelato API integration code exists yet. POD orders are tracked in Supabase but fulfillment is manual.

4. **Shopify Billing Plan** — The storefront API code handles 402 errors, suggesting the store may need an active billing plan for API access.

## Purchase Flow Summary

```
/create page → Fill form → Upload photos → Click "Proceed to Checkout"
    → src/lib/shopify.ts:createPortraitCheckout()
    → POST to Supabase edge function: create-draft-order
    → Edge function validates + recalculates price
    → Creates Shopify Draft Order via Admin API
    → Returns invoice_url → Redirect to Shopify checkout
    → Customer pays → Shopify fires webhook
    → shopify-order-webhook edge function
    → Inserts into portrait_orders + portrait_order_items
    → Visible in /admin dashboard
```
