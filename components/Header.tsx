"use client"

import { Search, GraduationCap } from "lucide-react"
import Link from "next/link"
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"

export default function Header() {
  const { isSignedIn, user } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            CourseEra
          </span>
        </Link>

        <div className="hidden md:flex flex-1 items-center">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {user?.fullName}
              </span>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
