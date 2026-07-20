import axios from "axios";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discount: number;
  language: string;
  createdAt: string;
  updatedAt: string;
}

async function getCourses(): Promise<Course[]> {
  const res = await axios.get("http://localhost:3000/api/courses");
  return res.data;
}

export default async function Courses() {
  const courses = await getCourses();

  return (
    <section className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">
            Explore Our Courses
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Master new skills with expert-led courses designed to take you from
            beginner to professional.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              No courses available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => {
              const finalPrice = course.discount > 0
                ? course.price - (course.price * course.discount) / 100
                : course.price;

              return (
                <article
                  key={course.id}
                  className="group relative bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      fill  
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {course.discount > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {course.discount}% OFF
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                      {course.language}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          ${finalPrice.toFixed(2)}
                        </span>
                        {course.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors duration-200 cursor-pointer">
                        Enroll
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
