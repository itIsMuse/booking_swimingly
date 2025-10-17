"use client";
import React, { useState } from "react";
import axios from "axios";

export default function PaymentPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = 150000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.phone) return setError("All fields required");
    setSubmitting(true);

    try {
      const res = await axios.post("/bookings/initiate", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        amountNGN: price,
        purpose: "CLASS_PACK",
      });

      const authUrl =
        res.data?.authorization_url || res.data?.data?.authorization_url;

      if (authUrl) {
        window.location.href = authUrl; // Redirect user to Paystack payment page
      } else {
        setError("Could not get payment link from Paystack.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Payment initialization failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#00102e] text-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#084f70] p-8 rounded-2xl border border-[#0a6b9a]/40 shadow-2xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Confirm Your Class Pack</h1>
        <p className="mb-6">
          Payment required:{" "}
          <strong className="text-[#FFD43B]">₦{price.toLocaleString()}</strong>
        </p>

        <input
          name="name"
          placeholder="Full name"
          className="w-full mb-3 px-4 py-2 rounded bg-[#001b3f] border border-[#0f3854] text-white"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded bg-[#001b3f] border border-[#0f3854] text-white"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          name="phone"
          placeholder="Phone (+234...)"
          className="w-full mb-4 px-4 py-2 rounded bg-[#001b3f] border border-[#0f3854] text-white"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#FFD43B] text-[#00102e] font-semibold py-2 rounded hover:bg-[#e6be33]"
        >
          {submitting ? "Processing..." : "Pay ₦150,000"}
        </button>
      </form>
    </div>
  );
}
