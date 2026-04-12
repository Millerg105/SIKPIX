# Pricing Locations — SikPix

All prices are currently **hardcoded** in React components and config files. No prices are fetched dynamically from Shopify. The Shopify Draft Order API receives the server-calculated price, not a Shopify product price.

## Base Digital Artwork Price: £9.99

> **NOTE:** The operator guide says £15.00 but the codebase uses £9.99 everywhere. This is a discrepancy that needs resolution.

| File | Line | Context | Source |
|---|---|---|---|
| `src/data/shopifyConfig.ts` | 8 | `export const BASE_PRICE = 9.99;` | **Primary source — used by all components** |
| `supabase/functions/create-draft-order/index.ts` | 16 | `const BASE_PRICE = 9.99;` | **Server-side validation copy** |
| `src/data/products.ts` | 27, 63, 99, 135, 170, 206, 241, 276 | `basePrice: 9.99` on all 8 products | Per-product (displayed via `product.basePrice.toFixed(2)`) |
| `src/data/products.ts` | 28, 64, 100, 136, 171, 207, 242, 277 | `premiumPrice: 19.99` on all 8 products | Not currently used in checkout flow |

## Bundle Pricing

| File | Line | Value | Context |
|---|---|---|---|
| `src/data/shopifyConfig.ts` | 178 | `finalPrice: 24.99` | 3-artwork bundle |
| `src/data/shopifyConfig.ts` | 179 | `compareAtPrice: 29.97` | 3-artwork "was" price |
| `src/data/shopifyConfig.ts` | 191 | `finalPrice: 34.99` | 5-artwork bundle |
| `src/data/shopifyConfig.ts` | 192 | `compareAtPrice: 49.95` | 5-artwork "was" price |
| `supabase/functions/create-draft-order/index.ts` | 43 | `finalPrice: 24.99` | Server-side 3-bundle |
| `supabase/functions/create-draft-order/index.ts` | 44 | `finalPrice: 34.99` | Server-side 5-bundle |

## Add-On Prices

| File | Line | Add-On | Price |
|---|---|---|---|
| `src/data/shopifyConfig.ts` | 19 | Extra Vehicle | £5.00 |
| `src/data/shopifyConfig.ts` | 28 | Phone Wallpaper | £3.99 |
| `src/data/shopifyConfig.ts` | 36 | Rush 12hr Delivery | £9.99 |
| `supabase/functions/create-draft-order/index.ts` | 19 | Extra Vehicle (server) | £5.00 |
| `supabase/functions/create-draft-order/index.ts` | 20 | Phone Wallpaper (server) | £3.99 |
| `supabase/functions/create-draft-order/index.ts` | 21 | Rush Delivery (server) | £9.99 |

## POD (Print) Prices

| File | Line | Print Option | Price |
|---|---|---|---|
| `src/data/shopifyConfig.ts` | 57 | A4 Fine Art Print | £29.99 |
| `src/data/shopifyConfig.ts` | 68 | A3 Fine Art Print | £39.99 |
| `src/data/shopifyConfig.ts` | 79 | A2 Fine Art Print | £49.99 |
| `src/data/shopifyConfig.ts` | 91 | A3 Premium Wood Frame | £59.99 |
| `src/data/shopifyConfig.ts` | 102 | A2 Premium Wood Frame | £89.99 |
| `src/data/shopifyConfig.ts` | 114 | A3 Canvas | £79.99 |
| `src/data/shopifyConfig.ts` | 125 | A2 Canvas | £109.99 |
| `src/data/shopifyConfig.ts` | 137 | A3 Framed Canvas | £79.99 |
| `src/data/shopifyConfig.ts` | 148 | A2 Framed Canvas | £99.99 |
| `src/data/shopifyConfig.ts` | 159 | A2 Premium Framed Canvas | £149.99 |
| `supabase/functions/create-draft-order/index.ts` | 27-39 | All POD options (server) | Same prices |

## Hardcoded Price Strings in UI

| File | Line | Text | Notes |
|---|---|---|---|
| `src/components/LandingMarqueeSection.tsx` | 3 | `"DIGITAL ART FROM £9.99 • 3 STYLES £24.99 • 5 STYLES £34.99"` | **Hardcoded string, not from config** |
| `src/pages/ProductPage.tsx` | 93 | `"Most popular package: 3 artworks for £24.99"` | **Hardcoded string** |
| `src/pages/HowItWorksPage.tsx` | 64 | `"+£9.99"` (rush delivery FAQ) | Hardcoded in FAQ text |
| `src/pages/HowItWorksPage.tsx` | 72 | `"+£5.00"` (extra vehicle FAQ) | Hardcoded in FAQ text |
| `src/components/ChristmasPromoSection.tsx` | 43 | `"From £8 per portrait"` | **Old promo — wrong price** |

## Pages That Display Dynamic Prices (from config)

These pages render prices from `BASE_PRICE`, `bundleDiscounts`, `addOns`, `podOptions` imports:

- `src/pages/CreatePage.tsx` — Full checkout summary
- `src/pages/PricingPage.tsx` — Pricing page breakdown
- `src/pages/ProductPage.tsx` — Product detail page
- `src/pages/StylesPage.tsx` — Style cards (`product.basePrice`)
- `src/components/Bestsellers.tsx` — Bestseller cards (`product.basePrice`)
- `src/components/ProductGrid.tsx` — Product grid (`product.basePrice`)
- `src/components/BundlesSection.tsx` — Bundle pricing cards

## To Change Prices

1. Update `BASE_PRICE` in `src/data/shopifyConfig.ts` (line 8)
2. Update `BASE_PRICE` in `supabase/functions/create-draft-order/index.ts` (line 16) — **must match**
3. Update `basePrice` on all 8 products in `src/data/products.ts`
4. Update hardcoded strings in `LandingMarqueeSection.tsx`, `ProductPage.tsx`, `HowItWorksPage.tsx`
5. Remove/update `ChristmasPromoSection.tsx` (shows £8, outdated)
6. Redeploy the Supabase edge function after updating server-side prices
