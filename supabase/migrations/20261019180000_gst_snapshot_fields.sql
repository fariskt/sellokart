-- ==============================================================================
-- Sellokart - GST Rate, HSN Code, and Order Item Snapshot Migration
-- ==============================================================================

-- 1. Products: Add per-product GST rate and HSN code
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC DEFAULT 18,
  ADD COLUMN IF NOT EXISTS hsn_code TEXT;

-- 2. Categories: Add fallback category GST rate
ALTER TABLE IF EXISTS public.categories
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC DEFAULT 18;

-- 3. Order Items: Store authoritative snapshot of unit price, discount, GST, and paise
ALTER TABLE IF EXISTS public.order_items
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
  ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC DEFAULT 18,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paise BIGINT;

-- 4. Orders: Store authoritative total in paise and extracted GST amount
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS total_paise BIGINT,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0;
