import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (provider !== "google") {
      return NextResponse.json(
        { error: "Only Google OAuth is supported" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Initiate Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?type=oauth`,
      },
    })

    if (error) {
      console.log("[v0] Google OAuth error:", error)
      return NextResponse.json({ error: "Failed to initiate Google sign-in" }, { status: 500 })
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.log("[v0] Google OAuth error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
