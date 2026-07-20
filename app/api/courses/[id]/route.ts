import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            profilePhoto: true,
            email: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                isPreview: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
