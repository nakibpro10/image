import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">Cloud</span>
          <span className="text-xl font-bold text-primary">Pix</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign Up
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          Made By Nakib
        </p>
      </div>
    </footer>
  )
}
