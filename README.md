# FlashBasket Groceries( APP)

Build a complete, production-style quick-commerce grocery delivery web application inspired by the functionality and fast shopping experience of Blinkit, but with a completely original brand identity, logo, UI, colors, illustrations, and content. Do not copy Blinkit's trademark, branding, assets, or exact design.

PROJECT NAME:

Create an original brand called "FlashBasket" with the tagline:

"Groceries delivered at lightning speed."

GOAL:

I want a fully responsive, modern, interactive, 3D-style grocery delivery website where users can sign up, log in, search products, browse categories, add items to cart, place orders, pay online, view order progress, manage their profile, and cancel eligible orders. It should feel polished, premium, animated, mobile-friendly, and realistic.

TECH STACK:

- React with TypeScript

- Tailwind CSS

- shadcn/ui components

- Framer Motion for smooth interactive animation

- Three.js or React Three Fiber for lightweight 3D hero visuals

- Supabase for authentication, database, storage, and real-time order tracking

- Payment gateway integration using Razorpay for India, with secure server-side payment verification

- Use clean reusable components and production-ready folder structure

DESIGN STYLE:

- Original quick-commerce brand, not a clone

- Premium, fresh, energetic visual style

- Primary colors: lime green, deep charcoal, cream white, and small yellow accents

- Rounded cards, modern shadows, glassmorphism overlays, smooth gradients

- Responsive UI for mobile, tablet, laptop, and desktop

- Mobile-first experience similar to a real grocery delivery app

- Sticky navigation and bottom mobile navigation

- Include loading states, skeleton loaders, toast notifications, empty states, error states, and success animations

- Accessibility: readable text contrast, keyboard navigation, labels, and proper focus states

3D AND INTERACTIVE ANIMATION:

Create an attractive animated hero section with:

- A 3D floating grocery delivery bag or basket

- Animated grocery products floating gently around it, such as vegetables, milk, chips, fruits, beverages, and bread

- Cursor-responsive parallax movement on desktop

- Subtle hover lift and tilt effects on product cards

- Animated add-to-cart action where the product visually moves toward the cart icon

- Animated cart badge counter

- Smooth page transitions

- Scroll-triggered category and offer card animations

- Confetti or success animation after order placement

- Avoid excessive animation that slows down mobile devices

- Respect reduced motion preferences

PAGES AND ROUTES:

1. LANDING / HOME PAGE

Create a beautiful homepage containing:

- Header with logo, delivery location selector, search bar, Login / Sign Up buttons, profile button after login, and cart button

- Hero banner:

  - Title: "Groceries at your door in minutes"

  - Subtitle: "Fresh essentials, snacks, beverages and daily needs delivered fast."

  - CTA buttons: "Shop Now" and "Explore Offers"

  - 3D animated grocery basket visual

- Location input / delivery availability checker using PIN code

- Categories section with icons/cards:

  - Fruits & Vegetables

  - Dairy & Breakfast

  - Snacks & Munchies

  - Cold Drinks & Juices

  - Instant Food

  - Personal Care

  - Household Essentials

  - Baby Care

- Featured products carousel

- Flash deals / discounts area

- Best sellers section

- Why choose us section:

  - Fast Delivery

  - Fresh Products

  - Secure Payment

  - Easy Cancellation

- App-style promotional banner

- Footer with support, policies, social icons, contact, about, FAQ, privacy policy, terms and conditions

2. AUTHENTICATION

Create fully functional auth pages:

- Sign Up page

- Login page

- Forgot password page

- Reset password flow

- Logout

- Optional phone OTP login if supported

- Sign up fields:

  - Full name

  - Email

  - Mobile number

  - Password

  - Confirm password

  - Accept terms checkbox

- Form validation, secure password rules, show/hide password button, loading state, helpful error messages

- Use Supabase Auth

- On successful signup, redirect user to address setup or homepage

- Protected routes for checkout, orders, dashboard, and profile

3. USER DASHBOARD

After login, create a complete user dashboard with:

- Welcome message and profile summary

- Saved delivery addresses

- Current active order with live order status

- Recent orders

- Favorite / wishlisted products

- Wallet or coupon section if implemented

- Notifications section

- Quick links to reorder, track order, edit profile, customer support

- Dashboard should be mobile responsive and actually connected to user data

4. PRODUCT BROWSING AND SEARCH

Create a fully functional product catalog:

- Product listing page with category filters

- Product details page

- Global search bar with autocomplete suggestions

- Search by product name, brand, or category

- Filters:

  - Category

  - Price range

  - Discount

  - Rating

  - Availability

- Sorting:

  - Popularity

  - Price low to high

  - Price high to low

  - Discount

  - Newest

- Product card should show:

  - Product image

  - Name

  - Size / quantity

  - Original price

  - Discounted price

  - Discount percentage

  - Rating

  - Delivery estimate

  - Add button

- Product detail page should include:

  - Image gallery

  - Price and discount

  - Quantity selector

  - Add to cart

  - Product information

  - Ingredients or details if applicable

  - Related products

  - Ratings and reviews

5. SHOPPING CART

Build a fully working cart:

- Add product to cart

- Remove product

- Increase / decrease quantity

- Update cart automatically

- Prevent quantity exceeding available stock

- Display subtotal, delivery fee, handling fee, discount, taxes if applicable, and grand total

- Apply coupon field

- Recommended add-on products

- Empty cart state with CTA to shop

- Persist cart for logged-in users in database and temporarily for guests in local storage

6. DELIVERY ADDRESS AND CHECKOUT

Create checkout functionality:

- Select saved address

- Add new address

- Edit or delete address

- Address fields:

  - Name

  - Phone

  - Flat / House number

  - Street / Area

  - Landmark

  - City

  - State

  - PIN code

  - Address type: Home / Work / Other

