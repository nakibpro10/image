"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "@/components/theme-switcher"

const items = [
  { href: "/settings/account", label: "Account", icon: "👤" },
  { href: "/settings/security", label: "Security", icon: "🔒" },
  { href: "/settings/api-key", label: "API Key", icon: "🔑" },
]

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 space-y-4 p-4 md:p-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Settings
        </h3>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</p>
        <ThemeSwitcher />
      </div>
    </nav>
  )
}
