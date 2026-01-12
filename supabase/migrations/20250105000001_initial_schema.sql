-- ==========================================
-- FRESH COMPLETE SCHEMA FOR SCANGYM
-- This will drop and recreate everything
-- ==========================================

-- Drop all existing tables and types (in correct order due to dependencies)
DROP TABLE IF EXISTS public.member_payments CASCADE;
DROP TABLE IF EXISTS public.gym_members CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.diet_plans CASCADE;
DROP TABLE IF EXISTS public.trainers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.gym_partners CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.check_ins CASCADE;
DROP TABLE IF EXISTS public.gyms CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ==========================================
-- CREATE FRESH SCHEMA
-- ==========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  opening_time TIME DEFAULT '06:00:00',
  closing_time TIME DEFAULT '22:00:00',
  services TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gyms are publicly viewable"
ON public.gyms FOR SELECT
USING (true);

-- Create check-ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
ON public.check_ins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
ON public.check_ins FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create gym_partners table
CREATE TABLE public.gym_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, gym_id)
);

ALTER TABLE public.gym_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own partnerships"
ON public.gym_partners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert gym partners"
ON public.gym_partners FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gym partners"
ON public.gym_partners FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gym partners"
ON public.gym_partners FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all gym partners"
ON public.gym_partners FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view check-ins at their gyms"
ON public.check_ins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_partners
    WHERE gym_partners.user_id = auth.uid()
    AND gym_partners.gym_id = check_ins.gym_id
  )
);

CREATE POLICY "Partners can view profiles of users who checked in at their gyms"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM check_ins ci
    JOIN gym_partners gp ON gp.gym_id = ci.gym_id
    WHERE ci.user_id = profiles.id
    AND gp.user_id = auth.uid()
  )
);

-- Admins policies for gyms
CREATE POLICY "Admins can insert gyms"
ON public.gyms FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gyms"
ON public.gyms FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gyms"
ON public.gyms FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_name TEXT NOT NULL,
  trainer_specialty TEXT,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  price INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  gym_id uuid REFERENCES public.gyms(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON public.bookings FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Partners can view bookings at their gyms"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM gym_partners gp
    WHERE gp.gym_id = bookings.gym_id
    AND gp.user_id = auth.uid()
  )
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  price integer NOT NULL,
  payment_method text NOT NULL,
  auto_renew boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trainers table
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  bio TEXT,
  experience_years INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers are publicly viewable" ON public.trainers
FOR SELECT USING (true);

CREATE POLICY "Admins can manage trainers" ON public.trainers
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage trainers" ON public.trainers
FOR ALL USING (has_role(auth.uid(), 'partner'));

CREATE TRIGGER update_trainers_updated_at
BEFORE UPDATE ON public.trainers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  duration_days INTEGER DEFAULT 30,
  calories_per_day INTEGER,
  meal_count INTEGER DEFAULT 3,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diet plans are publicly viewable" ON public.diet_plans
FOR SELECT USING (true);

CREATE POLICY "Admins can manage diet plans" ON public.diet_plans
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage diet plans" ON public.diet_plans
FOR ALL USING (has_role(auth.uid(), 'partner'));

CREATE TRIGGER update_diet_plans_updated_at
BEFORE UPDATE ON public.diet_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  image TEXT,
  category TEXT NOT NULL DEFAULT 'Supplements',
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly viewable" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can manage products" 
ON public.products FOR ALL 
USING (has_role(auth.uid(), 'partner'::app_role));

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  tracker TEXT,
  payment_type TEXT NOT NULL,
  reference_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'safepay',
  safepay_session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create orders table with PROPER FOREIGN KEY
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  total_amount INTEGER NOT NULL,
  payment_id UUID REFERENCES public.payments(id),
  shipping_address JSONB,
  items JSONB NOT NULL,
  admin_response TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications for users"
ON public.notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'ScanGym Team',
  category TEXT NOT NULL DEFAULT 'Fitness',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage their own blog posts"
ON public.blog_posts FOR ALL
USING (auth.uid() = author_id);

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);

