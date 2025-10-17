import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Missing name or email" },
        { status: 400 }
      );
    }

    // ✅ Connect to MongoDB
    await connectToDB();

    // ✅ Amount (₦150,000) in Kobo
    const amount = 150000 * 100;

    // ✅ Unique Paystack reference
    const reference = `swim_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // ✅ Payload for Paystack
    const payload = {
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking?reference=${reference}`,
      metadata: {
        name,
        purpose: "CLASS_PACK",
      },
    };

    // ✅ Send to Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url } = response.data.data;

    // ✅ Save payment as "PENDING"
    await Payment.create({
      name,
      email,
      amount: amount / 100, // store in Naira
      reference,
      status: "PENDING",
    });

    // ✅ Return URL for redirect
    return NextResponse.json({
      success: true,
      authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error(
      "❌ Paystack initialization error:",
      error?.response?.data || error.message
    );

    return NextResponse.json(
      { success: false, error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
