import assert from "node:assert";
import { calculatePricingPure, isSalePriceValid } from "../src/lib/pricing.ts";

console.log("=================================================");
console.log("UNIT TESTS: PRICING ENGINE (lib/pricing.ts)");
console.log("=================================================\n");

// 1. Sale price validity tests
console.log("1. Testing Sale Price Validity...");

// Sale price valid when less than price
assert.strictEqual(
  isSalePriceValid(1000, 800),
  true,
  "Sale price < price should be valid"
);

// Sale price invalid when >= price
assert.strictEqual(
  isSalePriceValid(1000, 1000),
  false,
  "Sale price == price should be invalid"
);
assert.strictEqual(
  isSalePriceValid(1000, 1200),
  false,
  "Sale price > price should be invalid"
);
assert.strictEqual(
  isSalePriceValid(1000, 0),
  false,
  "Sale price 0 should be invalid"
);

// Date range checks
const pastDate = new Date(Date.now() - 100000).toISOString();
const futureDate = new Date(Date.now() + 100000).toISOString();
const farPastDate = new Date(Date.now() - 200000).toISOString();

assert.strictEqual(
  isSalePriceValid(1000, 800, pastDate, futureDate),
  true,
  "Sale price within start/end dates should be valid"
);
assert.strictEqual(
  isSalePriceValid(1000, 800, futureDate, null),
  false,
  "Sale price before start date should be invalid"
);
assert.strictEqual(
  isSalePriceValid(1000, 800, farPastDate, pastDate),
  false,
  "Sale price after end date should be invalid"
);
console.log("✓ Sale price validity tests passed.\n");

// 2. Single item ₹2,999 case (Constraint from user prompt: total ₹2,999.00, shipping free)
console.log("2. Testing Single item ₹2,999 Case...");
{
  const result = calculatePricingPure({
    resolvedItems: [
      {
        productId: "prod-2999",
        variantId: null,
        name: "Premium Watch",
        sku: "WATCH-2999",
        quantity: 1,
        price: 2999,
        gstRate: 18,
      },
    ],
    coupon: null,
  });

  assert.strictEqual(result.subtotalPaise, 299900, "Subtotal should be 299,900 paise (₹2,999.00)");
  assert.strictEqual(result.discountPaise, 0, "Discount should be 0");
  assert.strictEqual(result.shippingPaise, 0, "Shipping should be free (0 paise) for ₹2,999 >= ₹1,999");
  assert.strictEqual(result.isFreeShipping, true, "isFreeShipping should be true");
  assert.strictEqual(result.totalPaise, 299900, "Total should be exactly 299,900 paise (₹2,999.00)");
  assert.strictEqual(result.total, 2999, "Display total should be 2,999");

  // GST extracted from inclusive price:
  // Base = (299900 * 10000) / 11800 = 254153 paise = ₹2,541.53
  // GST = 299900 - 254153 = 45747 paise = ₹457.47
  assert.strictEqual(result.lineItems[0].baseAmountPaise, 254153, "Base should be 254,153 paise");
  assert.strictEqual(result.lineItems[0].gstAmountPaise, 45747, "GST should be 45,747 paise");
  assert.strictEqual(result.gstAmountPaise, 45747, "Total GST should be 45,747 paise (₹457.47)");

  // Strict check: Base + GST MUST equal payable exactly
  assert.strictEqual(
    result.lineItems[0].baseAmountPaise + result.lineItems[0].gstAmountPaise,
    result.lineItems[0].payablePaise,
    "Base + GST must exactly equal line payable"
  );
  console.log(`✓ ₹2,999 single item test passed: Total = ₹${result.total.toFixed(2)}, GST = ₹${result.gstAmount.toFixed(2)} (included, not added on top).\n`);
}

