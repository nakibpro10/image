import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.log("[v0] Set password error:", error)
      return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
    }

    // Mark that user has set a password
    await supabase
      .from("profiles")
      .update({ has_password: true })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      message: "Password set successfully",
    })
  } catch (error) {
    console.log("[v0] Set password error:", error)
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
  }
}
