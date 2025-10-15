"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 If no payment reference, redirect to pay page
    if (!reference) {
      router.replace("/pay");
      return;
    }

    // 🔍 Verify payment
    const verifyPayment = async () => {
      try {
        const res = await axios.get(`/api/payments/verify?reference=${reference}`);
        if (res.data.status === "PAID") {
          setVerified(true);
        } else {
          alert("Payment not verified. Please contact support.");
          router.replace("/pay");
        }
      } catch (err) {
        console.error("Verification failed", err);
        router.replace("/pay");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying your payment, please wait...</p>
      </div>
    );
  }

  if (!verified) return null;

  // ✅ Only show available slots when verified
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Select a Timeslot</h1>
      {/* Slot selection UI goes here */}
      <p className="text-gray-700 mb-2">✅ Payment verified. You can now select a class slot.</p>
      {/* Later: Load slots from your backend */}
    </div>
  );
}
