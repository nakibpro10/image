"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AutoRedirect } from "@/components/auth/auto-redirect"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    setRememberMe(localStorage.getItem("cloudpix_remember_me") === "1")
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("cloudpix_remember_me", "1")
        document.cookie = "cloudpix_remember_me=1; path=/; max-age=2592000; samesite=lax"
      } else {
        localStorage.removeItem("cloudpix_remember_me")
        document.cookie = "cloudpix_remember_me=; path=/; max-age=0; samesite=lax"
      }
    }

    const user = data.user
    if (!user) {
      toast.error("Login succeeded but user session was not created")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled")
      .eq("id", user.id)
      .single()

    if (profile?.two_factor_enabled) {
      toast.success("Password verified. Please complete 2FA.")
      router.push("/auth/2fa?next=/dashboard")
      router.refresh()
      return
    }

    toast.success(rememberMe ? "Welcome back! You'll stay signed in." : "Welcome back!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <AutoRedirect />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-md" />

      <div className="absolute top-16 right-20 w-48 h-48 rounded-full bg-primary/8 backdrop-blur-3xl animate-pulse" />
      <div className="absolute bottom-24 left-16 w-36 h-36 rounded-full bg-accent/8 backdrop-blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-foreground">Cloud</span>
              <span className="text-primary">Pix</span>
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl shadow-black/10">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
