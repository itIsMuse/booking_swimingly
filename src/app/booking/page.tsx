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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    if (ref) setReference(ref);

    loadSlots();
  }, []);

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
      const res = await axios.post("/api/bookings/confirm", {
        reference,
        timeslotId: selected,
      });
      setMsg(res.data.message || "Booking confirmed!");
      setSlots(
        slots.map((s) =>
          s._id === selected ? { ...s, isBooked: true } : s
        )
      );
      setSelected("");
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Error confirming booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2">
        Book Your Swimming Sessions
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Click a day to view available time slots. Booked slots are disabled.
      </p>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm mb-6">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-white border rounded" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded" /> Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded" /> Booked
        </span>
      </div>

      {/* Days */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayId = day.toISOString();
          const isExpanded = expandedDay === dayId;
          const daySlots = generateDaySlots(day);

          return (
            <div key={dayId} className="border rounded-xl p-3 bg-gray-50">
              {/* Day Header with arrow */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : dayId)}
                className="flex justify-center items-center font-semibold mb-2 text-sm md:text-base cursor-pointer select-none gap-2"
              >
                <div className="text-center">
                  {format(day, "EEE")}
                  <br />
                  <span className="text-xs text-gray-500">
                    {format(day, "MMM d")}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isExpanded ? "rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Slots with smooth slide */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? "max-h-[1000px]" : "max-h-0"
                }`}
              >
                <div className="flex flex-col gap-2 mt-2">
                  {daySlots.map((slot) => {
                    const isSelected = selected === slot._id;
                    return (
                      <button
                        key={slot._id}
                        disabled={slot.isBooked}
                        onClick={() => setSelected(slot._id)}
                        className={`p-2 text-xs rounded-lg border transition text-center ${
                          slot.isBooked
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {slot.startTime} – {slot.endTime}
                        <div className="text-[10px] opacity-70">
                          {slot.location}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selected && (
        <p className="mt-6 text-center text-sm text-gray-700">
          Selected slot ID: <span className="font-semibold">{selected}</span>
        </p>
      )}

      {/* Confirm Button */}
      <button
        onClick={confirmBooking}
        disabled={loading || !selected}
        className={`mt-4 w-full py-4 rounded-xl text-white font-semibold transition ${
          selected
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Confirming Booking..." : "Confirm Booking"}
      </button>

      {msg && (
        <p className="mt-4 text-center text-red-600 text-sm">{msg}</p>
      )}
    </div>
  );
}
