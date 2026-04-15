"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function SetupApiKeyPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
    }

    getUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      toast.error("Please enter your imgBB API key")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to save API key")
        return
      }

      toast.success("API key saved successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.log("[v0] API key setup error:", error)
      toast.error("Failed to save API key")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="glass-panel w-full max-w-md space-y-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Set Up Image Uploads</h1>
          <p className="text-sm text-muted-foreground">
            Add your imgBB API key to start uploading images. You can also do this later in settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">imgBB API Key</label>
            <Input
              type="password"
              placeholder="Enter your imgBB API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key at{" "}
              <a
                href="https://imgbb.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                imgbb.com/api
              </a>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? "Saving..." : "Save API Key"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
