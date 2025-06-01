/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ CRÍTICO: Configuración para imágenes de Vercel Blob Storage
  images: {
    // Dominios permitidos para Next.js Image component
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ✅ Optimizaciones para Payload CMS
  experimental: {
    // Mejora el rendimiento con archivos grandes
    largePageDataBytes: 128 * 1000, // 128KB
  },

  // ✅ Headers de seguridad para archivos estáticos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // ✅ Optimizaciones de webpack para Payload
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Evitar importar módulos de servidor en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;