"use client";

import { useSearchParams } from "next/navigation";

export default function FixedSchedulePage() {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("id");

  return (
    <main className="min-h-screen bg-[#00102e] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-[#00102e]">
          Fixed Schedule
        </h1>

        <p className="text-gray-500 mt-3">
          Student ID: {studentId}
        </p>

      </div>
    </main>
  );
}