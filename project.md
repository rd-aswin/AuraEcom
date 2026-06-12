# Project Charter: Free-Tier E-Commerce Store

## Project Title
**Zero-Cost E-Commerce Platform**

## Description
A modern, lightweight, and completely free-to-run e-commerce storefront and API backend. The system is built using Next.js (App Router), TypeScript, and Vanilla CSS, powered by Supabase (PostgreSQL & Auth), Cloudinary (Media storage), and Brevo (Transactional emails). It features a modular payment gateway design to allow development using Razorpay (Test Mode) and a clean swap to Paytm for production.

---

## Strategic Goals
1. **Zero Hosting & Database Infrastructure Cost**: Strictly utilize free tiers of Vercel, Supabase, Cloudinary, and Brevo to run the storefront.
2. **Modular Payment Gateway**: Implement a strict adapter pattern so Razorpay can be used in development and completely deleted/replaced by Paytm for production without touching core database or routing code.
3. **Premium Visual Aesthetics**: Create a stunning UI with smooth animations, curated color palettes, and responsive layouts.
4. **Performance & SEO Optimization**: Keep the application lightweight, leveraging Next.js Server-Side Rendering (SSR) for catalog pages to rank high on search engines.

---

## Core Features
* **Authentication**: Email/Password and social logins (via Supabase Auth).
* **Product Catalog**: Dynamic catalog browsing, product filtering, and detailed product view pages.
* **Shopping Cart**: Client-side cart persistence (add, modify, delete items) with synchronized database cart options.
* **Checkout Flow**: Secure checkout form with active payment validation.
* **Payments**:
  * **Development**: Razorpay checkout modal with transaction signature verification.
  * **Production**: Paytm checkout redirect integration.
* **Notifications**: Automated transaction emails (Order confirmation, invoice, shipment details) via Brevo.
* **Asset Uploads**: Product image uploading handled directly to Cloudinary from the client-side via signed upload requests.

---

## What Success Looks Like
* A fully functioning, end-to-end user flow from catalog browsing to successful checkout.
* Next.js Web Vitals score $\ge 90$ on both mobile and desktop.
* Zero billing alerts/costs during active development and scaling on free tiers.
* Successful removal of Razorpay and smooth transition to Paytm with **zero** changes required in the database, product tables, or client UI.
* 100% of order confirmation emails successfully delivered to customer inboxes via Brevo.

---

## Do's and Don'ts

### Do's
* **Do** encapsulate payment provider code completely within its respective adapter class/file.
* **Do** use Row Level Security (RLS) on all Supabase tables to protect order details and user data.
* **Do** write clean, responsive Vanilla CSS using CSS Modules (`.module.css`) to avoid style clashes.
* **Do** validate all incoming webhook requests from payment gateways to prevent spoofing.

### Don'ts
* **Don't** hardcode any API credentials, secret keys, or database URLs in the codebase. Always use environment variables (`.env.local`).
* **Don't** perform direct large-file uploads to your serverless backend. Let the frontend upload images directly to Cloudinary using secure signatures.
* **Don't** edit database tables directly in production without writing clean SQL migration scripts.

---

## UI/UX Design System & Aesthetics

To build a premium, immersive, and high-converting store, we will implement the following design guidelines:

### 1. Aesthetic Theme & Colors
* **Theme**: Calming, sophisticated **Warm Organic / Botanical** interface with natural tones and high-end editorial styling.
* **Palette**:
  * **Canvas (Background)**: Warm Oatmeal / Fine Sand (`#F5EFEB` or `#FAF9F6`)
  * **Elevated Surface (Cards, Headers)**: Soft Ivory-White (`#FFFFFF`) with a very soft, natural drop-shadow (`box-shadow: 0 10px 30px -15px rgba(28, 42, 34, 0.05)`)
  * **Primary Accent**: Deep Forest Green (`#1E352C` or `#2C4A3E`) for main headings, navigation buttons, and high-impact CTAs.
  * **Secondary Accent**: Olive / Sage Green (`#8D9986` or `#6B7F67`) for secondary buttons, highlights, and borders.
  * **Highlight & Warmth**: Terracotta / Sandy Ochre (`#C88E72` or `#D4A373`) for prices, promotion banners, and checkout indicators.
  * **Borders**: Thin, soft stone-grey lines (`1px solid #E5DFD7`)
  * **Typography Colors**: Deep Charcoal-Forest (`#17231C` for headings, `#3D4B43` for body text).

### 2. Typography
* **Primary Headers**: We will load **DM Serif Display** or **Playfair Display** via Google Fonts, using medium-heavy weights to establish an elegant, magazine-style editorial aesthetic.
* **Body & UI Controls**: We will load **Plus Jakarta Sans** or **Outfit** to provide clean, legible sans-serif support for product listings, quantity toggles, and form fields.

### 3. Layout & Navigation
* **Sticky Navigation Bar**: Flat soft-ivory floating navigation panel with standard micro-borders and a clean cart counter.
* **Instant Cart Drawer**: A slide-out sidebar overlay that appears when items are added, featuring soft rounded container elements and oatmeal background panels.
* **Streamlined Checkout**: A clean, single-page checkout form using rounded input containers, soft field labels, and large primary checkout actions.

### 4. Animations & Micro-interactions
* **Hover State Animations**: Smooth vertical translations (`transform: translateY(-5px)`) and a soft spread expansion of the natural drop-shadow on product cards.
* **Loading Skeletons**: Soft pulsing oatmeal-gradient loading cards (`@keyframes pulse`) matching the rounded borders while product data is fetched.
* **Transitions**: Elegant and slow transitions (`transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1)`) to promote a calm, organic UX.


