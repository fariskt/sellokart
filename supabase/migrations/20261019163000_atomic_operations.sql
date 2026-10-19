-- ==============================================================================
-- Sellokart - Migration: Atomic Operations, Hardened RLS, Constraints & RPCs
-- File: supabase/migrations/20261019163000_atomic_operations.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONSTRAINTS & SCHEMA EXTENSIONS
-- ------------------------------------------------------------------------------

-- Ensure required columns exist on orders and payments
ALTER TABLE IF EXISTS public.orders 
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.1 Unique constraints
-- unique(order_number) on orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_order_number'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT uq_orders_order_number UNIQUE (order_number);
  END IF;
END $$;

-- unique(gateway_payment_id) where gateway_payment_id is not null on payments
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_gateway_payment_id 
  ON public.payments (gateway_payment_id) 
  WHERE gateway_payment_id IS NOT NULL;

-- unique(gateway_order_id) on payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_gateway_order_id'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT uq_payments_gateway_order_id UNIQUE (gateway_order_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- unique(razorpay_order_id) where razorpay_order_id is not null on orders
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_razorpay_order_id 
  ON public.orders (razorpay_order_id) 
  WHERE razorpay_order_id IS NOT NULL;

-- 1.2 Table: webhook_events (create if missing with required columns and checks)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT,
  payload JSONB,
  status TEXT CHECK (status IN ('processing', 'processed', 'failed')) DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events (event_id);

-- 1.3 CHECK constraints on stock and quantities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_product_variants_stock_non_negative'
  ) THEN
    ALTER TABLE public.product_variants ADD CONSTRAINT chk_product_variants_stock_non_negative CHECK (stock >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_quantity_positive'
  ) THEN
    ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 1.4 Align orders.status with canonical list: pending, confirmed, processing, shipped, delivered, cancelled, refunded
DO $$
BEGIN
  -- Add enum values if order_status is a postgres enum
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'processing';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'cancelled';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'refunded';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Convert orders.status to text with CHECK constraint to avoid enum lock issues
ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_status;
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_status 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- 1.5 Ensure inventory_logs.type allows canonical types and add unique index
DO $$
BEGIN
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'sale';
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'cancelled_order';
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'return';
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'restock';
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'adjustment';
  ALTER TYPE public.inventory_type ADD VALUE IF NOT EXISTS 'damaged';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE public.inventory_logs ALTER COLUMN type TYPE TEXT USING type::TEXT;
ALTER TABLE public.inventory_logs DROP CONSTRAINT IF EXISTS chk_inventory_logs_type;
ALTER TABLE public.inventory_logs ADD CONSTRAINT chk_inventory_logs_type 
  CHECK (type IN ('sale', 'cancelled_order', 'return', 'restock', 'adjustment', 'damaged'));

-- Unique index on inventory_logs to guarantee idempotent stock mutations per order line
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_logs_order_product_variant_type 
  ON public.inventory_logs (
    order_id, 
    product_id, 
    COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID), 
    type
  ) 
  WHERE order_id IS NOT NULL;


