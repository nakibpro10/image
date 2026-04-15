"use client"

import { useState } from "react"
import { Key, Save, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ApiKeySetup() {
  const [apiKey, setApiKey] = useState("")
  const [saving, setSaving] = useState(false)
  const { data, mutate } = useSWR("/api/api-key", fetcher)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch("/api/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    })

    const result = await res.json()

    if (!res.ok) {
      toast.error(result.error)
      setSaving(false)
      return
    }

    toast.success("API key saved successfully!")
    setApiKey("")
    mutate()
    setSaving(false)
  }

  return (
    <div className="glass-panel rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">imgBB API Key</h2>
          <p className="text-sm text-muted-foreground">Required for image uploads</p>
        </div>
      </div>

      {data?.hasApiKey && (
        <div className="flex items-center gap-2 mb-4 glass-card rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm text-foreground">
            Current key: <span className="font-mono text-muted-foreground">{data.maskedKey}</span>
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={data?.hasApiKey ? "Enter new API key to update" : "Enter your imgBB API key"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !apiKey.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {data?.hasApiKey ? "Update Key" : "Save Key"}
          </button>

          <a
            href="https://api.imgbb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 glass-button rounded-xl px-5 py-3 text-sm text-foreground font-medium"
          >
            Get Free Key
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="mt-4 glass-card rounded-xl p-4 bg-accent/5 border border-accent/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">How to get your free API key:</span>
            <br />
            1. Click "Get Free Key" button above
            <br />
            2. Sign up for a free imgBB account (100 MB/month limit)
            <br />
            3. Go to your API section and copy your API key
            <br />
            4. Paste it here to start uploading images (up to 8MB per image)
          </p>
        </div>
      </form>
    </div>
  )
}
