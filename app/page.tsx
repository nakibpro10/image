import { AutoRedirect } from "@/components/auth/auto-redirect"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <AutoRedirect />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