-- ------------------------------------------------------------------------------
-- 2. PRIVILEGED DATABASE RPC FUNCTIONS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- 2.1 apply_order_sale(p_order_id uuid)
CREATE OR REPLACE FUNCTION public.apply_order_sale(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INT;
  v_has_sale_log BOOLEAN;
BEGIN
  -- 1. Require payment_status = 'paid'
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Cannot apply sale on unpaid order % (status: %)', p_order_id, v_order.payment_status;
  END IF;

  -- 2. Loop order items ordered by (product_id, variant_id) to avoid deadlocks
  FOR v_item IN 
    SELECT oi.* 
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
    ORDER BY oi.product_id, COALESCE(oi.variant_id, '00000000-0000-0000-0000-000000000000'::UUID)
  LOOP
    -- 3. Check if line is already logged as 'sale' (idempotency check)
    SELECT EXISTS (
      SELECT 1 FROM public.inventory_logs 
      WHERE order_id = p_order_id 
        AND product_id = v_item.product_id 
        AND COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(v_item.variant_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND type = 'sale'
    ) INTO v_has_sale_log;

    IF v_has_sale_log THEN
      CONTINUE;
    END IF;

    -- 4. Deduct stock with FOR UPDATE lock
    IF v_item.variant_id IS NOT NULL THEN
      SELECT stock INTO v_current_stock 
      FROM public.product_variants 
      WHERE id = v_item.variant_id 
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product variant % not found for order item %', v_item.variant_id, v_item.id;
      END IF;

      IF v_current_stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant % (current: %, requested: %)', 
          v_item.variant_id, v_current_stock, v_item.quantity;
      END IF;

      UPDATE public.product_variants 
      SET stock = stock - v_item.quantity 
      WHERE id = v_item.variant_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_item.product_id, v_item.variant_id, p_order_id, v_item.quantity, v_current_stock, v_current_stock - v_item.quantity, 'sale', 'Order sale: ' || p_order_id
      );

    ELSE
      SELECT stock INTO v_current_stock 
      FROM public.products 
      WHERE id = v_item.product_id 
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product % not found for order item %', v_item.product_id, v_item.id;
      END IF;

      IF v_current_stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product % (current: %, requested: %)', 
          v_item.product_id, v_current_stock, v_item.quantity;
      END IF;

      UPDATE public.products 
      SET stock = stock - v_item.quantity 
      WHERE id = v_item.product_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_item.product_id, NULL, p_order_id, v_item.quantity, v_current_stock, v_current_stock - v_item.quantity, 'sale', 'Order sale: ' || p_order_id
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;


-- 2.2 mark_order_paid(...)
CREATE OR REPLACE FUNCTION public.mark_order_paid(
  p_order_id UUID,
  p_gateway_order_id TEXT,
  p_gateway_payment_id TEXT,
  p_amount_paise BIGINT,
  p_currency TEXT,
  p_signature TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_existing_payment_id TEXT;
  v_expected_paise BIGINT;
BEGIN
  -- 1. Lock the order row
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 2. Validate gateway order ID binding
  IF v_order.razorpay_order_id IS DISTINCT FROM p_gateway_order_id THEN
    RAISE EXCEPTION 'Razorpay order ID mismatch: order % has %, payload has %', 
      p_order_id, v_order.razorpay_order_id, p_gateway_order_id;
  END IF;

  -- 3. Validate currency
  IF p_currency IS DISTINCT FROM 'INR' THEN
    RAISE EXCEPTION 'Invalid currency: % (expected INR)', p_currency;
  END IF;

  -- 4. Validate total amount in paise
  v_expected_paise := ROUND(v_order.total * 100);
  IF v_expected_paise <> p_amount_paise THEN
    RAISE EXCEPTION 'Amount mismatch for order %: expected % paise, got % paise', 
      p_order_id, v_expected_paise, p_amount_paise;
  END IF;

  -- 5. Check if already paid
  IF v_order.payment_status = 'paid' THEN
    SELECT gateway_payment_id INTO v_existing_payment_id 
    FROM public.payments 
    WHERE order_id = p_order_id AND status = 'paid' 
    LIMIT 1;

    IF v_existing_payment_id IS NOT NULL AND v_existing_payment_id <> p_gateway_payment_id THEN
      RAISE EXCEPTION 'Payment ID mismatch on already-paid order %: existing %, new % (flagged for refund)', 
        p_order_id, v_existing_payment_id, p_gateway_payment_id;
    END IF;

    RETURN jsonb_build_object('already_paid', true, 'order_id', p_order_id);
  END IF;

  -- 6. Mark order confirmed and paid
  UPDATE public.orders 
  SET 
    payment_status = 'paid', 
    status = 'confirmed', 
    updated_at = NOW() 
  WHERE id = p_order_id;

  -- 7. Upsert payments row
  INSERT INTO public.payments (
    order_id,
    gateway,
    gateway_order_id,
    gateway_payment_id,
    gateway_signature,
    amount,
    currency,
    status,
    paid_at,
    updated_at
  ) VALUES (
    p_order_id,
    'razorpay',
    p_gateway_order_id,
    p_gateway_payment_id,
    p_signature,
    (p_amount_paise::NUMERIC / 100.0),
    p_currency,
    'paid',
    NOW(),
    NOW()
  )
  ON CONFLICT (gateway_order_id) DO UPDATE SET
    gateway_payment_id = EXCLUDED.gateway_payment_id,
    gateway_signature = COALESCE(EXCLUDED.gateway_signature, payments.gateway_signature),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = 'paid',
    paid_at = NOW(),
    updated_at = NOW();

  -- 8. Apply inventory sale atomically
  PERFORM public.apply_order_sale(p_order_id);

  RETURN jsonb_build_object('already_paid', false, 'order_id', p_order_id);
END;
$$;


-- 2.3 cancel_order(p_order_id uuid)
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_sale_log RECORD;
  v_current_stock INT;
  v_already_cancelled_log BOOLEAN;
BEGIN
  -- 1. Lock the order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('cancelled', true, 'order_id', p_order_id, 'no_op', true);
  END IF;

  -- 2. Check transition map
  IF v_order.status NOT IN ('pending', 'confirmed', 'processing') THEN
    RAISE EXCEPTION 'Cannot cancel order % from status: %', p_order_id, v_order.status;
  END IF;

  -- 3. Restore stock ONLY for lines that have a 'sale' log
  FOR v_sale_log IN 
    SELECT * FROM public.inventory_logs 
    WHERE order_id = p_order_id AND type = 'sale'
  LOOP
    -- Check if cancelled_order log already exists for this line
    SELECT EXISTS (
      SELECT 1 FROM public.inventory_logs 
      WHERE order_id = p_order_id 
        AND product_id = v_sale_log.product_id 
        AND COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(v_sale_log.variant_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND type = 'cancelled_order'
    ) INTO v_already_cancelled_log;

    IF v_already_cancelled_log THEN
      CONTINUE;
    END IF;

    IF v_sale_log.variant_id IS NOT NULL THEN
      SELECT stock INTO v_current_stock 
      FROM public.product_variants 
      WHERE id = v_sale_log.variant_id 
      FOR UPDATE;

      UPDATE public.product_variants 
      SET stock = stock + v_sale_log.quantity 
      WHERE id = v_sale_log.variant_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_sale_log.product_id, v_sale_log.variant_id, p_order_id, v_sale_log.quantity, v_current_stock, v_current_stock + v_sale_log.quantity, 'cancelled_order', 'Order cancelled: ' || p_order_id
      );
    ELSE
      SELECT stock INTO v_current_stock 
      FROM public.products 
      WHERE id = v_sale_log.product_id 
      FOR UPDATE;

      UPDATE public.products 
      SET stock = stock + v_sale_log.quantity 
      WHERE id = v_sale_log.product_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_sale_log.product_id, NULL, p_order_id, v_sale_log.quantity, v_current_stock, v_current_stock + v_sale_log.quantity, 'cancelled_order', 'Order cancelled: ' || p_order_id
      );
    END IF;
  END LOOP;

  -- 4. Set order status cancelled
  UPDATE public.orders 
  SET status = 'cancelled', updated_at = NOW() 
  WHERE id = p_order_id;

  RETURN jsonb_build_object('cancelled', true, 'order_id', p_order_id);
END;
$$;


-- 2.4 apply_return(p_return_id uuid)
CREATE OR REPLACE FUNCTION public.apply_return(p_return_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_return RECORD;
  v_order RECORD;
  v_sale_log RECORD;
  v_current_stock INT;
  v_already_returned_log BOOLEAN;
BEGIN
  -- 1. Requires returns.status = 'approved'
  SELECT * INTO v_return FROM public.returns WHERE id = p_return_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Return % not found', p_return_id;
  END IF;

  IF v_return.status <> 'approved' THEN
    RAISE EXCEPTION 'Cannot apply return: return status is % (must be approved)', v_return.status;
  END IF;

  -- 2. Lock the parent order
  SELECT * INTO v_order FROM public.orders WHERE id = v_return.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found for return %', v_return.order_id, p_return_id;
  END IF;

  -- 3. Restore stock only for lines with a 'sale' log, idempotent via return log
  FOR v_sale_log IN 
    SELECT * FROM public.inventory_logs 
    WHERE order_id = v_return.order_id AND type = 'sale'
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.inventory_logs 
      WHERE order_id = v_return.order_id 
        AND product_id = v_sale_log.product_id 
        AND COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(v_sale_log.variant_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND type = 'return'
    ) INTO v_already_returned_log;

    IF v_already_returned_log THEN
      CONTINUE;
    END IF;

    IF v_sale_log.variant_id IS NOT NULL THEN
      SELECT stock INTO v_current_stock 
      FROM public.product_variants 
      WHERE id = v_sale_log.variant_id 
      FOR UPDATE;

      UPDATE public.product_variants 
      SET stock = stock + v_sale_log.quantity 
      WHERE id = v_sale_log.variant_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_sale_log.product_id, v_sale_log.variant_id, v_return.order_id, v_sale_log.quantity, v_current_stock, v_current_stock + v_sale_log.quantity, 'return', 'Return approved: ' || p_return_id
      );
    ELSE
      SELECT stock INTO v_current_stock 
      FROM public.products 
      WHERE id = v_sale_log.product_id 
      FOR UPDATE;

      UPDATE public.products 
      SET stock = stock + v_sale_log.quantity 
      WHERE id = v_sale_log.product_id;

      INSERT INTO public.inventory_logs (
        product_id, variant_id, order_id, quantity, previous_stock, new_stock, type, notes
      ) VALUES (
        v_sale_log.product_id, NULL, v_return.order_id, v_sale_log.quantity, v_current_stock, v_current_stock + v_sale_log.quantity, 'return', 'Return approved: ' || p_return_id
      );
    END IF;
  END LOOP;

  -- 4. Mark return completed
  UPDATE public.returns 
  SET status = 'completed', completed_at = NOW() 
  WHERE id = p_return_id;

  RETURN jsonb_build_object('success', true, 'return_id', p_return_id);
END;
$$;


-- 2.5 adjust_stock(p_product_id uuid, p_variant_id uuid, p_delta int, p_type text, p_notes text, p_actor uuid)
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id UUID,
  p_variant_id UUID,
  p_delta INT,
  p_type TEXT,
  p_notes TEXT,
  p_actor UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock INT;
  v_new_stock INT;
BEGIN
  IF p_variant_id IS NOT NULL THEN
    SELECT stock INTO v_current_stock 
    FROM public.product_variants 
    WHERE id = p_variant_id 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant % not found', p_variant_id;
    END IF;

    v_new_stock := v_current_stock + p_delta;
    IF v_new_stock < 0 THEN
      RAISE EXCEPTION 'Stock adjustment results in negative stock: % + % = %', 
        v_current_stock, p_delta, v_new_stock;
    END IF;

    UPDATE public.product_variants 
    SET stock = v_new_stock 
    WHERE id = p_variant_id;

    INSERT INTO public.inventory_logs (
      product_id, variant_id, quantity, previous_stock, new_stock, type, notes
    ) VALUES (
      p_product_id, p_variant_id, ABS(p_delta), v_current_stock, v_new_stock, p_type, p_notes
    );
  ELSE
    SELECT stock INTO v_current_stock 
    FROM public.products 
    WHERE id = p_product_id 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', p_product_id;
    END IF;

    v_new_stock := v_current_stock + p_delta;
    IF v_new_stock < 0 THEN
      RAISE EXCEPTION 'Stock adjustment results in negative stock: % + % = %', 
        v_current_stock, p_delta, v_new_stock;
    END IF;

    UPDATE public.products 
    SET stock = v_new_stock 
    WHERE id = p_product_id;

    INSERT INTO public.inventory_logs (
      product_id, variant_id, quantity, previous_stock, new_stock, type, notes
    ) VALUES (
      p_product_id, NULL, ABS(p_delta), v_current_stock, v_new_stock, p_type, p_notes
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'previous_stock', v_current_stock, 
    'new_stock', v_new_stock
  );
END;
$$;


-- 2.6 update_order_status(p_order_id uuid, p_to text, p_actor uuid)
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_to TEXT,
  p_actor UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- 1. Lock the order row
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.status = p_to THEN
    RETURN jsonb_build_object('success', true, 'status', p_to, 'no_op', true);
  END IF;

  -- 2. State transition validation:
  -- pending -> [cancelled]
  -- confirmed -> [processing, cancelled]
  -- processing -> [shipped, cancelled]
  -- shipped -> [delivered]
  -- delivered -> [refunded]
  -- cancelled -> []
  -- refunded -> []
  IF (v_order.status = 'pending' AND p_to NOT IN ('cancelled')) OR
     (v_order.status = 'confirmed' AND p_to NOT IN ('processing', 'cancelled')) OR
     (v_order.status = 'processing' AND p_to NOT IN ('shipped', 'cancelled')) OR
     (v_order.status = 'shipped' AND p_to NOT IN ('delivered')) OR
     (v_order.status = 'delivered' AND p_to NOT IN ('refunded')) OR
     (v_order.status IN ('cancelled', 'refunded')) THEN
    RAISE EXCEPTION 'Invalid status transition from % to % for order %', 
      v_order.status, p_to, p_order_id;
  END IF;

  -- 3. 'processing' requires payment_status = 'paid'
  IF p_to = 'processing' AND v_order.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Cannot move order % to processing: payment_status is % (requires paid)', 
      p_order_id, v_order.payment_status;
  END IF;

  -- 4. If target status is 'cancelled', invoke cancel_order logic
  IF p_to = 'cancelled' THEN
    PERFORM public.cancel_order(p_order_id);
    RETURN jsonb_build_object('success', true, 'status', 'cancelled');
  END IF;

  -- 5. Perform CAS update
  UPDATE public.orders 
  SET status = p_to, updated_at = NOW() 
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'status', p_to);
END;
$$;

