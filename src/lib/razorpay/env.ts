/**
 * Razorpay Environment Variables Helper & Validator
 * Ensures secret keys are never loaded into the client bundle and required keys are present.
 */

export function getRazorpayServerEnv() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID environment variable. Please configure it in .env.local."
    );
  }

  if (!keySecret) {
    throw new Error(
      "Missing RAZORPAY_KEY_SECRET environment variable. Please configure it in .env.local."
    );
  }

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret || "",
    isTestMode: keyId.startsWith("rzp_test_"),
  };
}

export function getRazorpayPublicEnv() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error(
      "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable. Please configure it in .env.local."
    );
  }

  return {
    keyId,
    isTestMode: keyId.startsWith("rzp_test_"),
  };
}
