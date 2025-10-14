"use client";
import { useState } from "react";

export default function BookNow({ bookingId, email }: { bookingId: string; email: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: 150000,
          bookingId,
        }),
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url; // redirect to Paystack
      } else {
        alert("Unable to initialize payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to payment server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-[#005ae2] text-white px-6 py-3 rounded-lg shadow-md"
    >
      {loading ? "Processing..." : "Pay ₦150,000"}
    </button>
  );
}
