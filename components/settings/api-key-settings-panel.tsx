"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ApiKeySettingsPanel() {
  const [apiKey, setApiKey] = useState("")
  const [displayKey, setDisplayKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showKey, setShowKey] = useState(false)
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("imgbb_api_key")
        .eq("id", user.id)
        .single()

      if (profile?.imgbb_api_key) {
        const key = profile.imgbb_api_key
        setDisplayKey(key.substring(0, 8) + "..." + key.substring(key.length - 4))
      }

      setUser(user)
    }

    getUser()
  }, [router, supabase])

  const handleSaveApiKey = async (e: React.FormEvent) => {
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

      const key = apiKey
      setDisplayKey(key.substring(0, 8) + "..." + key.substring(key.length - 4))
      setApiKey("")
      toast.success("API key saved successfully!")
    } catch (error) {
      console.log("[v0] API key save error:", error)
      toast.error("Failed to save API key")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="glass-panel rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold text-foreground">imgBB API Key</h2>
        <p className="text-sm text-muted-foreground">
          Your API key allows CloudPix to upload images on your behalf. If you don&apos;t set a personal API key, 
          the system will use a default shared key (if configured).
        </p>
      </div>

      {displayKey && (
        <div className="mb-6 rounded-lg bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-400">API Key Set</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{displayKey}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your API key is securely stored. You can update it anytime.
          </p>
        </div>
      )}

      <form onSubmit={handleSaveApiKey} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {displayKey ? "Update" : "Add"} imgBB API Key
          </label>
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Paste your imgBB API key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-primary hover:underline"
          >
            {showKey ? "Hide" : "Show"} key
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an API key?{" "}
            <a
              href="https://imgbb.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get one free at imgbb.com
            </a>
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !apiKey}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? "Saving..." : "Save API Key"}
        </Button>
      </form>
    </div>
  )
}
