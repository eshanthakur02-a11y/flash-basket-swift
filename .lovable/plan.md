# FlashBasket — Premium Customer App Redesign

Goal: make the customer mobile experience feel like a real ₹100M+ quick-commerce app (Blinkit / Zepto / Instamart). Mobile-first, dense, product-led, no demo vibes.

## Scope (frontend only)

- Home screen (`/customer/home` and `/` for signed-in customers)
- Bottom navigation
- Header (mobile customer surface)
- Product card visual refresh
- Skeleton/shimmer states
- Optional: Profile shell tweaks to absorb "Wishlist" entry

Out of scope this pass: Cart, Checkout, Category, Orders flows (will keep working; visual polish in a follow-up if you want).

## Design system additions (`src/styles.css`)

- Lock palette tokens: primary `#84CC16`, secondary `#0F172A`, bg `#F8FAFC`, card `#FFFFFF`, accent `#F59E0B`
- Add gradients: `--gradient-hero` (lime → accent), `--gradient-banner-*` for rotating banner variants
- Add shadows: `--shadow-card-premium`, `--shadow-float`
- Radius scale tuned (16/20/24)
- `.shimmer` utility for loading states

## Components

1. **`CustomerHeader`** (new, mobile-first)
   - Compact row: location pill ("Deliver in 10 min · Home ▼"), bell, avatar
   - Sticky premium search bar: search icon + voice mic + camera (image search). Camera opens file input (accept=image/*, capture); placeholder hook for future matching.

2. **`HeroBannerCarousel`** (new)
   - Framer Motion auto-rotating banners (3–4 slides), swipeable, dot indicators
   - Compact height (~150px), gradient backgrounds + emoji/illustration, CTA pill

3. **`QuickServices`** (new)
   - Horizontal scroll chips with colored icon tiles (Milk/Fruits/Veg/Snacks/Beverages/Personal Care) → link to category

4. **`CategoryGrid`** (refresh existing categories block)
   - 4-col grid, 2 rows, rounded soft-tinted tiles, bigger icons, tighter labels

5. **`DealsRail`, `TrendingRail`, `RecommendedRail`**
   - Reuse `ProductCard` in a tighter "compact" variant; section headers with emoji + "See all"

6. **`NearbyShops`** (new, optional if shops data exists; otherwise skip gracefully)
   - Horizontal cards: name, distance, ETA, rating

7. **`FloatingCartBar`** (new)
   - Sticky above bottom nav when cart has items: "X items · ₹Total · View cart →"
   - Slide-in animation via Framer Motion

8. **`BottomNav` refresh**
   - Items: Home / Categories / Cart / Orders / Profile (remove Favourites)
   - Floating pill style with active indicator, larger active icon, subtle blur bg

9. **`ProductCard` polish**
   - Tighter padding, better price hierarchy, lime ADD button, discount chip in accent
   - Skeleton shimmer variant

## Profile

- Add "Wishlist" entry inside `/customer/profile` (and/or `/account`) so removing Favourites tab doesn't lose access.

## Routing notes

- Home (`src/routes/customer.home.tsx`) gets the full new layout.
- Public landing `src/routes/index.tsx` stays as-is unless it shows the same customer home (will verify).
- `Layout.tsx` already conditionally hides the marketing header on `/customer/*` — confirm and ensure new `CustomerHeader` mounts inside the customer shell instead.

## Tech

- React + Tailwind v4 tokens in `src/styles.css`
- Framer Motion for banner carousel, floating cart, page enter
- Lucide icons throughout
- All data via existing Supabase queries (categories, featured, bestsellers). New rails reuse same products query with different filters/limits — no schema changes.

## Deliverables

New files:
- `src/components/customer/CustomerHeader.tsx`
- `src/components/customer/HeroBannerCarousel.tsx`
- `src/components/customer/QuickServices.tsx`
- `src/components/customer/CategoryGrid.tsx`
- `src/components/customer/ProductRail.tsx`
- `src/components/customer/FloatingCartBar.tsx`
- `src/components/customer/SkeletonCard.tsx`

Edited:
- `src/styles.css` — tokens, gradients, shimmer
- `src/routes/customer.home.tsx` — compose new sections
- `src/components/BottomNav.tsx` — new items + floating style
- `src/components/ProductCard.tsx` — visual polish
- `src/routes/customer.profile.tsx` — add Wishlist entry
- `src/components/Layout.tsx` — mount `CustomerHeader` + `FloatingCartBar` for customer routes

## Quality bar

- No empty space on mobile 390px viewport
- Every section above the fold has a clear product/CTA hook
- Smooth 60fps animations, no layout shift
- Skeleton states for every async section
