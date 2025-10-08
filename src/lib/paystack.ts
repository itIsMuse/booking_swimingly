// lib/paystack.ts
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET) {
  console.warn("PAYSTACK_SECRET_KEY not set in env");
}

export const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

/**
 * Initialize a Paystack transaction
 */
export async function initializeTransaction(amountKobo: number, email: string, metadata?: Record<string, any>) {
  const payload = {
    amount: amountKobo,
    email,
    metadata: metadata || {},
  };
  const res = await paystackClient.post("/transaction/initialize", payload);
  return res.data;
}

/**
 * Verify transaction by reference
 */
export async function verifyTransaction(reference: string) {
  const res = await paystackClient.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return res.data;
}

/**
 * Verify webhook signature
 */
export function verifyPaystackSignature(payloadRaw: string | Buffer, signatureHeader?: string) {
  if (!signatureHeader) return false;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac("sha512", secret!).update(payloadRaw).digest("hex");
  return hash === signatureHeader;
}
