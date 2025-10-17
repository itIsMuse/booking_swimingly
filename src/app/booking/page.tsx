"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);

  const reference = searchParams.get("reference");
  const email = searchParams.get("email");

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setError("No payment reference found. Please complete payment first.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setIsVerified(true);
          await fetchSlots(); // fetch available timeslots
        } else {
          setError(data.message || "Payment not verified.");
        }
      } catch (err) {
        console.error(err);
        setError("Server error verifying payment.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchSlots() {
      const res = await fetch("/api/timeslots");
      const data = await res.json();
      setSlots(data.slots || []);
    }

    verifyPayment();
  }, [reference]);

  if (loading) return <p className="p-6 text-center">Verifying payment...</p>;

  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => router.push("/")}
        >
          Go back
        </button>
      </div>
    );

  if (!isVerified)
    return (
      <div className="p-6 text-center">
        <p>Please complete your payment to access bookings.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Available Slots</h1>

      {slots.length === 0 ? (
        <p>No slots available right now.</p>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot: any) => (
            <li
              key={slot._id}
              className={`p-3 border rounded-lg ${
                slot.isBooked ? "bg-gray-200" : "hover:bg-blue-100 cursor-pointer"
              }`}
            >
              <p>
                {slot.date} — {slot.time}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
