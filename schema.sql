-- ==============================================================================
-- Kiddo Boutique - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    sizes TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    description TEXT,
    status TEXT DEFAULT 'in_stock',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public read and write
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow product modifications" ON public.products;
CREATE POLICY "Allow product modifications" ON public.products FOR ALL USING (true);

-- Orders Policies: Anyone can create orders & view/manage
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow order management" ON public.orders;
CREATE POLICY "Allow order management" ON public.orders FOR ALL USING (true);

-- 3. Initial Products Seed Data
INSERT INTO public.products (id, title, category, price, sizes, image, images, description, status)
VALUES
  ('p1', 'طقم صيفي كاجوال ولادي', 'boys', '280', ARRAY['2Y', '4Y', '6Y', '8Y'], 'https://th.bing.com/th/id/OIP.jhj4Vnl4n5Vz7PvELBXQkAHaJ1?w=141&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', ARRAY['https://th.bing.com/th/id/OIP.jhj4Vnl4n5Vz7PvELBXQkAHaJ1?w=141&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'], 'طقم قطن 100% عالي الجودة مريح جداً للأطفال في الصيف ومناسب للخروج واللعب.', 'in_stock'),
  ('p2', 'فستان صيفي بناتي رقيق', 'girls', '320', ARRAY['1Y', '2Y', '3Y', '5Y'], 'https://tse2.mm.bing.net/th/id/OIP.3HK0pkdR8MzoNezXxKEqOwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', ARRAY['https://tse2.mm.bing.net/th/id/OIP.3HK0pkdR8MzoNezXxKEqOwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'], 'فستان قطن بناتي بتصميم مميز وألوان مبهجة تناسب الخروجات والمناسبات الصيفية.', 'in_stock'),
  ('p3', 'سالوبيت مواليد قطن ناعم', 'babies', '190', ARRAY['0-3M', '3-6M', '6-9M', '9-12M'], 'https://tse2.mm.bing.net/th/id/OIP.0TDWJIRS-TgHG8seIBQHXQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', ARRAY['https://tse2.mm.bing.net/th/id/OIP.0TDWJIRS-TgHG8seIBQHXQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'], 'سالوبيت رضع من أنعم أنواع القطن المصري للمحافظة على بشرة طفلك الحساسة طوال اليوم.', 'in_stock')
ON CONFLICT (id) DO NOTHING;
