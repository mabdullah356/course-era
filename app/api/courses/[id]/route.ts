import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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

    const { userId } = await auth();

    let isEnrolled = false;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (user) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { courseId_userId: { courseId: id, userId: user.id } },
        });
        isEnrolled = !!enrollment;
      }
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

    return NextResponse.json({ ...course, isEnrolled });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
