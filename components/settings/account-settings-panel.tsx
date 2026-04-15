"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AccountSettingsPanel() {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)
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

      // Get username from user metadata
      const userUsername = user.user_metadata?.username || user.email?.split("@")[0] || "User"
      setUsername(userUsername)

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      if (profile?.full_name) {
        setFullName(profile.full_name)
      }

      setUser(user)
    }

    getUser()
  }, [router, supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile")
        return
      }

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.log("[v0] Profile update error:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password")
      return
    }

    setDeleting(true)

    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account")
        return
      }

      toast.success("Account deleted successfully")
      router.push("/")
    } catch (error) {
      console.log("[v0] Account deletion error:", error)
      toast.error("Failed to delete account")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeletePassword("")
    }
  }

  if (!user) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Profile Update */}
      <div className="glass-panel rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Profile Information</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              type="text"
              value={username}
              disabled
              className="border border-white/20 bg-white/5 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Your unique username. Contact support to change it.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name (optional)"
              className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-lg backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>

        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All your images and data will be permanently deleted.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enter your password to confirm
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                variant="destructive"
                className="flex-1"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletePassword("")
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
