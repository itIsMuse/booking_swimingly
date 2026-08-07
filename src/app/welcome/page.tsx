"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const studentId = searchParams.get("id");

  return (
    <main className="min-h-screen bg-[#00102e] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-7xl">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/logo.png"
            alt="Swimingly"
            width={180}
            height={60}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center bg-green-500/15 border border-green-500/30 rounded-full px-5 py-2 mb-8">
              <span className="text-green-400 text-xl mr-2">✓</span>

              <span className="text-green-300 font-medium">
                Payment Confirmed
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Welcome to
              <br />
              Swimingly.
            </h1>

            <p className="text-gray-300 mt-8 text-xl leading-9 max-w-xl">
              Your payment has been received successfully.
              <br />
              <br />
              We're excited to be part of your swimming journey.
              <br />
              <br />
              The next step is choosing how you'd like your lessons to be
              scheduled.
            </p>

            {/* Progress */}
            <div className="mt-12">
              <p className="text-white font-semibold mb-5">
                Next Steps
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-green-400">
                  ✓
                  <span className="ml-3">
                    Payment Completed
                  </span>
                </div>

                <div className="flex items-center text-blue-300 font-medium">
                  ➜
                  <span className="ml-3">
                    Choose Your Schedule
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  ○
                  <span className="ml-3">
                    Book Your First Lesson
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  ○
                  <span className="ml-3">
                    Start Swimming
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-[#00102e]">
              Choose Your Schedule
            </h2>

            <p className="text-gray-500 mt-3">
              Select the option that works best for your lifestyle.
            </p>

            {/* Package */}
            <div className="mt-8 bg-[#084f70] rounded-2xl text-white p-6">
              <p className="uppercase text-sm opacity-80 tracking-widest">
                Training Package
              </p>

              <h3 className="text-4xl font-bold mt-3">
                8 Lessons
              </h3>

              <p className="mt-2 opacity-90">
                Fully Paid ✓
              </p>
            </div>

            {/* Fixed */}
            <div className="mt-8 border rounded-xl p-6 hover:border-[#084f70] hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold">
                Fixed Schedule
              </h3>

              <p className="text-gray-600 mt-3">
                Attend on the same days every week.
                <br />
                Perfect if you have a consistent routine.
              </p>

              <button
                onClick={() =>
                  router.push(`/schedule/fixed?id=${studentId}`)
                }
                className="block w-full text-center mt-6 bg-[#084f70] hover:bg-[#04344b] transition text-white py-3 rounded-lg font-semibold"
              >
                Continue →
              </button>
            </div>

            {/* Flexible */}
            <div className="mt-5 border rounded-xl p-6 hover:border-[#084f70] hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold">
                Flexible Schedule
              </h3>

              <p className="text-gray-600 mt-3">
                Book lessons whenever you're available.
                <br />
                Ideal if your availability changes often.
              </p>

              <button
                onClick={() =>
                  router.push(`/schedule/flexible?id=${studentId}`)
                }
                className="block w-full text-center mt-6 bg-[#084f70] hover:bg-[#04344b] transition text-white py-3 rounded-lg font-semibold"
              >
                Continue →
              </button>
            </div>

            {/* WhatsApp */}
            <div className="mt-8 bg-gray-100 rounded-xl p-5 text-center">
              <p className="font-semibold text-[#00102e]">
                Need help deciding?
              </p>

              <p className="text-gray-500 mt-2">
                Speak directly with your coach.
              </p>

              <a
                href="https://wa.me/234YOURNUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-5 bg-green-600 hover:bg-green-700 transition text-white px-8 py-3 rounded-lg font-semibold"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WelcomeContent />
    </Suspense>
  );
}