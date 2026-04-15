export interface UploadItem {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
  abortController?: AbortController
  preview?: string
}

export interface UploadManagerOptions {
  maxConcurrentUploads?: number
  maxFileSize?: number // in bytes
  onProgress?: (items: UploadItem[]) => void
  onError?: (id: string, error: string) => void
  onComplete?: (id: string, result: any) => void
}

export class UploadManager {
  private items: Map<string, UploadItem> = new Map()
  private queue: string[] = []
  private activeUploads: Set<string> = new Set()
  private maxConcurrent: number
  private maxFileSize: number
  private callbacks: Required<UploadManagerOptions>

  constructor(options: UploadManagerOptions = {}) {
    this.maxConcurrent = options.maxConcurrentUploads || 2
    this.maxFileSize = options.maxFileSize || 32 * 1024 * 1024 // 32MB default
    this.callbacks = {
      maxConcurrentUploads: options.maxConcurrentUploads || 2,
      maxFileSize: options.maxFileSize || 32 * 1024 * 1024,
      onProgress: options.onProgress || (() => {}),
      onError: options.onError || (() => {}),
      onComplete: options.onComplete || (() => {}),
    }
  }

  addFile(file: File): string | null {
    // Validate file
    if (!file.type.startsWith("image/")) {
      const id = this.generateId()
      this.callbacks.onError(id, "Please select an image file")
      return null
    }

    if (file.size > this.maxFileSize) {
      const id = this.generateId()
      const maxMB = (this.maxFileSize / 1024 / 1024).toFixed(1)
      this.callbacks.onError(id, `File size must be less than ${maxMB}MB`)
      return null
    }

    const id = this.generateId()
    const abortController = new AbortController()

    const item: UploadItem = {
      id,
      file,
      progress: 0,
      status: "pending",
      abortController,
    }

    this.items.set(id, item)
    this.queue.push(id)

    // Generate preview
    this.generatePreview(id, file)

    // Start processing queue
    this.processQueue()

    return id
  }

  private async generatePreview(id: string, file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const item = this.items.get(id)
      if (item) {
        item.preview = e.target?.result as string
        this.callbacks.onProgress(Array.from(this.items.values()))
      }
    }
    reader.readAsDataURL(file)
  }

  private async processQueue() {
    while (this.queue.length > 0 && this.activeUploads.size < this.maxConcurrent) {
      const id = this.queue.shift()
      if (id) {
        this.activeUploads.add(id)
        this.uploadFile(id)
      }
    }
  }

  private async uploadFile(id: string) {
    const item = this.items.get(id)
    if (!item) return

    item.status = "uploading"
    this.callbacks.onProgress(Array.from(this.items.values()))

    try {
      const formData = new FormData()
      formData.append("image", item.file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          item.progress = (event.loaded / event.total) * 100
          this.callbacks.onProgress(Array.from(this.items.values()))
        }
      })

      // Handle completion
      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText)
              item.status = "completed"
              item.progress = 100
              this.callbacks.onComplete(id, result)
              resolve()
            } catch (e) {
              reject(new Error("Invalid response from server"))
            }
          } else if (xhr.status === 413) {
            // Payload too large — server-side size check or platform limit
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error || "File is too large. Please use an image under 32MB."))
            } catch {
              reject(new Error("File is too large. Please use an image under 32MB."))
            }
          } else {
            // Other errors
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload. Please check your connection."))
        })

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled by user"))
        })

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timed out. Please try again with a smaller file or check your connection."))
        })

        // Increase timeout for large files (120 seconds for 32MB files)
        xhr.timeout = 120000

        xhr.open("POST", "/api/upload")
        // Don't set Content-Type - let browser set it with boundary for FormData
        xhr.send(formData)

        // Store xhr in case we need to abort
        item.abortController = {
          abort: () => xhr.abort(),
        } as AbortController
      })
    } catch (error) {
      item.status = "error"
      item.error = error instanceof Error ? error.message : "Upload failed"
      this.callbacks.onError(id, item.error)
    } finally {
      this.activeUploads.delete(id)
      this.callbacks.onProgress(Array.from(this.items.values()))
      this.processQueue()
    }
  }

  cancelUpload(id: string) {
    const item = this.items.get(id)
    if (item && item.abortController) {
      item.abortController.abort()
      item.status = "error"
      item.error = "Upload cancelled"
      this.activeUploads.delete(id)
      this.callbacks.onProgress(Array.from(this.items.values()))
      this.processQueue()
    }
  }

  retryUpload(id: string) {
    const item = this.items.get(id)
    if (item && item.status === "error") {
      item.status = "pending"
      item.error = undefined
      item.progress = 0
      this.queue.push(id)
      this.processQueue()
    }
  }

  removeItem(id: string) {
    this.items.delete(id)
    this.queue = this.queue.filter((queueId) => queueId !== id)
    this.callbacks.onProgress(Array.from(this.items.values()))
  }

  getItems(): UploadItem[] {
    return Array.from(this.items.values())
  }

  clear() {
    this.items.clear()
    this.queue = []
    this.activeUploads.clear()
    this.callbacks.onProgress([])
  }

  private generateId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
