import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    optimizeFonts: true,
  }
  // Your Next.js config here
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
