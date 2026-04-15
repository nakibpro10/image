import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { buildOtpAuthUrl, formatSecret, generateBase32Secret, generateRecoveryCodes } from "@/lib/totp"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const secret = generateBase32Secret()
    const recoveryCodes = generateRecoveryCodes(8)
    const otpauthUrl = buildOtpAuthUrl({
      secret,
      accountName: user.email || user.id,
      issuer: "CloudPix",
    })

    const { error } = await supabase
      .from("profiles")
      .update({
        two_factor_secret: secret,
        two_factor_enabled: false,
        two_factor_recovery_codes: recoveryCodes,
      })
      .eq("id", user.id)

    if (error) {
      console.log("[v0] 2FA setup error:", error.message)
      return NextResponse.json({ error: "Failed to save 2FA setup" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      secret,
      formattedSecret: formatSecret(secret),
      otpauthUrl,
      recoveryCodes,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUrl)}`,
    })
  } catch (error) {
    console.log("[v0] 2FA setup route error:", error)
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 })
  }
}
