import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { verifyTotpCode } from "@/lib/totp"

const COOKIE_NAME = "cloudpix_2fa_verified"
const REMEMBER_COOKIE = "cloudpix_remember_me"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = String(body?.code || "").trim().replace(/\s+/g, "")
    const action = body?.action === "setup" ? "setup" : body?.action === "disable" ? "disable" : "login"

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("two_factor_secret, two_factor_enabled, two_factor_recovery_codes")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const secret = profile.two_factor_secret
    const recoveryCodes: string[] = Array.isArray(profile.two_factor_recovery_codes)
      ? profile.two_factor_recovery_codes
      : []

    let verified = false
    let usedRecoveryCode: string | null = null

    if (secret && /^\d{6}$/.test(code) && verifyTotpCode({ secret, code })) {
      verified = true
    } else {
      const matchedRecovery = recoveryCodes.find((saved) => saved === code.toUpperCase())
      if (matchedRecovery) {
        verified = true
        usedRecoveryCode = matchedRecovery
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid authentication code" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (usedRecoveryCode) {
      updates.two_factor_recovery_codes = recoveryCodes.filter((saved) => saved !== usedRecoveryCode)
    }
    if (action === "setup") {
      updates.two_factor_enabled = true
    }
    if (action === "disable") {
      updates.two_factor_enabled = false
      updates.two_factor_secret = null
      updates.two_factor_recovery_codes = []
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id)
      if (updateError) {
        console.log("[v0] 2FA verify update error:", updateError.message)
        return NextResponse.json({ error: "Failed to update 2FA settings" }, { status: 500 })
      }
    }

    const response = NextResponse.json({
      success: true,
      message:
        action === "setup"
          ? "2FA enabled successfully"
          : action === "disable"
            ? "2FA disabled successfully"
            : "2FA verified successfully",
      remainingRecoveryCodes:
        usedRecoveryCode && action !== "disable"
          ? recoveryCodes.filter((saved) => saved !== usedRecoveryCode)
          : undefined,
    })

    if (action === "disable") {
      response.cookies.delete(COOKIE_NAME)
      return response
    }

    const rememberMe = request.cookies.get(REMEMBER_COOKIE)?.value === "1"
    response.cookies.set(COOKIE_NAME, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    })

    return response
  } catch (error) {
    console.log("[v0] 2FA verify error:", error)
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 })
  }
}
