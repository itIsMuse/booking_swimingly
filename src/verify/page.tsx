"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const [message, setMessage] = useState("Verifying payment...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setMessage("No payment reference found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        if (res.ok) {
          setMessage("✅ Payment verified successfully! Booking confirmed.");
          setTimeout(() => {
            router.push("/booking"); // redirect to booking or dashboard
          }, 3000);
        } else {
          setMessage("❌ Payment verification failed. Please contact support.");
          console.error(data);
        }
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Error verifying payment. Try again later.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold">{message}</h1>
      <p className="text-gray-500 mt-3">
        You’ll be redirected shortly...
      </p>
    </div>
  );
}
