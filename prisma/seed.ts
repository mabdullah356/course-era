import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const userId = "cmrrk6eeq000004ldwg9ol4ks";

const courses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer.",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    totalDuration: 72000,
    keywords: ["web development", "javascript", "react", "nodejs"],
    topics: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Databases"],
    price: 89.99,
    discount: 20,
    level: "beginner",
    language: "English",
    isPublished: true,
    sections: [
      {
        title: "HTML & CSS Fundamentals",
        lectureCount: 4,
        duration: 18000,
        order: 1,
        lectures: [
          { title: "Introduction to HTML", type: "video", duration: 3600, isPreview: true, order: 1 },
          { title: "HTML Elements & Tags", type: "video", duration: 4200, isPreview: false, order: 2 },
          { title: "CSS Selectors & Properties", type: "video", duration: 5400, isPreview: false, order: 3 },
          { title: "Build a Portfolio Page", type: "exercise", duration: 4800, isPreview: false, order: 4 },
        ],
      },
      {
        title: "JavaScript Essentials",
        lectureCount: 4,
        duration: 21600,
        order: 2,
        lectures: [
          { title: "Variables & Data Types", type: "video", duration: 4800, isPreview: true, order: 1 },
          { title: "Functions & Scope", type: "video", duration: 5400, isPreview: false, order: 2 },
          { title: "DOM Manipulation", type: "video", duration: 6000, isPreview: false, order: 3 },
          { title: "Quiz: JavaScript Basics", type: "quiz", duration: 5400, isPreview: false, order: 4 },
        ],
      },
    ],
  },
  {
    title: "Python for Data Science & Machine Learning",
    description: "Master Python programming, NumPy, Pandas, Matplotlib and build ML models with Scikit-learn.",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
    totalDuration: 90000,
    keywords: ["python", "data science", "machine learning", "pandas"],
    topics: ["Python", "NumPy", "Pandas", "Matplotlib", "Scikit-learn", "ML Algorithms"],
    price: 99.99,
    discount: 15,
    level: "intermediate",
    language: "English",
    isPublished: true,
    sections: [
      {
        title: "Python Programming Basics",
        lectureCount: 4,
        duration: 21600,
        order: 1,
        lectures: [
          { title: "Setting Up Python Environment", type: "video", duration: 3600, isPreview: true, order: 1 },
          { title: "Data Structures in Python", type: "video", duration: 6000, isPreview: false, order: 2 },
          { title: "Object-Oriented Programming", type: "video", duration: 6000, isPreview: false, order: 3 },
          { title: "Assignment: Build a Calculator", type: "assignment", duration: 6000, isPreview: false, order: 4 },
        ],
      },
      {
        title: "Data Analysis with Pandas",
        lectureCount: 4,
        duration: 25200,
        order: 2,
        lectures: [
          { title: "Introduction to NumPy", type: "video", duration: 5400, isPreview: true, order: 1 },
          { title: "DataFrames & Series", type: "video", duration: 6600, isPreview: false, order: 2 },
          { title: "Data Cleaning Techniques", type: "article", duration: 7200, isPreview: false, order: 3 },
          { title: "Hands-on: Real World Dataset", type: "exercise", duration: 6000, isPreview: false, order: 4 },
        ],
      },
    ],
  },
  {
    title: "Advanced React & Next.js Masterclass",
    description: "Deep dive into React hooks, context, Next.js App Router, server components and full-stack deployment.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    totalDuration: 54000,
    keywords: ["react", "nextjs", "typescript", "fullstack"],
    topics: ["React Hooks", "Context API", "Next.js App Router", "Server Components", "API Routes"],
    price: 79.99,
    discount: 0,
    level: "advanced",
    language: "English",
    isPublished: true,
    sections: [
      {
        title: "React Advanced Patterns",
        lectureCount: 4,
        duration: 18000,
        order: 1,
        lectures: [
          { title: "Custom Hooks Deep Dive", type: "video", duration: 4800, isPreview: true, order: 1 },
          { title: "Context API & State Management", type: "video", duration: 4800, isPreview: false, order: 2 },
          { title: "Performance Optimization", type: "video", duration: 4200, isPreview: false, order: 3 },
          { title: "Quiz: React Patterns", type: "quiz", duration: 4200, isPreview: false, order: 4 },
        ],
      },
      {
        title: "Next.js App Router",
        lectureCount: 4,
        duration: 21600,
        order: 2,
        lectures: [
          { title: "File-Based Routing Explained", type: "video", duration: 5400, isPreview: true, order: 1 },
          { title: "Server & Client Components", type: "video", duration: 6000, isPreview: false, order: 2 },
          { title: "API Routes & Server Actions", type: "video", duration: 5400, isPreview: false, order: 3 },
          { title: "Project: Full-Stack App", type: "assignment", duration: 4800, isPreview: false, order: 4 },
        ],
      },
    ],
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Learn design thinking, Figma, wireframing, prototyping and create stunning user interfaces.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    totalDuration: 36000,
    keywords: ["ui ux", "figma", "design", "prototyping"],
    topics: ["Design Thinking", "Figma", "Wireframing", "Prototyping", "Color Theory", "Typography"],
    price: 69.99,
    discount: 10,
    level: "beginner",
    language: "English",
    isPublished: true,
    sections: [
      {
        title: "Design Principles",
        lectureCount: 4,
        duration: 14400,
        order: 1,
        lectures: [
          { title: "What is UI/UX Design?", type: "video", duration: 3000, isPreview: true, order: 1 },
          { title: "Color Theory & Typography", type: "video", duration: 3600, isPreview: false, order: 2 },
          { title: "Layout & Visual Hierarchy", type: "article", duration: 4200, isPreview: false, order: 3 },
          { title: "Exercise: Mood Board Creation", type: "exercise", duration: 3600, isPreview: false, order: 4 },
        ],
      },
      {
        title: "Figma for Beginners",
        lectureCount: 4,
        duration: 18000,
        order: 2,
        lectures: [
          { title: "Figma Interface Overview", type: "video", duration: 4200, isPreview: true, order: 1 },
          { title: "Components & Auto Layout", type: "video", duration: 5400, isPreview: false, order: 2 },
          { title: "Prototyping in Figma", type: "video", duration: 4800, isPreview: false, order: 3 },
          { title: "Final Project: App Redesign", type: "assignment", duration: 3600, isPreview: false, order: 4 },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const courseData of courses) {
    const { sections, ...courseFields } = courseData;

    const course = await prisma.course.create({
      data: {
        ...courseFields,
        instructorId: userId,
      },
    });

    for (const sectionData of sections) {
      const { lectures, ...sectionFields } = sectionData;

      await prisma.section.create({
        data: {
          ...sectionFields,
          courseId: course.id,
          lectures: {
            create: lectures,
          },
        },
      });
    }

    console.log(`Created course: ${course.title}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
