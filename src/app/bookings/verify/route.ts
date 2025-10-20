// src/app/api/bookings/verify/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing transaction reference" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Fetch payment record
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    // ✅ Verify transaction from Paystack
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      }
    );

    const data = res.data.data;

    // Check status
    if (data.status !== "success") {
      return NextResponse.json({ success: false, verified: false, data });
    }

    // ✅ Update only if not already marked paid
    if (payment.status !== "paid") {
      await Payment.findOneAndUpdate(
        { reference },
        {
          status: "paid",
          meta: data,
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
      data,
    });
  } catch (err: any) {
    console.error("❌ Verification error:", err.response?.data || err.message);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
