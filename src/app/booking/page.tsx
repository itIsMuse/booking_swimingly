"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Slot = {
  _id: string;
  date: string;
  time: string;
  location: string;
  isBooked: boolean;
};

export default function BookingPage() {
  const [verified, setVerified] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify payment on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!reference) {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await axios.get(`/api/bookings/verify?reference=${reference}`);
        if (res.data.verified) {
          setVerified(true);
          fetchSlots();
        } else {
          setError("Payment verification failed.");
        }
      } catch (err) {
        setError("Could not verify payment.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, []);

  async function fetchSlots() {
    try {
      const res = await axios.get("/api/slots");
      setSlots(res.data?.slots || []);
    } catch {
      setError("Failed to load available slots.");
    }
  }

  async function confirmBooking() {
    if (!selectedSlot) return alert("Select a timeslot first");
    try {
      await axios.post("/api/bookings/confirm", { slotId: selectedSlot });
      alert("Booking confirmed successfully! 🎉");
    } catch (err) {
      console.error(err);
      alert("Could not confirm booking.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#00102e] text-white flex items-center justify-center">
        Verifying payment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#00102e] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#00102e] text-white flex items-center justify-center">
        Payment not verified.
      </div>
    );
  }

  // If verified
  return (
    <div className="min-h-screen bg-[#00102e] text-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-[#084f70] rounded-2xl p-8 border border-[#0a6b9a]/40 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#FFD43B] mb-4">
          Choose Your Class Slot
        </h1>
        {slots.length === 0 ? (
          <p>No available slots yet.</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <label
                key={slot._id}
                className={`block p-4 border rounded-xl cursor-pointer transition ${
                  selectedSlot === slot._id
                    ? "border-[#FFD43B] bg-[#001b3f]"
                    : "border-[#0f3854]"
                }`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot._id}
                  checked={selectedSlot === slot._id}
                  onChange={() => setSelectedSlot(slot._id)}
                  className="mr-3 accent-[#FFD43B]"
                />
                {new Date(slot.date).toLocaleDateString("en-GB")} ·{" "}
                {slot.time} · {slot.location}
              </label>
            ))}
          </div>
        )}
        <button
          onClick={confirmBooking}
          className="mt-6 bg-[#FFD43B] text-[#00102e] px-6 py-2 rounded-lg font-semibold hover:bg-[#e6be33]"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
