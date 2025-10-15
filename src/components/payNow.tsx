"use client";

import { useState } from "react";
import axios from "axios";

export default function PayNow() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email) {
      setError("Please fill in your name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/bookings/initiate", form);
      const authUrl = res.data?.authUrl;

      if (authUrl) {
        window.location.href = authUrl; // redirect to Paystack
      } else {
        setError("Could not start payment. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Payment initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00102e] flex justify-center items-center p-4">
      <div className="bg-[#084f70] text-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#0a6b9a]/40">
        <h1 className="text-2xl font-bold mb-2 text-[#FFD43B]">Start Your Booking</h1>
        <p className="text-sm text-slate-300 mb-6">
          Pay <strong className="text-[#FFD43B]">₦150,000</strong> to unlock available timeslots for your 10-class package.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-[#001b3f] border border-[#0f3854] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[#001b3f] border border-[#0f3854] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#FFD43B] hover:bg-[#e6be33] text-[#00102e] font-semibold w-full py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_0_10px_#FFD43B] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay ₦150,000 Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
