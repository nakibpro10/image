"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="glass-panel rounded-3xl p-8 md:p-10 text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-destructive/12">
            <AlertTriangle className="h-9 w-9 text-destructive" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-destructive/80">Error</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-foreground">Something went wrong</h1>
          <p className="mx-auto mt-4 max-w-md text-sm md:text-base leading-relaxed text-muted-foreground">
            CloudPix hit an unexpected error while rendering this page. Try again, or return to a safe page.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="glass-button inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
