-- Supabase E-Commerce Database Schema
-- Run this script in the SQL Editor of your Supabase project.

-- =========================================================================
-- 1. Profiles Table (Linked to Supabase Auth.users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL, -- Admin authorization flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure is_admin column exists if the table was created previously without it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger first to prevent duplicate errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 2. Products Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT, -- Cloudinary URL
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Service role or Admin can modify products" ON public.products;
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;

-- Create Products Policies
CREATE POLICY "Anyone can view products" 
    ON public.products FOR SELECT 
    USING (true);

CREATE POLICY "Admins can modify products" 
    ON public.products FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- =========================================================================
-- 3. Orders Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    payment_gateway TEXT DEFAULT 'razorpay',
    payment_order_id TEXT UNIQUE, -- Razorpay or Paytm Order ID
    payment_transaction_id TEXT, -- Payment Transaction ID once paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure orders columns exist if the table was created previously without them
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT;

-- Update status check constraint if it was created previously without 'delivered'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Safely add unique constraint on payment_order_id if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_payment_order_id_key'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_payment_order_id_key UNIQUE (payment_order_id);
    END IF;
END $$;

-- Enable RLS on Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Users and Admins can update orders" ON public.orders;

-- Create Orders Policies
CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can create their own orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and Admins can update orders" 
    ON public.orders FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- =========================================================================
-- 4. Order Items Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users and guests can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users and Admins can view order items" ON public.order_items;

-- Create Order Items Policies
CREATE POLICY "Users and Admins can view order items" 
    ON public.order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (
                orders.user_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Users can insert their own order items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =========================================================================
-- 5. Seed Data: Insert Mock Botanical Products
-- =========================================================================
INSERT INTO public.products (id, title, description, price, stock_quantity, image_url, category)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aura Botanical Face Oil', 'A luxurious blend of organic rosehip, jojoba, and jasmine essential oils to deeply nourish and restore your skin''s natural glow.', 48.00, 12, 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600', 'Skincare'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Restorative Green Clay Mask', 'French green clay infused with botanical extracts of chamomile and calendula to detoxify pores and soothe irritation.', 36.00, 8, 'https://images.unsplash.com/photo-1567894192231-d22d9c1349db?q=80&w=600', 'Skincare'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Calming Lavender Mist', 'Pure organic lavender hydrosol distilled from freshly harvested blossoms. Soothes, hydrates, and balances all skin types.', 24.00, 15, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600', 'Wellness'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Nourishing Herbal Tea Blend', 'A calming loose leaf blend of chamomile, sweet peppermint, and lemon balm. Naturally caffeine-free and hand-blended.', 18.00, 20, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600', 'Botanical Teas'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Rejuvenating Salt Body Scrub', 'Exfoliating pink Himalayan salt crystals combined with nourishing sweet almond oil and refreshing eucalyptus leaf oils.', 32.00, 10, 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600', 'Wellness'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Cedarwood Botanical Soap Bar', 'Cold-processed organic olive and coconut oil soap block. Scented with warm cedarwood bark and refreshing sweet orange.', 12.00, 30, 'https://images.unsplash.com/photo-1607006342465-b77d6f519504?q=80&w=600', 'Wellness')
ON CONFLICT (id) DO NOTHING;
