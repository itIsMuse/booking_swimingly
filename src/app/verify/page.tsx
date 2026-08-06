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
        const res = await fetch(
          `/api/bookings/verify?reference=${reference}`
        );

        const data = await res.json();

        if (res.ok) {
          setMessage("✅ Payment verified successfully!");

          setTimeout(() => {
            router.push(`/welcome?id=${data.studentId}`);
          }, 1500);
        } else {
          setMessage("❌ Payment verification failed.");
          console.error(data);
        }
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Something went wrong.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">{message}</h1>
    </div>
  );
}