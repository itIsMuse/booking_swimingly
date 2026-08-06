import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Student from "@/lib/models/Student";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    await connectToDB();

    const { email } = await params;

    const student = await Student.findOne({
      email: decodeURIComponent(email),
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}