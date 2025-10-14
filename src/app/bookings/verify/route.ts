// src/app/api/bookings/verify/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import  Payment  from "@/lib/models/Payment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference)
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  await connectToDB();

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );

    const data = res.data.data;

    if (data.status !== "success") {
      return NextResponse.json({ verified: false, data });
    }

    // Update Payment in DB
    await Payment.findOneAndUpdate(
      { reference },
      { status: "PAID", meta: { ...data } },
      { new: true }
    );

    return NextResponse.json({ verified: true, data });
  } catch (err: any) {
    console.error("Verify error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