- Validate delivery location and PIN code

- Choose delivery instructions:

  - Leave at door

  - Call on arrival

  - Do not ring bell

- Order summary with all fees and savings

- Coupon application

- Proceed to payment button

7. PAYMENT GATEWAY

Integrate Razorpay payment gateway securely:

- Support UPI, credit card, debit card, net banking, and wallet options through Razorpay

- Payment must use server-side order creation and server-side payment signature verification

- Never expose secret keys in frontend code

- Store payment status in Supabase

- Handle payment success, pending, cancelled, and failed states

- Also provide Cash on Delivery option if enabled by admin

- Show payment receipt and confirmation page after successful payment

- Use test mode credentials and clearly mark where production keys need to be configured

8. ORDERS AND TRACKING

Create a fully functional orders system:

- My Orders page showing all previous and active orders

- Each order should display:

  - Order ID

  - Items

  - Total amount

  - Payment method

  - Delivery address

  - Order date and time

  - Current status

- Order status stages:

  - Order Placed

  - Payment Confirmed

  - Packing

  - Out for Delivery

  - Delivered

  - Cancelled

- Visual tracking timeline with animated progress indicator

- Realtime updates from Supabase where possible

- Order details page

- Download invoice button

- Reorder button that adds past products to cart again

ORDER CANCELLATION:

- User can cancel an order only before it reaches "Out for Delivery"

- Cancellation requires selecting a reason

- Ask for confirmation before cancelling

- For online paid orders, show refund status as "Refund Initiated" or "Refund Pending" after cancellation

- Restore inventory after cancellation

- Update order history immediately

- Show cancellation success message

9. USER PROFILE

Create a functional profile area:

- View and edit name, email and phone

- Profile picture upload

- Manage saved addresses

- Manage wishlist / favorites

- View coupons

- Notification preferences

- Change password

- Logout button

- Delete account request option

- Help and customer support section

10. WISHLIST AND OFFERS

Include:

- Favorite button on product cards

- Wishlist page

- Offers page with discount banners and active coupons

- Apply valid coupons at checkout

- Display invalid, expired, or minimum-cart-value coupon errors correctly

11. ADMIN DASHBOARD

Create a protected admin dashboard with role-based access:

- Admin login or admin role support

- Overview metrics:

  - Total orders

  - Revenue

  - Active users

  - Products in stock

  - Cancelled orders

- Product management:

  - Add product

  - Edit product

  - Delete product

  - Upload image

  - Update stock

  - Mark available / unavailable

  - Set price and discount

  - Assign category

- Category management

- Order management:

  - View all orders

  - Update order status

  - View payment status

  - Handle cancelled orders

- Coupon management:

  - Create coupon

  - Set discount type and amount

  - Minimum order value

  - Expiration date

  - Usage status

- User management

- Basic sales analytics charts

12. DATABASE AND BACKEND

Use Supabase and create proper tables with relationships and row-level security.

Required tables:

- profiles

- addresses

- categories

- products

- product_images

- cart_items

- wishlist_items

- coupons

- orders

- order_items

- payments

- reviews

- notifications

Important database behavior:

- Every user's private data must be protected using Row Level Security

- Users can only read and modify their own profile, address, cart, wishlist and orders

- Admins can manage products, categories, coupons and orders

- Product stock should update after successful orders

- Inventory should be restored for successfully cancelled orders

- Never rely only on frontend permissions for admin features

13. SEED DATA

Populate the app with realistic demo grocery data:

- At least 8 categories

- At least 40 sample products

- Product names, images, pricing, weights, discounts, ratings, and stock

- A few demo offers and coupons

- Use royalty-free placeholder or generated images only

14. FUNCTIONAL REQUIREMENTS

All buttons and navigation items should work. Do not create dummy UI-only pages.

Implement:

- Real authentication

- Search functionality

- Product filtering and sorting

- Cart CRUD functionality

- Wishlist CRUD functionality

- Address CRUD functionality

- Checkout workflow

- Razorpay integration structure

- Order creation

- Order tracking

- Cancellation rules

- Profile update

- Admin product and order management

- Database schema and Supabase integration

Where any external key is required, provide clear environment variable setup instructions and implement everything else fully.

15. MOBILE EXPERIENCE

The website must work like a mobile shopping app:

- Mobile bottom nav items: Home, Categories, Search, Orders, Profile

- Sticky cart checkout bar

- Touch-friendly buttons and product cards

- Responsive search and filters

- Fast loading and optimized image sizes

- No horizontal overflow or broken layouts

16. SECURITY AND QUALITY

Implement:

- Secure protected routes

- Row Level Security policies

- Input validation

- Server-side payment verification

- Loading/error/success feedback

- Clean TypeScript types

- Reusable components

- Optimized performance

- SEO-friendly homepage metadata

- Accessible forms and buttons

- Error boundary and 404 page

17. REQUIRED OUTPUT FROM LOVABLE

Generate:

- The complete working web application

- All pages and reusable components

- Supabase database schema and RLS policies

- Authentication setup

- Seed/demo products

- Razorpay test payment setup with backend verification workflow

- Admin dashboard

- Responsive animated original UI

- `.env.example` listing required keys

- Setup instructions explaining how to connect Supabase and Razorpay

- Clear testing steps for signup, shopping, payment, order cancellation, profile, and admin workflow

IMPORTANT:

The finished product should feel like a polished, fast, interactive quick-commerce platform with original branding and a beautiful 3D responsive user experience. Every major feature should be functional, connected to data, and testable. Do not only design the frontend. Build the actual workflows and database integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10138c73-9a20-4df9-9ef9-cb7c5e7e2934).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
