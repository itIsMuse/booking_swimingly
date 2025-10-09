// src/app/booking/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Simple booking client:
 * - fetch available slots from /api/slots
 * - pick a slot, fill name/email/phone
 * - initiate Paystack payment by POST /api/bookings/initiate
 * - on success: redirect to authorization_url
 *
 * Business: amount is 100000 NGN (pack), payment required before booking is finalized.
 */

type Slot = {
  _id: string;
  coachId?: string;
  locationId?: string;
  start: string;
  end: string;
  capacity: number;
  spotsLeft: number;
  locationName?: string;
};

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoadingSlots(true);
    try {
      const res = await axios.get("/api/slots");
      setSlots(res.data?.slots || []);
    } catch (err: any) {
      console.error(err);
      setError("Could not load slots. Try refreshing the page.");
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedSlotId) {
      setError("Please select a timeslot.");
      return;
    }
    if (!form.name || !form.email || !form.phone) {
      setError("Please provide your name, email, and phone.");
      return;
    }

    setSubmitting(true);
    try {
      // Call booking initiate endpoint which initializes Paystack and returns authorization_url
      const res = await axios.post("/api/bookings/initiate", {
        slotId: selectedSlotId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        notes: form.notes || "",
        amountNGN: 100000, // 100,000 NGN pack
        purpose: "CLASS_PACK", // used in webhook to finalize booking
      });

      const authUrl = res.data?.authorization_url || res.data?.data?.data?.authorization_url || res.data?.data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        // fallback response shape
        alert("Payment initialized. If you are not redirected, check the console or try again.");
        console.log("init result", res.data);
      }
    } catch (err: any) {
      console.error("init payment error", err?.response?.data || err.message);
      setError(err?.response?.data?.error || "Could not initiate payment. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100vh] bg-[#00102e] py-12 px-4">
  <div className="max-w-4xl mx-auto bg-[#084f70] rounded-2xl shadow-2xl p-8 border border-[#0a6b9a]/40 text-white">
    {/* Title */}
    <h1 className="text-3xl font-bold text-white mb-2">Book a Class</h1>
    <p className="text-sm text-slate-200 mb-6">
      Choose an available time slot, fill in your details, and pay{" "}
      <strong className="text-[#FFD43B]">₦100,000</strong> to confirm your 10-class pack. Pool fees are paid separately at the pool.
    </p>

    <div className="grid md:grid-cols-2 gap-8">
      {/* Slots Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#FFD43B] mb-4">Available Slots</h2>

        {loadingSlots ? (
          <div className="text-slate-300">Loading slots…</div>
        ) : slots.length === 0 ? (
          <div className="text-slate-300 border border-dashed border-[#FFD43B]/40 rounded-xl p-4 text-center bg-[#001b3f]">
            No slots available. Please check back later or contact us on WhatsApp 💬
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-[#FFD43B]/50">
            {slots.map((s) => (
              <label
                key={s._id}
                className={`block p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-[0_0_10px_#00c8ff50] hover:-translate-y-[1px] ${
                  selectedSlotId === s._id
                    ? "border-[#FFD43B] bg-[#001b3f] shadow-[0_0_15px_#00c8ff80]"
                    : "border-[#0f3854] hover:border-[#00c8ff]/60"
                }`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={s._id}
                  checked={selectedSlotId === s._id}
                  onChange={() => setSelectedSlotId(s._id)}
                  className="mr-3 accent-[#FFD43B]"
                />
                <span className="font-medium text-white">
                  {new Date(s.start).toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <div className="text-sm text-slate-300 mt-1">
                  {s.locationName ? `${s.locationName} · ` : ""} Spots left:{" "}
                  <span className="text-[#FFD43B] font-semibold">{s.spotsLeft}</span> · Duration:{" "}
                  {Math.round((new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000)} mins
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#FFD43B] mb-4">Your Details</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full bg-[#001b3f] text-white border border-[#0f3854] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400 transition-all duration-200"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-[#001b3f] text-white border border-[#0f3854] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400 transition-all duration-200"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone (+234...)"
            className="w-full bg-[#001b3f] text-white border border-[#0f3854] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400 transition-all duration-200"
            required
          />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes (optional)"
            className="w-full bg-[#001b3f] text-white border border-[#0f3854] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-[#00c8ff] placeholder-slate-400 transition-all duration-200"
            rows={3}
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-300">
              Payment due on booking:{" "}
              <strong className="text-[#FFD43B]">₦100,000</strong>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#FFD43B] hover:bg-[#e6be33] text-[#00102e] font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_0_10px_#FFD43B] disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Pay & Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Policy Footer */}
    <div className="mt-8 text-xs text-slate-300 border-t border-[#0f3854] pt-4 text-center">
      By confirming, you agree to our{" "}
      <span className="text-[#FFD43B] font-medium">cancellation policy</span>:
      cancellations less than 1 hour before class will be counted as used.
    </div>
  </div>
</div>

  );
}
