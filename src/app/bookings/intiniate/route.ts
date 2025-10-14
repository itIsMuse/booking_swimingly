// src/app/api/bookings/initiate/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment"; // ✅ ensure the file exists

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ error: "Missing details" }, { status: 400 });
    }

    await connectToDB();

    const amount = 150000 * 100; // Paystack uses kobo
    const reference = `swim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ✅ Initialize Paystack transaction
    const payload = {
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking?reference=${reference}`,
      metadata: { name, purpose: "CLASS_PACK" },
    };

    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Save payment info in DB (pending)
    await Payment.create({
      name,
      email,
      amount: amount / 100,
      reference,
      status: "PENDING",
    });

    // ✅ Return Paystack URL
    return NextResponse.json({
      success: true,
      authorization_url: res.data.data.authorization_url,
      reference,
    });
  } catch (err: any) {
    console.error("Paystack init error:", err?.response?.data || err.message);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
