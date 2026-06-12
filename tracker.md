# Project Progress Tracker

This document tracks our implementation progress. Status updates will be marked as:
* `[ ]` Not Started
* `[/]` In Progress
* `[x]` Completed

---

## [x] Phase 1: Project Initialization & Configuration
- [x] Initialize Next.js project with TypeScript, App Router, and Vanilla CSS
- [x] Install npm dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `razorpay`, `@cloudinary/url-gen`)
- [x] Set up project folder structure (components, app, styles, lib)
- [x] Configure environment variables structure (`.env.local.example`)

## [x] Phase 2: Database Schema & Supabase Setup
- [x] Write SQL schema script for tables (`users`, `products`, `orders`, `order_items`)
- [x] Set up Supabase project and database tables
- [x] Enable Row Level Security (RLS) policies on Supabase tables
- [x] Verify database connection from Next.js server

## [x] Phase 3: UI Design System & Core Pages
- [x] Build global CSS design tokens (colors, gradients, typography, transitions)
- [x] Implement Navbar & Footer layout
- [x] Build Storefront Home Page (fetch and display list of products)
- [x] Build Product Detail Page (dynamic routing `/products/[id]`)
- [x] Build Cart Page (managing quantity, adding/removing items)
- [x] Build Checkout Page UI (shipping info form, order summary)

## [x] Phase 4: Payment Gateway Integration (Razorpay Dev)
- [x] Implement common `PaymentGateway` interface in TypeScript
- [x] Build `RazorpayAdapter` implementing the payment interface
- [x] Create API route `/api/checkout/create-order`
- [x] Create API route `/api/checkout/verify` to receive and verify payment signatures
- [x] Wire up frontend checkout flow to invoke the Razorpay script
- [x] Perform successful test checkout in Razorpay Test Mode

## [x] Phase 5: Cloudinary & Brevo Integrations
- [x] Configure Cloudinary upload signatures API
- [x] Implement client-side direct upload to Cloudinary for new products
- [x] Configure Brevo client for transactional emails
- [x] Wire up order confirmation emails to trigger on payment verification

## [x] Phase 6: User Authentication System
- [x] Revert database RLS policies to strict user-only constraint in `supabase_schema.sql`
- [x] Create Next.js authentication proxy gateway (`src/proxy.ts`)
- [x] Create Login/Signup page UI and controllers (`src/app/login/page.tsx`)
- [x] Integrate Auth session listener into Navbar
- [x] Restrict Cart Drawer checkout routing to authenticated users
- [x] Pre-populate Checkout page details from Supabase active session

## [x] Phase 7: Admin Panel System
- [x] Update database schema RLS policies and add `is_admin` column in `supabase_schema.sql`
- [x] Update Next.js 16 proxy gateway (`src/proxy.ts`) to secure `/admin` routes
- [x] Create Shared CSS module for admin pages (`src/app/admin/admin.module.css`)
- [x] Create Admin Dashboard page (`src/app/admin/page.tsx`)
- [x] Create Catalog Manager page (`src/app/admin/products/page.tsx`) with Cloudinary uploader
- [x] Create Orders Manager page (`src/app/admin/orders/page.tsx`) with status dropdown
- [x] Integrate shipping confirmation email templates into `src/lib/email.ts`
- [x] Create API route `/api/admin/orders/status` to handle admin updates & email triggers

## [ ] Phase 8: Production Swap (Paytm Integration)
- [ ] Build `PaytmAdapter` implementing the generic `PaymentGateway` interface
- [ ] Swap payment adapter config in environment variables
- [ ] Verify Paytm sandbox/production redirect flow
- [ ] Uninstall Razorpay SDK and delete `RazorpayAdapter.ts` (Option B verification)
