"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"
import { toast } from "sonner"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface DashboardHeaderProps {
  email: string
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/2fa/logout", { method: "POST" })
    } catch {}

    const supabase = createClient()
    await supabase.auth.signOut()

    if (typeof window !== "undefined") {
      localStorage.removeItem("cloudpix_remember_me")
      document.cookie = "cloudpix_remember_me=; path=/; max-age=0; samesite=lax"
    }

    toast.success("Logged out successfully")
    router.push("/")
    router.refresh()
  }

  return (
    <header className="glass-panel rounded-3xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          <span className="text-foreground">Cloud</span>
          <span className="text-primary">Pix</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-end">
        <ThemeSwitcher compact />
        <div className="hidden sm:flex items-center gap-2 glass-card rounded-xl px-4 py-2 max-w-full">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground truncate max-w-48">{email}</span>
        </div>
        <Link
          href="/settings/account"
          className="flex items-center gap-2 glass-button rounded-xl px-4 py-2 text-sm text-foreground font-medium hover:bg-white/20 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 glass-button rounded-xl px-4 py-2 text-sm text-foreground font-medium hover:bg-white/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
