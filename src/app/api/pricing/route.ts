import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateAuthoritativePricing } from "@/lib/pricing";
import { createClient as createServerClient } from "@/lib/supabase/server";

const pricingRequestSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().optional(),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(10).default(1),
      })
    )
    .default([]),
  couponCode: z.string().optional().nullable(),
  destination: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = pricingRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid pricing request format." },
        { status: 400 }
      );
    }

    const { items, couponCode, destination } = parsed.data;

    // Optional user email resolution if authenticated
    let userEmail: string | null = null;
    try {
      const userClient = await createServerClient();
      const { data: { user } } = await userClient.auth.getUser();
      if (user?.email) userEmail = user.email;
    } catch {
      // Unauthenticated cart estimate is allowed
    }

    const pricing = await calculateAuthoritativePricing({
      items: items.map((i) => ({
        productId: i.productId || i.id,
        variantId: i.variantId || null,
        quantity: i.quantity,
      })),
      couponCode: couponCode || null,
      userEmail,
      destination: destination || null,
    });

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (err: unknown) {
    console.error("Pricing calculation error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to calculate authoritative pricing.",
      },
      { status: 500 }
    );
  }
}
