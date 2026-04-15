import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase body size limit to handle large image uploads (accounts for base64 encoding overhead)
  // A 32MB image becomes ~43MB after base64 encoding
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

initOpenNextCloudflareForDev()

export default nextConfig
