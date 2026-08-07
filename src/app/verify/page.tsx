"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
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
          `/api/bookings/verify?reference=${encodeURIComponent(reference)}`
        );

        const data = await res.json();

        if (res.ok && data.studentId) {
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
    <main className="min-h-screen bg-[#00102e] flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
        <h1 className="text-2xl font-semibold text-[#00102e]">
          {message}
        </h1>

        <p className="text-gray-500 mt-3">
          Please wait...
        </p>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Verifying payment...</div>}>
      <VerifyContent />
    </Suspense>
  );
}