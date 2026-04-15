"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploaderProps {
  onUploadComplete: () => void
  hasApiKey: boolean
}

export function ImageUploader({ onUploadComplete, hasApiKey }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 32 * 1024 * 1024) {
      toast.error("File size must be less than 32MB")
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      let result
      try {
        result = await res.json()
      } catch {
        // Handle 413 or other errors that don't return JSON
        if (res.status === 413) {
          toast.error("File is too large. Maximum size is 32MB.")
        } else {
          toast.error(`Upload failed: ${res.statusText}`)
        }
        setUploading(false)
        return
      }

      if (!res.ok) {
        toast.error(result.error || "Upload failed")
        setUploading(false)
        return
      }

      toast.success("Image uploaded successfully!")
      setSelectedFile(null)
      setPreview(null)
      onUploadComplete()
    } catch (error) {
      console.log("[v0] Upload error:", error)
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  if (!hasApiKey) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Set up your API key first</h3>
        <p className="text-muted-foreground text-sm">
          You need to add your imgBB API key above before you can upload images.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload Image</h2>
          <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
        </div>
      </div>

      {preview ? (
        <div className="relative">
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-xl"
              />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3 truncate">
              {selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
            </p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:hover:scale-100"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload to imgBB
              </>
            )}
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-foreground font-medium mb-1">
            {dragOver ? "Drop your image here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP up to 32MB
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      )}
    </div>
  )
}
