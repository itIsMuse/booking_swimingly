import { NextResponse } from "next/server";
import Booking from "@/lib/models/Booking";
import Student from "@/lib/models/Student";
import { connectToDB } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Missing reference" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    // Verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await verifyRes.json();

    if (result.data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    const customerEmail = result.data.customer.email;

    // Update booking
    const booking = await Booking.findOneAndUpdate(
      {
        email: customerEmail,
        paymentStatus: "pending",
      },
      {
        paymentStatus: "paid",
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or already paid",
        },
        { status: 404 }
      );
    }

    // Create or update student
    await Student.findOneAndUpdate(
      {
        email: booking.email,
      },
      {
        fullName: booking.name,
        email: booking.email,
        phone: booking.phone,
        paymentStatus: "paid",
        package: Number(booking.package),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}