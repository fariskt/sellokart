-- ==============================================================================
-- Sellokart - Razorpay Integration & Order Management Migration
-- ==============================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Adapt/Extend orders table for guest checkout, address snapshot, and tracking
ALTER TABLE IF EXISTS public.orders 
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS guest_token TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create index on order_number and razorpay_order_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_token ON public.orders (guest_token);

-- 3. Adapt/Extend payments table
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON public.payments (gateway_order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_gateway_payment_id 
  ON public.payments (gateway_payment_id) 
  WHERE gateway_payment_id IS NOT NULL;

-- 4. Create webhook_events table for idempotent webhook handling
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events (event_id);

-- 5. Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Orders policies:
-- Authenticated users can read their own orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins full access to orders
DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
CREATE POLICY "Admins full access to orders" ON public.orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role bypasses RLS automatically.
-- For anon client order creation (if service role is not configured):
DROP POLICY IF EXISTS "Enable insert for orders" ON public.orders;
CREATE POLICY "Enable insert for orders" ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Order Items policies:
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Enable insert for order items" ON public.order_items;
CREATE POLICY "Enable insert for order items" ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Payments policies:
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Enable insert and update for payments" ON public.payments;
CREATE POLICY "Enable insert and update for payments" ON public.payments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Addresses table & RLS policies for saved checkout addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own addresses" ON public.addresses;
CREATE POLICY "Users can read own addresses" ON public.addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

