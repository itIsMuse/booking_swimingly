import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Student from "@/lib/models/Student";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment reference",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    // 1. Find the payment record
    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment record not found",
        },
        { status: 404 }
      );
    }

    // 2. Verify payment directly with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await verifyRes.json();

    if (!verifyRes.ok || result.data?.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    // 3. Get customer information
    const customerEmail = result.data.customer.email;

    const name =
      result.data.metadata?.name ||
      payment.name ||
      "Swimingly Student";

    const phone =
      result.data.metadata?.phone ||
      payment.phone ||
      "";

    // 4. Mark payment as paid
    payment.status = "PAID";
    payment.meta = result.data;
    await payment.save();

    // 5. Create or update student
    const student = await Student.findOneAndUpdate(
      { email: customerEmail },
      {
        fullName: name,
        email: customerEmail,
        phone: phone,
        paymentStatus: "paid",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // 6. Send student ID to the frontend
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      studentId: student._id.toString(),
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}