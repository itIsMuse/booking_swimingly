"use client";

import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="max-w-5xl w-full">

        {/* Success Message */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>

          <h1 className="text-4xl font-bold text-slate-800">
            Payment Successful!
          </h1>

          <p className="text-slate-600 mt-3 text-lg">
            Welcome to Swimingly.
          </p>

          <p className="text-slate-500 mt-2">
            The next step is choosing how you'd like to schedule your swimming lessons.
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 text-sm">

            <span className="text-green-600 font-semibold">
              ✔ Register
            </span>

            <span>→</span>

            <span className="text-green-600 font-semibold">
              ✔ Payment
            </span>

            <span>→</span>

            <span className="font-bold text-blue-600">
              Choose Schedule
            </span>

            <span>→</span>

            <span className="text-gray-400">
              Confirmation
            </span>

          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Fixed */}
          <div className="bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl transition">

            <div className="text-5xl mb-4">
              📅
            </div>

            <h2 className="text-2xl font-bold">
              Fixed Schedule
            </h2>

            <p className="text-gray-600 mt-4">
              Attend on the same days and time every week.
            </p>

            <button
              onClick={() => router.push("/schedule/fixed")}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              Choose Fixed
            </button>

          </div>

          {/* Flexible */}
          <div className="bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl transition">

            <div className="text-5xl mb-4">
              🔄
            </div>

            <h2 className="text-2xl font-bold">
              Flexible Schedule
            </h2>

            <p className="text-gray-600 mt-4">
              Book lessons based on your weekly availability.
            </p>

            <button
              onClick={() => router.push("/schedule/flexible")}
              className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              Choose Flexible
            </button>

          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl transition">

            <div className="text-5xl mb-4">
              💬
            </div>

            <h2 className="text-2xl font-bold">
              Speak With Coach
            </h2>

            <p className="text-gray-600 mt-4">
              Not sure which option is right for you? Let's help you choose.
            </p>

            <a
              href="https://wa.link/9ha1kh"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-8 w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold"
            >
              Chat on WhatsApp
            </a>

          </div>

        </div>

      </div>
    </main>
  );
}