import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("cloudpix_2fa_verified")
  response.cookies.delete("cloudpix_remember_me")
  return response
}
