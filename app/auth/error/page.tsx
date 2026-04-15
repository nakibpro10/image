import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="glass-panel rounded-3xl p-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Authentication Error</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Something went wrong during authentication. Please try again.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 glass-button rounded-xl px-6 py-3 text-foreground font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  )
}
