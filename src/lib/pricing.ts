
export interface PricingInputItem {
  productId?: string;
  id?: string;
  variantId?: string | null;
  quantity: number;
}

export interface PricingInput {
  items: PricingInputItem[];
  couponCode?: string | null;
  userEmail?: string | null;
  destination?: {
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
}

export interface PricingLineItem {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  discountPaise: number;
  payablePaise: number;
  gstRate: number;
  gstAmountPaise: number;
  baseAmountPaise: number;
  unitPrice: number;
  lineTotal: number;
  discount: number;
  payable: number;
  gstAmount: number;
}

export interface PricingResult {
  lineItems: PricingLineItem[];
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  gstAmountPaise: number;
  totalPaise: number;
  isFreeShipping: boolean;
  couponCode: string | null;
  couponApplied: boolean;
  couponMessage?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  gstAmount: number;
  total: number;
}

export const FREE_SHIPPING_THRESHOLD_PAISE = 199900; // ₹1,999.00
export const STANDARD_SHIPPING_PAISE = 7000; // ₹70.00
export const DEFAULT_GST_RATE = 18;

/**
 * Validates whether sale price is authoritative and active.
 */
export function isSalePriceValid(
  price: number | null | undefined,
  salePrice: number | null | undefined,
  startDate?: string | null,
  endDate?: string | null,
  now: Date = new Date()
): boolean {
  if (price == null || salePrice == null) return false;
  const p = Number(price);
  const sp = Number(salePrice);
  if (isNaN(p) || isNaN(sp) || sp <= 0 || sp >= p) return false;

  if (startDate) {
    const s = new Date(startDate);
    if (!isNaN(s.getTime()) && now < s) return false;
  }
  if (endDate) {
    const e = new Date(endDate);
    if (!isNaN(e.getTime()) && now > e) return false;
  }

  return true;
}

/**
 * Pure pricing math calculator. Operates strictly in integer paise.
 * No floats or external decimal libraries.
 */
export function calculatePricingPure({
  resolvedItems,
  coupon,
  freeShippingThresholdPaise = FREE_SHIPPING_THRESHOLD_PAISE,
  standardShippingPaise = STANDARD_SHIPPING_PAISE,
}: {
  resolvedItems: Array<{
    productId: string;
    variantId: string | null;
    name: string;
    sku: string | null;
    quantity: number;
    price: number;
    salePrice?: number | null;
    saleStartDate?: string | null;
    saleEndDate?: string | null;
    gstRate?: number | null;
  }>;
  coupon?: {
    code: string;
    discountType: "percentage" | "fixed" | "freeship";
    discountValue: number;
    minimumOrderAmountPaise?: number;
    maximumDiscountPaise?: number;
  } | null;
  freeShippingThresholdPaise?: number;
  standardShippingPaise?: number;
}): PricingResult {
  if (!resolvedItems || resolvedItems.length === 0) {
    return {
      lineItems: [],
      subtotalPaise: 0,
      discountPaise: 0,
      shippingPaise: 0,
      gstAmountPaise: 0,
      totalPaise: 0,
      isFreeShipping: true,
      couponCode: null,
      couponApplied: false,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      gstAmount: 0,
      total: 0,
    };
  }

  // 1. Line Totals: Determine authoritative unit price per line in integer paise
  const lineDetails = resolvedItems.map((item) => {
    const qty = Math.max(1, Math.floor(item.quantity));
    const hasSale = isSalePriceValid(
      item.price,
      item.salePrice,
      item.saleStartDate,
      item.saleEndDate
    );
    const unitPriceNum = hasSale ? Number(item.salePrice) : Number(item.price);
    const unitPricePaise = Math.round(unitPriceNum * 100);
    const lineTotalPaise = unitPricePaise * qty;
    const gstRate = item.gstRate != null && !isNaN(Number(item.gstRate))
      ? Number(item.gstRate)
      : DEFAULT_GST_RATE;

    return {
      productId: item.productId,
      variantId: item.variantId || null,
      name: item.name,
      sku: item.sku || null,
      quantity: qty,
      unitPricePaise,
      lineTotalPaise,
      gstRate,
      discountPaise: 0,
    };
  });

  const subtotalPaise = lineDetails.reduce((acc, l) => acc + l.lineTotalPaise, 0);

  // 2. Coupon Validation & Total Discount in Paise
  let totalCouponDiscountPaise = 0;
  let couponApplied = false;
  let couponMessage = "";
  let isFreeShippingCoupon = false;

  if (coupon && subtotalPaise > 0) {
    const minOrderPaise = coupon.minimumOrderAmountPaise ?? 0;
    if (subtotalPaise < minOrderPaise) {
      couponMessage = `Minimum order amount of ₹${(minOrderPaise / 100).toFixed(2)} required.`;
    } else {
      if (coupon.discountType === "percentage") {
        const pct = Math.min(100, Math.max(0, coupon.discountValue));
        let disc = Math.round((subtotalPaise * pct) / 100);
        if (coupon.maximumDiscountPaise && coupon.maximumDiscountPaise > 0) {
          disc = Math.min(disc, coupon.maximumDiscountPaise);
        }
        totalCouponDiscountPaise = Math.min(disc, subtotalPaise);
        couponApplied = true;
      } else if (coupon.discountType === "fixed") {
        const fixedPaise = Math.round(coupon.discountValue * 100);
        totalCouponDiscountPaise = Math.min(fixedPaise, subtotalPaise);
        couponApplied = true;
      } else if (coupon.discountType === "freeship") {
        isFreeShippingCoupon = true;
        couponApplied = true;
      }
    }
  }

  // 3. Apportion Coupon Discount across lines proportionally by lineTotalPaise
  if (totalCouponDiscountPaise > 0 && subtotalPaise > 0) {
    let allocated = 0;
    lineDetails.forEach((line) => {
      const lineShare = Math.floor(
        (totalCouponDiscountPaise * line.lineTotalPaise) / subtotalPaise
      );
      line.discountPaise = lineShare;
      allocated += lineShare;
    });

    // Allocate any integer rounding remainder to the highest value line
    let remainder = totalCouponDiscountPaise - allocated;
    if (remainder > 0) {
      const sortedByTotal = [...lineDetails].sort(
        (a, b) => b.lineTotalPaise - a.lineTotalPaise
      );
      for (const line of sortedByTotal) {
        if (remainder <= 0) break;
        line.discountPaise += 1;
        remainder -= 1;
      }
    }
  }

  // 4. Shipping Calculation: Free above threshold or via coupon, else standard flat rate
  const netGoodsPaise = Math.max(0, subtotalPaise - totalCouponDiscountPaise);
  const isFreeShipping =
    isFreeShippingCoupon || netGoodsPaise >= freeShippingThresholdPaise || subtotalPaise === 0;
  const shippingPaise = isFreeShipping ? 0 : standardShippingPaise;

  // 5. Extract GST from GST-inclusive line amounts per product gst_rate
  let totalGstAmountPaise = 0;

  const lineItems: PricingLineItem[] = lineDetails.map((line) => {
    const payablePaise = Math.max(0, line.lineTotalPaise - line.discountPaise);

    // GST is extracted from inclusive payable amount:
    // Base = (Payable * 10000) / (10000 + Rate * 100)
    // GST = Payable - Base
    const rateFactor = Math.round(10000 + line.gstRate * 100);
    const baseAmountPaise = Math.round((payablePaise * 10000) / rateFactor);
    const gstAmountPaise = payablePaise - baseAmountPaise;

    totalGstAmountPaise += gstAmountPaise;

    return {
      productId: line.productId,
      variantId: line.variantId,
      name: line.name,
      sku: line.sku,
      quantity: line.quantity,
      unitPricePaise: line.unitPricePaise,
      lineTotalPaise: line.lineTotalPaise,
      discountPaise: line.discountPaise,
      payablePaise,
      gstRate: line.gstRate,
      gstAmountPaise,
      baseAmountPaise,
      unitPrice: line.unitPricePaise / 100.0,
      lineTotal: line.lineTotalPaise / 100.0,
      discount: line.discountPaise / 100.0,
      payable: payablePaise / 100.0,
      gstAmount: gstAmountPaise / 100.0,
    };
  });

  const totalPaise = netGoodsPaise + shippingPaise;

  return {
    lineItems,
    subtotalPaise,
    discountPaise: totalCouponDiscountPaise,
    shippingPaise,
    gstAmountPaise: totalGstAmountPaise,
    totalPaise,
    isFreeShipping,
    couponCode: coupon?.code || null,
    couponApplied,
    couponMessage,
    subtotal: subtotalPaise / 100.0,
    discount: totalCouponDiscountPaise / 100.0,
    shipping: shippingPaise / 100.0,
    gstAmount: totalGstAmountPaise / 100.0,
    total: totalPaise / 100.0,
  };
}

/**
 * Server-side authoritative pricing function.
 * Fetches real current prices and GST rates from Supabase.
 * Ignores all client-provided prices.
 */
export async function calculateAuthoritativePricing(
  input: PricingInput
): Promise<PricingResult> {
  const { items, couponCode, userEmail } = input;

  if (!items || items.length === 0) {
    return calculatePricingPure({ resolvedItems: [], coupon: null });
  }

  // 1. Merge duplicates by productId + variantId and sanitize quantities
  const mergedMap = new Map<string, { productId: string; variantId: string | null; quantity: number }>();
  for (const item of items) {
    const id = item.productId || item.id;
    if (!id) continue;
    const key = `${id}:${item.variantId || "null"}`;
    const existing = mergedMap.get(key);
    const qty = Math.max(1, Math.floor(item.quantity || 1));
    if (existing) {
      existing.quantity += qty;
    } else {
      mergedMap.set(key, { productId: id, variantId: item.variantId || null, quantity: qty });
    }
  }

  const mergedItems = Array.from(mergedMap.values());
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();
  const productIds = Array.from(new Set(mergedItems.map((i) => i.productId)));

  // 2. Fetch authoritative products from Supabase
  const { data: dbProducts, error: prodErr } = await adminClient
    .from("products")
    .select("id, category_id, name, price, sale_price, stock, status, sku, gst_rate")
    .in("id", productIds);

  if (prodErr || !dbProducts) {
    throw new Error("Failed to load products from database for pricing verification.");
  }

  // Category fallback for GST rates
  const categoryIds = Array.from(
    new Set(dbProducts.map((p) => p.category_id).filter(Boolean))
  );
  let categoryGstMap = new Map<string, number>();
  if (categoryIds.length > 0) {
    const { data: dbCategories } = await adminClient
      .from("categories")
      .select("id, gst_rate")
      .in("id", categoryIds);
    if (dbCategories) {
      categoryGstMap = new Map(
        dbCategories.map((c) => [c.id, Number(c.gst_rate ?? DEFAULT_GST_RATE)])
      );
    }
  }

  // Fetch variants if requested
  const variantIds = mergedItems
    .map((i) => i.variantId)
    .filter((id): id is string => Boolean(id));

  let dbVariantsMap = new Map<string, any>();
  if (variantIds.length > 0) {
    const { data: dbVariants } = await adminClient
      .from("product_variants")
      .select("id, product_id, name, sku, price, sale_price, stock, is_active")
      .in("id", variantIds);

    if (dbVariants) {
      dbVariantsMap = new Map(dbVariants.map((v) => [v.id, v]));
    }
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 3. Resolve items with authoritative data
  const resolvedItems = mergedItems.map((item) => {
    const prod = productMap.get(item.productId);
    if (!prod) {
      throw new Error(`Product not found for ID ${item.productId}`);
    }

    const categoryGst = prod.category_id ? categoryGstMap.get(prod.category_id) : undefined;
    const gstRate = prod.gst_rate != null ? Number(prod.gst_rate) : categoryGst ?? DEFAULT_GST_RATE;

    if (item.variantId) {
      const variant = dbVariantsMap.get(item.variantId);
      if (variant && variant.product_id === prod.id) {
        return {
          productId: prod.id,
          variantId: variant.id,
          name: `${prod.name} (${variant.name})`,
          sku: variant.sku || prod.sku,
          quantity: item.quantity,
          price: Number(variant.price ?? prod.price),
          salePrice: variant.sale_price != null ? Number(variant.sale_price) : Number(prod.sale_price),
          gstRate,
        };
      }
    }

    return {
      productId: prod.id,
      variantId: null,
      name: prod.name,
      sku: prod.sku,
      quantity: item.quantity,
      price: Number(prod.price),
      salePrice: prod.sale_price != null ? Number(prod.sale_price) : null,
      gstRate,
    };
  });

  // 4. Resolve coupon from database if provided
  let couponData: {
    code: string;
    discountType: "percentage" | "fixed" | "freeship";
    discountValue: number;
    minimumOrderAmountPaise?: number;
    maximumDiscountPaise?: number;
  } | null = null;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();

    // Query active coupons in Supabase
    const { data: dbCoupon } = await adminClient
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .maybeSingle();

    if (dbCoupon) {
      const now = new Date();
      const start = new Date(dbCoupon.start_date);
      const end = new Date(dbCoupon.end_date);
      const isDateValid = now >= start && now <= end;

      if (isDateValid) {
        couponData = {
          code: dbCoupon.code,
          discountType: dbCoupon.discount_type === "percentage" ? "percentage" : "fixed",
          discountValue: Number(dbCoupon.discount_value),
          minimumOrderAmountPaise: Math.round(Number(dbCoupon.minimum_order_amount || 0) * 100),
          maximumDiscountPaise: dbCoupon.maximum_discount ? Math.round(Number(dbCoupon.maximum_discount) * 100) : undefined,
        };
      }
    } else {
      // Fallback built-in coupons support
      if (cleanCode === "SAVE10") {
        couponData = { code: "SAVE10", discountType: "percentage", discountValue: 10 };
      } else if (cleanCode === "SAVE20") {
        couponData = { code: "SAVE20", discountType: "percentage", discountValue: 20 };
      } else if (cleanCode === "FREESHIP") {
        couponData = { code: "FREESHIP", discountType: "freeship", discountValue: 0 };
      }
    }
  }

  return calculatePricingPure({
    resolvedItems,
    coupon: couponData,
  });
}