-- Create gym_members table
CREATE TABLE public.gym_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  membership_type TEXT NOT NULL DEFAULT 'monthly',
  membership_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  membership_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_gym_members_updated_at
BEFORE UPDATE ON public.gym_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create member_payments table
CREATE TABLE public.member_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_type TEXT NOT NULL DEFAULT 'membership',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_member_payments_updated_at
BEFORE UPDATE ON public.member_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- INSERT SAMPLE DATA
-- ==========================================

-- Insert sample gyms
INSERT INTO public.gyms (name, city, address, qr_code) VALUES
('FitZone Gulberg', 'Lahore', 'Main Boulevard, Gulberg III', 'GYM-FITZONE-001'),
('PowerHouse DHA', 'Lahore', 'Phase 5, DHA', 'GYM-POWERHOUSE-002'),
('Iron Paradise', 'Islamabad', 'F-7 Markaz', 'GYM-IRONPARADISE-003'),
('Muscle Factory', 'Karachi', 'Clifton Block 5', 'GYM-MUSCLEFACTORY-004'),
('Gym Nation', 'Lahore', 'Model Town', 'GYM-NATION-005'),
('FitLife Center', 'Islamabad', 'Blue Area', 'GYM-FITLIFE-006');

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, image, category, rating, reviews, in_stock) VALUES
('Premium Whey Protein', 'High-quality whey protein isolate for muscle building and recovery. 2kg pack with 30 servings.', 8500, 10000, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800', 'Supplements', 4.8, 234, true),
('Adjustable Dumbbell Set', '5-25kg adjustable dumbbells with quick-lock mechanism. Perfect for home workouts.', 25000, 32000, 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800', 'Equipment', 4.9, 89, true),
('Resistance Bands Set', 'Set of 5 resistance bands with different strengths. Includes door anchor and carry bag.', 2500, NULL, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', 'Accessories', 4.6, 156, true),
('Pre-Workout Energy', 'Advanced pre-workout formula with caffeine, beta-alanine, and creatine. 30 servings.', 4500, 5500, 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800', 'Supplements', 4.7, 312, true),
('Yoga Mat Premium', 'Extra thick 6mm yoga mat with anti-slip surface. Includes carrying strap.', 3000, NULL, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', 'Accessories', 4.5, 78, true),
('Gym Training Gloves', 'Breathable workout gloves with wrist support. Ideal for weightlifting.', 1500, NULL, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', 'Accessories', 4.4, 203, false),
('BCAA Recovery Drink', 'Branch chain amino acids for muscle recovery. Mixed berry flavor, 40 servings.', 3500, NULL, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800', 'Supplements', 4.6, 145, true),
('Gym Workout T-Shirt', 'Moisture-wicking performance t-shirt. Available in multiple colors and sizes.', 1800, NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Apparel', 4.3, 67, true);

-- ==========================================
-- ADD ADMIN USER
-- ==========================================

-- Add admin role for waleedan12@gmail.com (d4387631-9bd0-437d-8e0c-e42f5be799ce)
INSERT INTO public.user_roles (user_id, role)
VALUES ('d4387631-9bd0-437d-8e0c-e42f5be799ce', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create profile for admin if it doesn't exist
INSERT INTO public.profiles (id, full_name, phone)
VALUES ('d4387631-9bd0-437d-8e0c-e42f5be799ce', 'Waleed Admin', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = 'Waleed Admin';

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify admin role was added
SELECT 
  ur.role, 
  u.email,
  p.full_name
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
LEFT JOIN public.profiles p ON p.id = ur.user_id
WHERE ur.user_id = 'd4387631-9bd0-437d-8e0c-e42f5be799ce';
-- Notify Supabase to refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the foreign key constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'orders'
  AND kcu.column_name = 'user_id';

  -- Add delete policy for admins
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
-- Allow service role to bypass RLS on user_roles table
CREATE POLICY "Service role can manage user_roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to bypass RLS on profiles table
CREATE POLICY "Service role can manage profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to bypass RLS on gym_partners table
CREATE POLICY "Service role can manage gym_partners"
ON public.gym_partners
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
-- Add this policy to profiles table
CREATE POLICY "Service role can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- Add this policy to profiles table  
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));