-- 2.7 Permissions: revoke all from public, anon, authenticated; grant execute to service_role only
REVOKE ALL ON FUNCTION public.apply_order_sale(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_order_sale(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.mark_order_paid(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.cancel_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.apply_return(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_return(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.adjust_stock(UUID, UUID, INT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_stock(UUID, UUID, INT, TEXT, TEXT, UUID) TO service_role;

REVOKE ALL ON FUNCTION public.update_order_status(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, UUID) TO service_role;


-- ------------------------------------------------------------------------------
-- 3. HARDENED ROW LEVEL SECURITY (RLS) AUDIT & POLICIES
-- ------------------------------------------------------------------------------

-- Ensure RLS is enabled on every table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3.1 Drop legacy permissive policies
DROP POLICY IF EXISTS "Enable insert for orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert and update for payments" ON public.payments;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- 3.2 Orders Policies
-- Customers can SELECT only their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can SELECT all orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- No INSERT, UPDATE, or DELETE policies for customers or anon (service_role handles mutations)

-- 3.3 Order Items Policies
-- Customers can SELECT only their own order items
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Admins can SELECT all order items
CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 3.4 Payments Policies
-- Customers can SELECT only their own payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

-- Admins can SELECT all payments
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 3.5 Products & Product Variants Policies
DROP POLICY IF EXISTS "products_select_active" ON public.products;
DROP POLICY IF EXISTS "products_select_admin" ON public.products;
DROP POLICY IF EXISTS "product_variants_select_active" ON public.product_variants;

-- Public can SELECT active products only
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT TO public
  USING (status = 'active');

-- Admins can SELECT all products
CREATE POLICY "products_select_admin" ON public.products
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Public can SELECT active variants only
CREATE POLICY "product_variants_select_active" ON public.product_variants
  FOR SELECT TO public
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id AND products.status = 'active'
    )
  );

-- 3.6 Returns Policies
DROP POLICY IF EXISTS "returns_select_own" ON public.returns;
DROP POLICY IF EXISTS "returns_select_admin" ON public.returns;

CREATE POLICY "returns_select_own" ON public.returns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "returns_select_admin" ON public.returns
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 3.7 Coupons Policies
DROP POLICY IF EXISTS "coupons_select_active" ON public.coupons;
DROP POLICY IF EXISTS "coupons_select_admin" ON public.coupons;

CREATE POLICY "coupons_select_active" ON public.coupons
  FOR SELECT TO authenticated
  USING (
    is_active = true AND 
    (start_date IS NULL OR start_date <= NOW()) AND 
    (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "coupons_select_admin" ON public.coupons
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 3.8 inventory_logs & webhook_events
-- Ensure NO anon or authenticated access policies exist. Service role bypasses RLS automatically.
DROP POLICY IF EXISTS "inventory_logs_select" ON public.inventory_logs;
DROP POLICY IF EXISTS "webhook_events_select" ON public.webhook_events;

-- 3.9 Profiles Policy & Column Role Protection Trigger
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent unauthorized role alteration on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT (
      current_setting('request.jwt.claim.role', true) = 'service_role' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot modify their own role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_update ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_update();
