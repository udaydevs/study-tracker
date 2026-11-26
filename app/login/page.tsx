
"use client"

import { useState } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { SignupForm } from "@/components/signup-form"
import { LoginForm } from "@/components/login-form"

export default function SignupPage() {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">

        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="text-center text-sm">
          {isLogin
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  )
}
