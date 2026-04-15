"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AutoRedirect({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    const run = async () => {
      const shouldRemember = typeof window !== "undefined" && localStorage.getItem("cloudpix_remember_me") === "1"
      if (!shouldRemember) return

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted || !user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("two_factor_enabled")
        .eq("id", user.id)
        .single()

      const target = profile?.two_factor_enabled ? "/auth/2fa?next=/dashboard" : redirectTo

      if (pathname !== target) {
        router.replace(target)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [pathname, redirectTo, router])

  return null
}
