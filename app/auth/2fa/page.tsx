"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ShieldCheck, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function TwoFactorPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams])

  useEffect(() => {
    let mounted = true

    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/login")
        return
      }

      if (mounted) setCheckingUser(false)
    }

    checkUser()
    return () => {
      mounted = false
    }
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "login" }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to verify 2FA")
        return
      }

      toast.success("2FA verified")
      router.replace(nextUrl)
      router.refresh()
    } catch (error) {
      console.log("[v0] 2FA login error:", error)
      toast.error("Failed to verify 2FA")
    } finally {
      setLoading(false)
    }
  }

  if (checkingUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel rounded-3xl p-8 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Checking session...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Two-Factor Verification</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Authenticator app code অথবা recovery code দিন।
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-foreground">
                Verification code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="123456 or recovery code"
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Verify & Continue"}
            </button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            2FA enable করা থাকলে dashboard এ যাওয়ার আগে এই step লাগবে।
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Wrong account? <Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
