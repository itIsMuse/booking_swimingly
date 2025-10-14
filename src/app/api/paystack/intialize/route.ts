import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, amount, bookingId } = body;

  if (!email || !amount || !bookingId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  await connectToDB();

  // Create Payment record first
  const payment = await Payment.create({
    email,
    amount,
    status: "PENDING",
    meta: { bookingId },
  });

  // Call Paystack initialize endpoint
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: amount * 100, // Paystack uses kobo
      reference: payment._id.toString(),
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Save reference in DB
  payment.reference = response.data.data.reference;
  await payment.save();

  return NextResponse.json({ authorization_url: response.data.data.authorization_url });
}
