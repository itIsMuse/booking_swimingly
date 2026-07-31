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
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(new Date(), i)
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    if (ref) setReference(ref);
    loadSlots();
  }, []);

  async function loadSlots() {
    try {
      const res = await axios.get("/api/timeslots");
      setSlots(res.data.slots || []);
    } catch {
      setMsg("Failed to load timeslots.");
    }
  }

  const generateDaySlots = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return slots.filter((s) => s.date === dayStr);
  };

  const isDaySelected = (dayStr: string) =>
    selectedSlots.some((s) => s.date === dayStr);

  const toggleDay = (dayStr: string) => {
    if (expandedDay === dayStr && !isDaySelected(dayStr)) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayStr);
    }
  };

  const toggleSlot = (slot: Slot) => {
    const exists = selectedSlots.find((s) => s._id === slot._id);

    if (exists) {
      setSelectedSlots(selectedSlots.filter((s) => s._id !== slot._id));
      return;
    }

    if (selectedSlots.length >= 3) {
      setMsg("You can only select up to 3 slots per week.");
      return;
    }

    setMsg("");
    setSelectedSlots([...selectedSlots, slot]);
    setExpandedDay(slot.date);
  };

  async function confirmBooking() {
    if (selectedSlots.length === 0) {
      setMsg("Please select at least one timeslot.");
      return;
    }

    setLoading(true);

    try {
      for (const slot of selectedSlots) {
        await axios.post("/api/bookings/confirm", {
          reference,
          timeslotId: slot._id,
        });
      }

      setMsg("✅ Booking confirmed successfully!");
      setSelectedSlots([]);
      setExpandedDay(null);
      loadSlots();
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        Book Your Swimming Sessions
      </h1>

      {/* DAYS */}
      <div className="flex flex-col md:flex-row gap-4">
        {weekDays.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const isExpanded = expandedDay === dayStr;
          const dayHasSelection = isDaySelected(dayStr);
          const showSlots = isExpanded || dayHasSelection;
          const daySlots = generateDaySlots(day);

          return (
            <div
              key={dayStr}
              className={`
                flex-1 rounded-xl overflow-hidden transition-all
                ${
                  showSlots
                    ? "bg-white border border-gray-300"
                    : "bg-black border border-black"
                }
              `}
            >
              {/* HEADER */}
              <button
                onClick={() => toggleDay(dayStr)}
                className={`
                  w-full p-5 text-center font-semibold transition
                  ${
                    showSlots
                      ? "text-gray-800 hover:bg-gray-100"
                      : "text-white hover:bg-gray-900"
                  }
                `}
              >
                <div className="text-xl">{format(day, "EEE")}</div>
                <div className="text-sm opacity-80">
                  {format(day, "MMM d")}
                </div>

                {dayHasSelection && (
                  <div className="mt-2 text-xs bg-blue-600 text-white inline-block px-3 py-1 rounded-full">
                    {
                      selectedSlots.filter((s) => s.date === dayStr).length
                    }{" "}
                    selected
                  </div>
                )}
              </button>

              {/* SLOTS */}
              {showSlots && (
                <div className="border-t p-4 bg-white">
                  <div className="flex flex-col gap-3">
                    {daySlots.length ? (
                      daySlots.map((slot) => {
                        const selected = selectedSlots.some(
                          (s) => s._id === slot._id
                        );

                        return (
                          <button
                            key={slot._id}
                            disabled={slot.isBooked}
                            onClick={() => toggleSlot(slot)}
                            className={`
                              p-4 rounded-lg text-sm border transition
                              ${
                                slot.isBooked
                                  ? "bg-gray-200 text-gray-900 cursor-not-allowed"
                                  : selected
                                  ? "bg-blue-600 text-white font-medium border-blue-600"
                                  : "bg-gray-300 text-black hover:bg-blue-50 border-gray-300"
                              }
                            `}
                          >
                            <div className="font-medium">
                              {slot.startTime} – {slot.endTime}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {slot.location}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No slots available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CONFIRM */}
      <div className="mt-10 max-w-md mx-auto">
        <button
          onClick={confirmBooking}
          disabled={loading || selectedSlots.length === 0}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading
            ? "Confirming..."
            : `Confirm ${selectedSlots.length} Slot${
                selectedSlots.length === 1 ? "" : "s"
              }`}
        </button>

        {msg && (
          <p
            className={`mt-4 text-center ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
