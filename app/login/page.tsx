
"use client"

import { Suspense, useState } from "react"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f0edf5] p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-[#6b3fd8] text-white">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Study Tracker
        </a>

        <div>
          <Suspense fallback={<div>Loading...</div>}>
            {showSignup ? (
              <SignupForm onLoginClick={() => setShowSignup(false)} />
            ) : (
              <LoginForm onSignUpClick={() => setShowSignup(true)} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
