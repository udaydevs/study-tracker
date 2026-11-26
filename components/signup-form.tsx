
"use client"

import { useState } from "react"
import type { ComponentProps, FormEvent } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SignupFormProps = ComponentProps<"div"> & {
  onLoginClick?: () => void
}

export function SignupForm({
  className,
  onLoginClick,
  ...props
}: SignupFormProps) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError("")
    setSuccess("")

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setError("Please enter your full name.")
      return
    }

    if (!normalizedEmail) {
      setError("Please enter your email address.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          options: {
            data: {
              name: name.trim(),
            },
          },
          email: normalizedEmail,
          password,
        }),
      })

      const contentType = response.headers.get("content-type")
      let result: { message?: string } = {}

      if (contentType?.includes("application/json")) {
        result = await response.json()
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Registration failed. Please try again."
        )
      }

      setSuccess("Account created successfully!")

      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Unable to connect. Check your internet connection.")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Create your account
          </CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-name">
                  Full Name
                </FieldLabel>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-email">
                  Email
                </FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="signup-password">
                      Password
                    </FieldLabel>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </Field>
                </div>

                <FieldDescription>
                  Password must be at least 8 characters long.
                </FieldDescription>
              </Field>

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-green-600"
                >
                  {success}
                </p>
              )}

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="underline underline-offset-4"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
