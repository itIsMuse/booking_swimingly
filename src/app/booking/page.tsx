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
    <div className="min-h-[70vh] py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-2">Book a class</h1>
        <p className="text-sm text-slate-600 mb-4">
          Choose an available timeslot, enter your contact details, then pay ₦100,000 to confirm your 10-class pack. Pool fees are paid separately at the pool.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">Available slots</h2>
            {loadingSlots ? (
              <div>Loading slots…</div>
            ) : slots.length === 0 ? (
              <div>No slots available. Please check back later or contact us on WhatsApp.</div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-auto">
                {slots.map((s) => (
                  <label
                    key={s._id}
                    className={`block p-3 rounded-lg border cursor-pointer ${
                      selectedSlotId === s._id ? "border-swimPrimary bg-swimPrimary/5" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={s._id}
                      checked={selectedSlotId === s._id}
                      onChange={() => setSelectedSlotId(s._id)}
                      className="mr-3"
                    />
                    <span className="font-medium">
                      {new Date(s.start).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <div className="text-sm text-slate-500">
                      {s.locationName ? `${s.locationName} · ` : ""} Spots left: {s.spotsLeft} · Duration: {Math.round((new Date(s.end).getTime()-new Date(s.start).getTime())/60000)} mins
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold mb-3">Your details</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (+234...)"
                className="w-full border rounded px-3 py-2"
                required
              />
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Notes (optional)"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Payment due on booking: <strong>₦100,000</strong>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-swimPrimary text-white px-4 py-2 rounded disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Pay & Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          By confirming you agree to our cancellation policy: cancellations less than 1 hour before class will be counted as used.
        </div>
      </div>
    </div>
  );
}
