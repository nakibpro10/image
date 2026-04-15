import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-background/55 backdrop-blur-md" />

      <div className="absolute top-16 left-20 h-44 w-44 rounded-full bg-primary/10 backdrop-blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-16 h-36 w-36 rounded-full bg-accent/10 backdrop-blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="glass-panel rounded-3xl p-8 md:p-10 text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-primary/12">
            <Search className="h-9 w-9 text-primary" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">404</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-foreground">Page not found</h1>
          <p className="mx-auto mt-4 max-w-md text-sm md:text-base leading-relaxed text-muted-foreground">
            The page you requested does not exist, may have moved, or the URL may be incorrect.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="glass-button inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium text-foreground"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
