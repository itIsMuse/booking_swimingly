// src/app/api/bookings/initiate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { initializeTransaction } from "@/lib/paystack"; // helper included below

const BodySchema = z.object({
  slotId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  notes: z.string().optional(),
  amountNGN: z.number().positive(),
  purpose: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const { slotId, name, email, phone, notes, amountNGN, purpose } = parsed.data;
  const amountKobo = Math.round(amountNGN * 100);

  // create unique reference
  const reference = `swim_${purpose || "BOOKING"}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // store a payment row in DB (INITIATED) with metadata including slot & client info
  await Payment.create({
    userId: null,
    amountKobo,
    currency: "NGN",
    provider: "PAYSTACK",
    reference,
    status: "INITIATED",
    meta: {
      slotId,
      client: { name, email, phone, notes },
      purpose: purpose || "CLASS_PACK",
    },
  });

  try {
    const res = await initializeTransaction(amountKobo, email, {
      reference,
      slotId,
      name,
      phone,
      notes,
      purpose,
    });

    // Paystack initialization returns authorization_url
    // return the response to the client
    return NextResponse.json(res.data || res);
  } catch (err: any) {
    console.error("Paystack init error", err?.response?.data || err.message || err);
    return NextResponse.json({ error: "Could not initialize payment" }, { status: 500 });
  }
}
