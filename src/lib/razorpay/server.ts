import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getRazorpayServerEnv } from "./env";

let razorpayInstance: Razorpay | null = null;

/**
 * Get or initialize the Razorpay server SDK singleton instance.
 */
export function getRazorpayClient(): Razorpay {
  if (!razorpayInstance) {
    const { keyId, keySecret } = getRazorpayServerEnv();
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

/**
 * Verify Razorpay payment signature from Checkout.js
 * HMAC SHA256 of `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const { keySecret } = getRazorpayServerEnv();
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(text)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature, "utf-8");
  const receivedBuffer = Buffer.from(signature, "utf-8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Verify Razorpay webhook signature (X-Razorpay-Signature header)
 * HMAC SHA256 of the raw unparsed request body using `RAZORPAY_WEBHOOK_SECRET`.
 * Uses constant-time comparison.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!rawBody || !signature) {
    return false;
  }

  const { webhookSecret } = getRazorpayServerEnv();
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature, "utf-8");
  const receivedBuffer = Buffer.from(signature, "utf-8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
