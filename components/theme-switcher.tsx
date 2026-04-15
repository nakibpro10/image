"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const options = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className={`glass-card rounded-2xl p-1 ${compact ? "flex items-center gap-1" : "grid grid-cols-3 gap-1"}`}>
      {options.map((option) => {
        const Icon = option.icon
        const active = mounted && theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
            aria-pressed={active}
            title={`${option.label} theme`}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
