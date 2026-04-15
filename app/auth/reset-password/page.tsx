"use client"

import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
          <div className="glass-panel rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
