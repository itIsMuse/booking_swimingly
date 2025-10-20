"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function BookingPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "idle">("idle");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");
      if (!reference) return;

      setStatus("loading");

      try {
        const res = await axios.get(`/api/bookings/verify?reference=${reference}`);
        if (res.data.verified) {
          setStatus("success");
          setData(res.data.data);
        } else {
          setStatus("failed");
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold">Verifying your payment...</h2>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h2>
        <p className="mt-2 text-gray-700">
          Thank you {data?.customer?.first_name || "Customer"}! <br />
          Your transaction was successful.
        </p>

        <div className="mt-4 bg-gray-100 rounded-lg p-4 shadow w-[320px]">
          <p><strong>Reference:</strong> {data?.reference}</p>
          <p><strong>Amount:</strong> ₦{Number(data?.amount / 100).toLocaleString()}</p>
          <p><strong>Date:</strong> {new Date(data?.paid_at).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold text-red-600">Payment Failed ❌</h2>
        <p className="mt-2 text-gray-700">
          Sorry, we couldn’t verify your transaction.
        </p>
      </div>
    );
  }

  return null;
}
