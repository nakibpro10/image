"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ApiKeySetup } from "@/components/dashboard/api-key-setup"
import { UploadQueue } from "@/components/dashboard/upload-queue"
import { ImageGallery } from "@/components/dashboard/image-gallery"
import { Loader2, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MAX_FILE_SIZE = 32 * 1024 * 1024 // 32MB

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const router = useRouter()

  const { data: apiKeyData, mutate: mutateApiKey } = useSWR(
    user ? "/api/api-key" : null,
    fetcher
  )
  const { data: imagesData, mutate: mutateImages } = useSWR(
    user ? "/api/images" : null,
    fetcher
  )

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)
      setLoading(false)
    })
  }, [router])

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Image deleted")
      mutateImages()
    } else {
      toast.error("Failed to delete image")
    }
  }

  const handleUploadComplete = () => {
    mutateImages()
    mutateApiKey()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel rounded-3xl p-8 flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-foreground font-medium">Loading dashboard...</span>
        </div>
      </main>
    )
  }

  // apiKeyData is still loading — don't flash the setup UI
  const apiKeyLoaded = apiKeyData !== undefined
  const hasApiKey = apiKeyData?.hasApiKey ?? false

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        <DashboardHeader email={user?.email || ""} />

        {/* API Key Warning Banner */}
        {apiKeyLoaded && !hasApiKey && !bannerDismissed && (
          <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-yellow-300">imgBB API Key not set</p>
              <p className="text-xs text-yellow-400/80 mt-0.5">
                You need a personal imgBB API key to upload images.{" "}
                <Link href="/settings/api-key" className="underline underline-offset-2 hover:text-yellow-300 transition-colors">
                  Go to Settings → API Key
                </Link>{" "}
                to add one, or set it up below.
              </p>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-yellow-400" />
            </button>
          </div>
        )}

        {/* Show ApiKeySetup + locked UploadQueue side by side when no key */}
        {apiKeyLoaded && !hasApiKey && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApiKeySetup />
            <UploadQueue
              onUploadComplete={handleUploadComplete}
              hasApiKey={false}
              maxFileSize={MAX_FILE_SIZE}
            />
          </div>
        )}

        {/* Show full UploadQueue when key is set */}
        {apiKeyLoaded && hasApiKey && (
          <UploadQueue
            onUploadComplete={handleUploadComplete}
            hasApiKey={true}
            maxFileSize={MAX_FILE_SIZE}
          />
        )}

        {/* Show skeleton while apiKeyData loads */}
        {!apiKeyLoaded && (
          <div className="glass-panel rounded-3xl p-8 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded-lg mb-4" />
            <div className="h-40 bg-white/5 rounded-2xl" />
          </div>
        )}

        <ImageGallery
          images={imagesData?.images || []}
          onDelete={handleDelete}
        />
      </div>
    </main>
  )
}
