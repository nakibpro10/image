"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, ExternalLink, Trash2, Check, ImageIcon, Eye, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"

interface ImageData {
  id: string
  filename: string
  url: string
  thumb_url: string
  delete_url: string
  size: number
  uploaded_at: string
}

interface ImageGalleryProps {
  images: ImageData[]
  onDelete: (id: string) => void
}

const PAGE_SIZE = 15

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return images.slice(start, start + PAGE_SIZE)
  }, [currentPage, images])

  const copyUrl = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("URL copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (images.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No images yet</h3>
        <p className="text-muted-foreground text-sm">
          Upload your first image to see it here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Your Gallery</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="glass-card rounded-full px-4 py-1.5 text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? "image" : "images"}
          </span>
          <span className="glass-card rounded-full px-4 py-1.5 text-sm text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {paginatedImages.map((image) => (
          <div
            key={image.id}
            className="glass-card rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="relative aspect-square bg-muted/20">
              <img
                src={image.thumb_url || image.url}
                alt={image.filename}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-2">
                <button
                  onClick={() => setSelectedImage(image)}
                  className="w-10 h-10 rounded-xl bg-background/90 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="View image"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyUrl(image.url, image.id)}
                  className="w-10 h-10 rounded-xl bg-background/90 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Copy URL"
                >
                  {copiedId === image.id ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-background/90 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onDelete(image.id)}
                  className="w-10 h-10 rounded-xl bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
                  aria-label="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm font-medium text-foreground truncate">{image.filename}</p>
              <div className="flex items-center justify-between mt-1 gap-2">
                <p className="text-xs text-muted-foreground truncate">
                  {image.size ? `${(image.size / 1024).toFixed(1)} KB` : ""}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(image.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="glass-button rounded-xl px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="glass-button rounded-xl px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
          <div className="glass-panel w-full max-w-5xl rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedImage.filename}</p>
                <p className="text-xs text-muted-foreground">{new Date(selectedImage.uploaded_at).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-xl p-2 hover:bg-white/10 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black/30 p-4 max-h-[80vh] overflow-auto">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="text-sm text-muted-foreground">
                {selectedImage.size ? `${(selectedImage.size / 1024).toFixed(1)} KB` : ""}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(selectedImage.url, selectedImage.id)}
                  className="glass-button rounded-xl px-4 py-2 text-sm"
                >
                  Copy URL
                </button>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button rounded-xl px-4 py-2 text-sm"
                >
                  Open Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
