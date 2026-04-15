# CloudPix Upload System Documentation

## Overview

The CloudPix upload system is designed to handle large image files (up to 32MB) with robust error handling, concurrent uploads, and a seamless user experience.

## Architecture

### Components

1. **UploadQueue Component** (`/components/dashboard/upload-queue.tsx`)
   - User-facing interface for uploading files
   - Supports drag-and-drop and file selection
   - Displays upload progress, status, and file information
   - Provides cancel/retry/remove actions

2. **UploadManager Utility** (`/utils/upload-manager.ts`)
   - Manages concurrent uploads (up to 2 simultaneously)
   - Handles file validation and size limits
   - Generates image previews
   - Tracks upload progress with XMLHttpRequest
   - Implements queue processing and retry logic

3. **Upload API Route** (`/app/api/upload/route.ts`)
   - Server-side file upload handler
   - Validates file size (32MB limit)
   - Converts images to base64 for imgBB upload
   - Stores image metadata in Supabase database
   - Supports environment variable API keys as fallback

4. **API Key Setup** (`/components/dashboard/api-key-setup.tsx`)
   - User interface for entering imgBB API key
   - Provides guidance for obtaining free API key
   - Shows masked key display for security
   - Links to imgBB registration

## File Size Limits

- **Maximum file size**: 8MB (8,388,608 bytes)
- **Base64 overhead**: Approximately 33% (8MB image ≈ 10.6MB base64)
- **Server limit**: Configured to 10MB to account for overhead

Why 8MB?
- imgBB API accepts up to 32MB
- 8MB provides a good balance between quality and performance
- Results in reasonable upload times (typically 10-30 seconds on 4G)
- Prevents timeout issues (30-second limit)

## Error Handling

### Common Error Messages

1. **"File is too large"**
   - User selected a file exceeding 8MB
   - Solution: Compress the image or select a smaller file

2. **"Upload failed with status 413"**
   - Request body exceeds server limits (fixed by Next.js config)
   - Solution: Retry or check file size

3. **"File must be an image"**
   - Non-image file was selected
   - Solution: Select a valid image file (PNG, JPG, GIF, WebP, etc.)

4. **"API key is invalid or expired"**
   - imgBB API rejected the key
   - Solution: Verify API key in settings

5. **"Network error"**
   - Connection interrupted
   - Solution: Check connection and retry

## Configuration

### Next.js Config (`next.config.mjs`)

```javascript
api: {
  bodyParser: {
    sizeLimit: '10mb',
  },
}
```

This allows Next.js API routes to accept requests up to 10MB, accounting for base64 encoding overhead.

### Environment Variables

Create a `.env.local` file with:

```
IMGBB_API_KEY=your_imgbb_api_key_here  # Optional fallback for system-wide uploads
```

If set, users without personal API keys will use this shared key.

## User Flow

1. **Dashboard Landing**
   - User sees API Key Setup panel
   - User clicks "Get Free Key" → Opens imgBB registration
   - User enters API key and saves

2. **Upload Process**
   - User selects or drags image files
   - System validates: file type, file size
   - Image added to queue (pending status)
   - Upload starts (up to 3 concurrent)
   - Progress bar shows upload percentage
   - After completion: image appears in gallery

3. **Error Recovery**
   - Failed upload shows error message
   - User can "Retry" to upload again
   - Or "Remove" to discard the file

## Performance Optimizations

1. **Concurrent Uploads** - 3 files upload simultaneously
2. **Progress Tracking** - Real-time progress via XMLHttpRequest
3. **Image Preview** - Generated client-side for instant feedback
4. **Queue Management** - Efficient queue processing
5. **Error Resilience** - Automatic retry with exponential backoff capability

## Security Considerations

1. **API Key Storage**
   - User keys stored encrypted in Supabase database
   - Never exposed in API responses
   - Masked display in UI (shows last 4 characters only)

2. **File Validation**
   - Server-side file type validation
   - Size limits enforced on client and server
   - Base64 conversion prevents raw file access

3. **Authentication**
   - All uploads require authenticated user
   - Row-level security ensures users can only access their images

4. **Environment Variables**
   - Sensitive keys stored in environment (not in code)
   - Never logged or exposed in error messages

## Troubleshooting

### "Upload failed with status 413"
- **Cause**: File size exceeds limits
- **Fix**: Reduce image size or compress before upload

### Upload hangs/times out
- **Cause**: Large file on slow connection
- **Fix**: Check internet connection, try again, or use smaller file

### API key rejected
- **Cause**: Invalid or expired key
- **Fix**: Obtain new key from imgBB and update in settings

### Images not appearing in gallery
- **Cause**: Supabase database error
- **Fix**: Check database connection, try uploading again

## Testing

To test with large files locally:

```bash
# Create test file (8MB)
dd if=/dev/zero of=test.bin bs=1M count=8

# Convert to image format
# Use your image editor or online tools to create a test image
```

## Future Enhancements

- Image optimization (automatic compression)
- Batch upload with progress tracking
- Image editing before upload
- Direct Vercel Blob storage option
- Webhook integration for processing
- CDN caching optimization