// 3. Multi-line coupon apportionment and GST recomputation
console.log("3. Testing Multi-line Coupon Apportionment & GST Extraction...");
{
  const result = calculatePricingPure({
    resolvedItems: [
      {
        productId: "p1",
        variantId: null,
        name: "Item A (18% GST)",
        sku: "A",
        quantity: 2,
        price: 500, // 2 * 500 = 1,000 (100,000 paise)
        gstRate: 18,
      },
      {
        productId: "p2",
        variantId: null,
        name: "Item B (12% GST)",
        sku: "B",
        quantity: 1,
        price: 1000, // 1 * 1000 = 1,000 (100,000 paise)
        gstRate: 12,
      },
    ],
    coupon: {
      code: "SAVE20",
      discountType: "percentage",
      discountValue: 20, // 20% off 2,000 = 400 (40,000 paise)
    },
  });

  assert.strictEqual(result.subtotalPaise, 200000, "Subtotal should be 200,000 paise (₹2,000.00)");
  assert.strictEqual(result.discountPaise, 40000, "Discount should be 40,000 paise (₹400.00)");

  // Sum of line discounts must equal total coupon discount exactly
  const sumDiscounts = result.lineItems.reduce((acc, l) => acc + l.discountPaise, 0);
  assert.strictEqual(sumDiscounts, 40000, "Line discounts sum must exactly equal 40,000 paise");

  // Since both lines have equal total (100,000 paise each), each gets 20,000 paise discount
  assert.strictEqual(result.lineItems[0].discountPaise, 20000, "Line 1 discount should be 20,000 paise");
  assert.strictEqual(result.lineItems[1].discountPaise, 20000, "Line 2 discount should be 20,000 paise");

  assert.strictEqual(result.lineItems[0].payablePaise, 80000, "Line 1 payable should be 80,000 paise");
  assert.strictEqual(result.lineItems[1].payablePaise, 80000, "Line 2 payable should be 80,000 paise");

  // GST recomputed on payable:
  // Line 1 (18%): Base = (80000 * 10000) / 11800 = 67797. GST = 80000 - 67797 = 12203
  assert.strictEqual(result.lineItems[0].gstAmountPaise, 12203, "Line 1 GST should be 12,203 paise");
  // Line 2 (12%): Base = (80000 * 10000) / 11200 = 71429. GST = 80000 - 71429 = 8571
  assert.strictEqual(result.lineItems[1].gstAmountPaise, 8571, "Line 2 GST should be 8,571 paise");

  assert.strictEqual(result.gstAmountPaise, 12203 + 8571, "Total GST should equal sum of line GSTs");
  console.log("✓ Multi-line coupon apportionment and GST recomputation passed.\n");
}

// 4. Rounding remainder distribution (1 odd paise)
console.log("4. Testing Integer Paise Remainder Distribution...");
{
  const result = calculatePricingPure({
    resolvedItems: [
      {
        productId: "p1",
        variantId: null,
        name: "Item 1",
        sku: "1",
        quantity: 1,
        price: 333.33,
        gstRate: 18,
      },
      {
        productId: "p2",
        variantId: null,
        name: "Item 2",
        sku: "2",
        quantity: 1,
        price: 333.33,
        gstRate: 18,
      },
      {
        productId: "p3",
        variantId: null,
        name: "Item 3",
        sku: "3",
        quantity: 1,
        price: 333.34,
        gstRate: 18,
      },
    ],
    coupon: {
      code: "FLAT10",
      discountType: "fixed",
      discountValue: 10, // 1000 paise to divide across 3 items
    },
  });

  const sumDiscounts = result.lineItems.reduce((acc, l) => acc + l.discountPaise, 0);
  assert.strictEqual(sumDiscounts, 1000, "Exact 1,000 paise allocated across 3 items with zero leakage");
  console.log("✓ Integer paise remainder distribution test passed.\n");
}

console.log("=================================================");
console.log("ALL PRICING ENGINE UNIT TESTS PASSED SUCCESSFULLY");
console.log("=================================================");
