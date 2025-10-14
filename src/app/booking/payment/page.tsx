"use client";

import { useState } from "react";
import axios from "axios";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handlePayment = async () => {
    if (!email || !name) return alert("Enter name and email");
    setLoading(true);
    try {
      const res = await axios.post("/api/bookings/initiate", { email, name });
      window.location.href = res.data.authUrl; // Redirect to Paystack
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00102e] text-white flex flex-col items-center justify-center">
      <div className="bg-[#084f70] p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#FFD43B] mb-6">Book Your 10-Class Pack</h1>
        <input
          className="w-full p-3 rounded mb-4 text-black"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-3 rounded mb-4 text-black"
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-[#FFD43B] text-[#00102e] w-full py-3 rounded-lg font-semibold hover:bg-[#e6be33]"
        >
          {loading ? "Redirecting to Paystack..." : "Pay ₦150,000"}
        </button>
      </div>
    </div>
  );
}
