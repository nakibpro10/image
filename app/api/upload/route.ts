import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Configure API route to handle large uploads
// maxDuration is required for Vercel functions
export const maxDuration = 60 // Allow 60 seconds for upload processing (32MB files need more time)

// This is Next.js App Router configuration
export const dynamic = 'force-dynamic'

// Increase body size limit for this route
// An 8MB image becomes ~10.6MB as base64 when sent to imgBB
// Setting 12mb to give plenty of headroom
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's API key or fallback to environment variable
    const { data: profile } = await supabase
      .from("profiles")
      .select("imgbb_api_key")
      .eq("id", user.id)
      .single()

    // Use user's API key if set, otherwise try environment variable
    const apiKey = profile?.imgbb_api_key || process.env.IMGBB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Please set your imgBB API key in settings or configure the environment variable",
          actionUrl: "/settings/api-key",
        },
        { status: 400 }
      )
    }

    // Try to get FormData first, then fall back to raw body
    let file: File | null = null
    let filename = "image"

    try {
      const formData = await request.formData()
      file = formData.get("image") as File
      if (file) {
        filename = file.name
      }
    } catch (e) {
      console.log("[v0] FormData parsing failed, trying raw body")
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Define size limits in bytes (32MB)
    const MAX_FILE_SIZE = 32 * 1024 * 1024

    // Check file size before processing
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0)
      console.log(`[v0] File too large: ${file.size} bytes (max: ${MAX_FILE_SIZE})`)
      return NextResponse.json(
        { 
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${maxMB}MB. Please use a smaller image.`,
          details: {
            uploadedSize: file.size,
            maxSize: MAX_FILE_SIZE,
            unit: "bytes",
          }
        },
        { status: 413 }
      )
    }

    console.log("[v0] Processing file:", filename, "size:", file.size, "type:", file.type)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, GIF, WebP, etc.)" },
        { status: 400 }
      )
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")

    console.log("[v0] Base64 encoded, length:", base64.length)

    // Upload to imgBB using URL-encoded form data
    const imgbbParams = new URLSearchParams()
    imgbbParams.append("key", apiKey)
    imgbbParams.append("image", base64)
    imgbbParams.append("name", filename.replace(/\.[^/.]+$/, ""))

    console.log("[v0] Uploading to imgBB, base64 size:", base64.length)

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: imgbbParams.toString(),
    })

    const responseText = await imgbbResponse.text()
    console.log("[v0] imgBB response status:", imgbbResponse.status)

    if (!imgbbResponse.ok) {
      console.log("[v0] imgBB error response:", responseText.substring(0, 200))
      return NextResponse.json(
        { error: "Failed to upload to imgBB. Check your API key or network connection." },
        { status: 500 }
      )
    }

    let imgbbData
    try {
      imgbbData = JSON.parse(responseText)
    } catch (e) {
      console.log("[v0] Failed to parse imgBB response as JSON")
      return NextResponse.json(
        { error: "Invalid response from imgBB. Please try again." },
        { status: 500 }
      )
    }

    if (!imgbbData.success) {
      console.log("[v0] imgBB error:", imgbbData.error?.message || imgbbData.error)
      return NextResponse.json(
        { error: imgbbData.error?.message || "Failed to upload to imgBB. Check your API key." },
        { status: 500 }
      )
    }

    // Save to database
    const { data: image, error } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        filename: filename,
        url: imgbbData.data.url,
        delete_url: imgbbData.data.delete_url,
        thumb_url: imgbbData.data.thumb?.url || imgbbData.data.url,
        size: imgbbData.data.size,
      })
      .select()
      .single()

    if (error) {
      console.log("[v0] Database error:", error.message)
      return NextResponse.json({ error: "Failed to save image record" }, { status: 500 })
    }

    console.log("[v0] Upload successful:", image.id)
    return NextResponse.json({ image })
  } catch (error) {
    console.log("[v0] Upload error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}
