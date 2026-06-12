# 🍃 Aura — Premium Botanical E-Commerce Store

Aura is a full-stack, high-end botanical e-commerce application designed to showcase modern web engineering practices. Built with **Next.js (App Router)**, **TypeScript**, and **Vanilla CSS Modules**, it integrates a secure shopping experience, role-based admin controls, real-time inventory management, and automated transactional emails.

---

## 🚀 Core Features

### 🛒 Customer Experience
* **Secure Auth Gateway**: Integrated with Supabase Auth for seamless login and registration.
* **Auto-Filled Checkout**: Pre-populates shipping forms with authenticated user metadata.
* **Interactive Shopping Cart**: Custom-built side drawer utilizing React Context and LocalStorage for persistent cart state.
* **Live Order Tracking**: Visual, color-coded fulfillment timeline tracking orders from *Placed* $\rightarrow$ *Shipped* $\rightarrow$ *Delivered*.

### 🔑 Administrative Control Room (`is_admin = true`)
* **Sales Analytics & KPIs**: Real-time sales telemetry calculating total revenue, average order value, and low-stock alerts (< 5 units).
* **Direct CDN Uploads**: Integrated with Cloudinary for secure, signed image uploads directly from the browser.
* **Order Fulfillment Control**: Interactive dashboard allowing admins to update status, which automatically triggers delivery update emails.

---

## 🛠 Tech Stack

* **Frontend**: Next.js (App Router, Turbopack), React, TypeScript
* **Styling**: Vanilla CSS Modules (Warm Organic theme: Oatmeal/Ivory palette, Outfit & DM Serif typography)
* **Backend & Database**: Supabase (PostgreSQL), with check constraints and Row Level Security (RLS)
* **Image Hosting**: Cloudinary (Direct Signed Upload API)
* **Email Service**: Brevo (SMTP/Transactional Mail API)

---

## 🧠 Architectural & Engineering Highlights (Interview Points)

### 1. Next.js Request Proxy Gateway
Secures `/checkout`, `/orders`, and `/admin` paths before page rendering using Next.js Request Proxy middleware (`src/proxy.ts`):
* Non-admin users are blocked from dashboard paths.
* Guest users are cleanly redirected to `/login?redirect=...` and returned post-login.

### 2. Secure Server-to-Client Upload Pipeline
Implemented a cryptographic signature generator endpoint (`/api/media/sign`). When uploading images:
1. The client requests a secure signature from Next.js server-side route.
2. The client uploads the file directly to Cloudinary using this signature.
3. This bypasses proxying heavy file payloads through the Next.js server, improving performance and reducing host bandwidth.

### 3. Database Check Constraints & Security
Designed PostgreSQL schemas with strict safety checks (e.g., matching delivery constraints, email constraints, and order-ownership guards). Enabled row-level policies ensuring users can only fetch their own orders.

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rd-aswin/AuraEcom.git
   cd AuraEcom
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   BREVO_API_KEY=your_brevo_api_key
   BREVO_SENDER_EMAIL=your_sender_email
   BREVO_SENDER_NAME=your_sender_name
   ```

4. **Initialize Database Schema**:
   Run the SQL statements in `supabase_schema.sql` inside your Supabase SQL editor.

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
