"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format, addDays } from "date-fns";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isBooked: boolean;
}

export default function BookingPage() {
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false); // for simulation
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    if (ref) setReference(ref);

    // Uncomment to verify payment
    /*
    if (ref) verifyPayment(ref);
    */

    loadSlots();
  }, []);

  // async function verifyPayment(ref: string) {
  //   setMsg("Verifying payment...");
  //   try {
  //     const res = await axios.get(`/api/bookings/verify?reference=${ref}`);
  //     if (res.data.verified) {
  //       setVerified(true);
  //       loadSlots();
  //     } else {
  //       setMsg("Payment could not be verified.");
  //     }
  //   } catch (err) {
  //     setMsg("Verification failed.");
  //   }
  // }

  async function loadSlots() {
    try {
      setMsg("");
      const res = await axios.get("/api/timeslots");
      setSlots(res.data.slots || []);
      if ((res.data.slots || []).length === 0) setMsg("No available timeslots.");
    } catch (err) {
      setMsg("Failed to load timeslots.");
    }
  }

  const generateDaySlots = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const daySlots = slots.filter((s) => s.date === dayStr);

    // Generate 9AM-6PM slots if none exist
    const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9AM to 5PM
    return hours.map((hour) => {
      const startTime = `${hour}:00`;
      const endTime = `${hour + 1}:00`;
      const existing = daySlots.find(
        (s) => s.startTime === startTime && s.endTime === endTime
      );
      return existing || {
        _id: `${dayStr}-${startTime}`,
        date: dayStr,
        startTime,
        endTime,
        location: "Default Location",
        isBooked: false,
      };
    });
  };

  async function confirmBooking() {
    if (!selected) return setMsg("Please select a timeslot.");
    setLoading(true);
    try {
      // Uncomment for payment verification
      /*
      if (!verified) {
        setMsg("Payment not verified.");
        return;
      }
      */

      const res = await axios.post("/api/bookings/confirm", {
        reference,
        timeslotId: selected,
      });
      setMsg(res.data.message || "Booking confirmed!");
      setSlots(slots.map((s) => (s._id === selected ? { ...s, isBooked: true } : s)));
      setSelected("");
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Error confirming booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Swimming Slot</h1>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const daySlots = generateDaySlots(day);

          return (
            <div key={day.toISOString()} className="border rounded-lg p-2">
              <p className="font-semibold text-center mb-2 text-sm md:text-base">
                {format(day, "EEE, MMM d")}
              </p>

              <div className="flex flex-col gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot._id}
                    disabled={slot.isBooked}
                    onClick={() => setSelected(slot._id)}
                    className={`p-2 text-sm rounded transition border text-center ${
                      slot.isBooked
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : selected === slot._id
                        ? "bg-blue-200 border-blue-500"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                    <br />
                    <span className="text-xs opacity-70">{slot.location}</span>
                    {slot.isBooked && " (Booked)"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={confirmBooking}
        disabled={loading || !selected}
        className={`mt-6 w-full py-3 rounded-lg text-white font-semibold transition ${
          selected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>

      {msg && <p className="mt-4 text-center text-red-600">{msg}</p>}
    </div>
  );
}
