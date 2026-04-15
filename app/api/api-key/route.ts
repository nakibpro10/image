import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { apiKey } = await request.json()

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 400 })
  }

  const { error } = await supabase
    .from("profiles")
    .update({ imgbb_api_key: apiKey.trim() })
    .eq("id", user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("imgbb_api_key")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    hasApiKey: !!profile?.imgbb_api_key,
    // Return masked key for display
    maskedKey: profile?.imgbb_api_key
      ? profile.imgbb_api_key.substring(0, 6) + "..." + profile.imgbb_api_key.slice(-4)
      : null,
  })
}
