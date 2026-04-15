"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Copy, Shield, ShieldCheck, ShieldOff } from "lucide-react"

export default function SecuritySettingsPanel() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [setupCode, setSetupCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [manualSecret, setManualSecret] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [otpauthUrl, setOtpauthUrl] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled, two_factor_recovery_codes")
      .eq("id", user.id)
      .single()

    setTwoFactorEnabled(profile?.two_factor_enabled || false)
    setRecoveryCodes(Array.isArray(profile?.two_factor_recovery_codes) ? profile.two_factor_recovery_codes : [])
    setUser(user)
  }

  useEffect(() => {
    loadUser()
  }, [router])

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast.error(error.message || "Failed to update password")
        return
      }

      toast.success("Password updated successfully!")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.log("[v0] Password change error:", error)
      toast.error("Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setTwoFactorLoading(true)

    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to setup 2FA")
        return
      }

      setRecoveryCodes(data.recoveryCodes || [])
      setManualSecret(data.formattedSecret || data.secret || "")
      setQrCodeUrl(data.qrCodeUrl || "")
      setOtpauthUrl(data.otpauthUrl || "")
      setShowTwoFactorSetup(true)
      toast.success("Authenticator setup generated")
    } catch (error) {
      console.log("[v0] 2FA setup error:", error)
      toast.error("Failed to setup 2FA")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!setupCode.trim()) {
      toast.error("Please enter the authenticator code")
      return
    }

    setTwoFactorLoading(true)

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode, action: "setup" }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to verify 2FA")
        return
      }

      setTwoFactorEnabled(true)
      setShowTwoFactorSetup(false)
      setSetupCode("")
      toast.success("2FA enabled successfully!")
      await loadUser()
    } catch (error) {
      console.log("[v0] 2FA verify error:", error)
      toast.error("Failed to verify 2FA")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disableCode.trim()) {
      toast.error("Enter current authenticator code or recovery code")
      return
    }

    setTwoFactorLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode, action: "disable" }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to disable 2FA")
        return
      }

      setTwoFactorEnabled(false)
      setDisableCode("")
      setManualSecret("")
      setQrCodeUrl("")
      setOtpauthUrl("")
      setShowTwoFactorSetup(false)
      toast.success("2FA disabled")
      await loadUser()
    } catch (error) {
      console.log("[v0] 2FA disable error:", error)
      toast.error("Failed to disable 2FA")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  if (!user) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <Button type="submit" disabled={passwordLoading} className="bg-primary hover:bg-primary/90">
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      <div className="glass-panel rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Google Authenticator, Microsoft Authenticator, Authy বা অন্য TOTP app দিয়ে কাজ করবে।
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              twoFactorEnabled ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        {!twoFactorEnabled ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary"><Shield className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-foreground">Authenticator-based 2FA</p>
                <p className="text-sm text-muted-foreground">
                  Enable করলে login এর পর dashboard এ যাওয়ার আগে 6-digit authenticator code লাগবে।
                </p>
              </div>
            </div>

            <Button onClick={handleSetup2FA} disabled={twoFactorLoading} className="bg-primary hover:bg-primary/90">
              {twoFactorLoading ? "Generating..." : "Generate 2FA Setup"}
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-green-500/20 p-2 text-green-400"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-green-300">2FA is active</p>
                <p className="text-sm text-green-200/80">
                  Login flow-এ 2FA challenge চালু আছে। Disable করতে current code বা recovery code দিন।
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current code / recovery code</label>
                <Input
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                  placeholder="123456 or recovery code"
                  className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <Button onClick={handleDisable2FA} disabled={twoFactorLoading} variant="destructive" className="md:h-10">
                {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </div>
        )}

        {showTwoFactorSetup && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">
              Step 1: QR scan করুন অথবা secret manually যোগ করুন। Step 2: app থেকে 6-digit code দিয়ে verify করুন।
            </p>

            {qrCodeUrl && (
              <div className="rounded-2xl bg-white p-4 w-fit">
                <img src={qrCodeUrl} alt="2FA QR code" className="h-44 w-44 rounded-xl" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Manual setup key</label>
              <div className="flex gap-2 flex-wrap">
                <Input value={manualSecret} readOnly className="border border-white/20 bg-white/5 text-foreground" />
                <Button type="button" variant="outline" onClick={() => copyText(manualSecret, "Secret key")}>
                  <Copy className="mr-2 h-4 w-4" />Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Authenticator code</label>
              <Input
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <Button onClick={handleVerify2FA} disabled={twoFactorLoading || !setupCode.trim()} className="bg-primary hover:bg-primary/90">
              {twoFactorLoading ? "Verifying..." : "Verify & Enable 2FA"}
            </Button>

            {otpauthUrl && (
              <button type="button" onClick={() => copyText(otpauthUrl, "OTP URI")} className="text-sm text-primary hover:underline">
                Copy otpauth URI
              </button>
            )}
          </div>
        )}

        {recoveryCodes.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-300">Recovery Codes</p>
            <p className="mt-1 text-xs text-yellow-200/80">
              এগুলো safe জায়গায় রাখুন। প্রতিটি recovery code একবার ব্যবহার করা যাবে।
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {recoveryCodes.map((code, i) => (
                <code key={i} className="rounded-lg bg-black/20 px-3 py-2 text-xs text-foreground font-mono">
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Forgot Password</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          If you forget your password, use the forgot password link on the login page to reset it.
        </p>
        <Button onClick={() => router.push("/auth/forgot-password")} variant="outline">
          Go to Forgot Password
        </Button>
      </div>
    </div>
  )
}
