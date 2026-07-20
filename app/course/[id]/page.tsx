"use client";

import React from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Users,
  Globe,
  BarChart3,
  BookOpen,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowLeft,
  GraduationCap,
  FileVideo,
  FileText,
  BadgeCheck,
} from "lucide-react";

interface Lecture {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  isPreview: boolean;
}

interface Section {
  id: string;
  title: string;
  lectureCount: number;
  duration: number;
  order: number;
  lectures: Lecture[];
}

interface Instructor {
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalDuration: number;
  keywords: string[];
  topics: string[];
  level: string;
  language: string;
  price: number;
  discount: number;
  createdAt: string;
  sections: Section[];
  instructor: Instructor;
  _count: { enrollments: number };
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const Course = () => {
  const params = useParams();
  const { id } = params;
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courses/${id}`);
      setCourse(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading course...</p>
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl font-semibold mb-2">Course not found</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Go back home
          </Link>
        </div>
      </section>
    );
  }

  const finalPrice =
    course.discount > 0
      ? course.price - (course.price * course.discount) / 100
      : course.price;

  const totalLectures = course.sections.reduce(
    (acc, s) => acc + s.lectures.length,
    0
  );

  return (
    <main className="min-h-screen bg-white">
      <section   className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
              <Image
                fill
                src={course.thumbnail}
                alt={course.title}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                  {course.level}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {course.language}
                </span>
                {course.discount > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    {course.discount}% OFF
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {course.title}
              </h1>

              <p className="text-gray-500 leading-relaxed">{course.description}</p>

              <article className="flex flex-wrap items-center gap-4 mt-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatMinutes(course.totalDuration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.sections.length} sections
                </span>
                <span className="flex items-center gap-1.5">
                  <FileVideo className="w-4 h-4" />
                  {totalLectures} lectures
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course._count.enrollments} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </span>
              </article>

              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Created by{" "}
                  <span className="font-medium text-gray-900">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </span>
                </span>
              </div>
            </div>

            {course.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  What you&apos;ll learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.topics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5"
                    >
                      <BadgeCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Course Content
              </h3>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
                {course.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const isOpen = openSections[section.id] ?? section.order === 1;
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {section.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {section.lectures.length} lectures &middot;{" "}
                                {formatMinutes(section.duration)}
                              </p>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-gray-100">
                            {section.lectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="flex items-center justify-between px-5 py-3 pl-12"
                              >
                                <div className="flex items-center gap-2.5">
                                  {lecture.type === "video" ? (
                                    <Play className="w-3.5 h-3.5 text-gray-400" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                  <span className="text-sm text-gray-700">
                                    {lecture.title}
                                  </span>
                                  {lecture.isPreview && (
                                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {lecture.duration != null && (
                                    <span className="text-xs text-gray-400">
                                      {formatMinutes(lecture.duration)}
                                    </span>
                                  )}
                                  {!lecture.isPreview && (
                                    <Lock className="w-3 h-3 text-gray-300" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <section className="lg:col-span-1">
            <div className="sticky top-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {course.discount > 0 && (
                    <span className="text-base text-gray-400 line-through">
                      ${course.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {course.discount > 0 && (
                  <p className="text-sm text-emerald-600 font-medium mb-4">
                    {course.discount}% off — you save{" "}
                    ${(course.price - finalPrice).toFixed(2)}
                  </p>
                )}

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer mb-3">
                  Enroll Now
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200 cursor-pointer mb-6">
                  Add to Cart
                </button>

                <p className="text-center text-xs text-gray-400 mb-6">
                  30-day money-back guarantee
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatMinutes(course.totalDuration)} of content</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>
                      {course.sections.length} sections &middot; {totalLectures}{" "}
                      lectures
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span>Level: {course.level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FileVideo className="w-4 h-4 text-gray-400" />
                    <span>{totalLectures} lessons</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-5">
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Instructor
                </p>
                <div className="flex items-center gap-3">
                  {course.instructor.profilePhoto ? (
                    <Image
                      src={course.instructor.profilePhoto}
                      alt={course.instructor.firstName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {course.instructor.firstName[0]}
                        {course.instructor.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{course.instructor.email}</p>
                  </div>
                </div>
              </div>

              {course.keywords.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-5">
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {course.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
};

export default Course;
