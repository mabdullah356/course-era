import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        price: true,
        discount: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch courses", details: message }, { status: 500 });
  }
}
