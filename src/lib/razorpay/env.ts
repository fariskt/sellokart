/**
 * Razorpay Environment Variables Helper & Validator
 * Ensures secret keys are validated properly and never empty.
 */

export function getRazorpayServerEnv() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keyId.trim()) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID environment variable. Please configure it in .env.local."
    );
  }

  if (!keySecret || !keySecret.trim()) {
    throw new Error(
      "Missing RAZORPAY_KEY_SECRET environment variable. Please configure it in .env.local."
    );
  }

  if (!webhookSecret || !webhookSecret.trim()) {
    throw new Error(
      "Missing RAZORPAY_WEBHOOK_SECRET environment variable. Please configure it in .env.local."
    );
  }

  return {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
    webhookSecret: webhookSecret.trim(),
    isTestMode: keyId.startsWith("rzp_test_"),
  };
}

export function getRazorpayPublicEnv() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

  if (!keyId || !keyId.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable. Please configure it in .env.local."
    );
  }

  return {
    keyId: keyId.trim(),
    isTestMode: keyId.startsWith("rzp_test_"),
  };
}
