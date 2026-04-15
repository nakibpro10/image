import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", (await supabase.auth.getUser()).data?.user?.id || "")
      .single()

    // Create password reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    const { error } = await supabase
      .from("password_reset_tokens")
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (error) {
      console.log("[v0] Password reset token error:", error)
      return NextResponse.json(
        { error: "Failed to create reset token" },
        { status: 500 }
      )
    }

    // TODO: Send email with reset link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}
    console.log("[v0] Password reset token created for:", email)

    return NextResponse.json({
      success: true,
      message: "Check your email for password reset instructions",
    })
  } catch (error) {
    console.log("[v0] Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
