"use client";

import { useEffect, useState } from "react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    if (!email) return alert("Enter your email to see your bookings");
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?email=${email}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-6 text-center">My Bookings</h1>

      <div className="flex gap-3 mb-6 justify-center">
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={fetchBookings}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div
              key={b._id}
              className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{b.package}</p>
                <p className="text-sm text-gray-600">
                  {b.date} • {b.time}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  b.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {b.paymentStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
