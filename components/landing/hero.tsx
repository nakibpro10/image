"use client"

import Link from "next/link"
import { ArrowRight, Cloud, ImageIcon, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />

      {/* Floating glass orbs - decorative */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 backdrop-blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-accent/10 backdrop-blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-40 right-32 w-32 h-32 rounded-full bg-primary/5 backdrop-blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80">Unlimited Image Hosting</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-tight mb-6">
          <span className="text-foreground">Cloud</span>
          <span className="text-primary">Pix</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
          Upload unlimited images with a stunning liquid glass experience. 
          Connect your imgBB API key once, and host forever.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 glass-button px-8 py-4 rounded-2xl font-semibold text-lg text-foreground"
          >
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Unlimited Uploads</p>
              <p className="text-xs text-muted-foreground">No file limits</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Cloud Storage</p>
              <p className="text-xs text-muted-foreground">Via imgBB CDN</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Lightning Fast</p>
              <p className="text-xs text-muted-foreground">Instant uploads</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
