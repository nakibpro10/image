"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, ImageIcon, X, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { UploadManager, UploadItem } from "@/utils/upload-manager"

interface UploadQueueProps {
  onUploadComplete: () => void
  hasApiKey: boolean
  maxFileSize?: number
}

export function UploadQueue({ onUploadComplete, hasApiKey, maxFileSize = 32 * 1024 * 1024 }: UploadQueueProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const managerRef = useRef<UploadManager | null>(null)
  const completionTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    managerRef.current = new UploadManager({
      maxConcurrentUploads: 2,
      maxFileSize,
      onProgress: (uploadItems) => {
        setItems(uploadItems)
        const completedCount = uploadItems.filter((item) => item.status === "completed").length
        if (completedCount > 0 && uploadItems.every((item) => item.status !== "uploading" && item.status !== "pending")) {
          onUploadComplete()
        }
      },
      onError: (id, error) => {
        toast.error(`Upload failed: ${error}`)
      },
      onComplete: () => {
        toast.success("Image uploaded successfully!")
      },
    })

    return () => {
      Object.values(completionTimersRef.current).forEach(clearTimeout)
    }
  }, [maxFileSize, onUploadComplete])

  useEffect(() => {
    items.forEach((item) => {
      if (item.status === "completed" && !completionTimersRef.current[item.id]) {
        completionTimersRef.current[item.id] = setTimeout(() => {
          managerRef.current?.removeItem(item.id)
          delete completionTimersRef.current[item.id]
        }, 1000)
      }

      if (item.status !== "completed" && completionTimersRef.current[item.id]) {
        clearTimeout(completionTimersRef.current[item.id])
        delete completionTimersRef.current[item.id]
      }
    })
  }, [items])

  const handleFile = useCallback((file: File) => {
    if (!managerRef.current) return
    managerRef.current.addFile(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      files.forEach((file) => handleFile(file))
    },
    [handleFile]
  )

  const handleCancel = (id: string) => {
    managerRef.current?.cancelUpload(id)
  }

  const handleRetry = (id: string) => {
    managerRef.current?.retryUpload(id)
  }

  const handleRemove = (id: string) => {
    if (completionTimersRef.current[id]) {
      clearTimeout(completionTimersRef.current[id])
      delete completionTimersRef.current[id]
    }
    managerRef.current?.removeItem(id)
  }

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => handleFile(file))
    e.target.value = ""
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

  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload Images</h2>
            <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
          </div>
        </div>

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
            {dragOver ? "Drop your images here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP up to {(maxFileSize / 1024 / 1024).toFixed(0)}MB
          </p>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddMore} />
        </label>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload Queue</h2>
          <p className="text-sm text-muted-foreground">
            {items.filter((i) => i.status === "completed").length}/{items.length} completed
          </p>
        </div>
        <label className="glass-button rounded-lg px-4 py-2 text-sm cursor-pointer">
          Add More
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddMore} />
        </label>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass-card rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {item.preview ? (
                  <img src={item.preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>

                {item.status === "uploading" && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(item.progress)}%</p>
                  </div>
                )}

                {item.status === "completed" && (
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Uploaded — hiding in 1 second</span>
                  </div>
                )}

                {item.status === "error" && (
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive">{item.error}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {item.status === "uploading" && (
                  <>
                    <button onClick={() => handleCancel(item.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Cancel">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </>
                )}

                {item.status === "error" && (
                  <>
                    <button onClick={() => handleRetry(item.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Retry">
                      <RotateCcw className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Remove">
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </>
                )}

                {item.status === "completed" && (
                  <button onClick={() => handleRemove(item.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Remove">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
