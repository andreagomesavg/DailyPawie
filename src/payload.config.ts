// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pet } from './collections/Pets'
import { Documents } from './collections/Documents'
import { News } from './collections/News'
import { revalidateRedirects } from './hooks/revalidateRedirects'
import { seoPlugin } from '@payloadcms/plugin-seo';

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const publicURL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pet, Documents, News],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // ✅ CONFIGURACIÓN AGRESIVA ANTI-TIMEOUT
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl: {
        rejectUnauthorized: false
      },
      // 🔥 CONFIGURACIÓN ULTRA-OPTIMIZADA
      max: 2, // SOLO 2 conexiones máximo - evita saturación
      min: 1, // Mínimo 1 conexión siempre activa
      idleTimeoutMillis: 15000, // 15 segundos - limpieza rápida
      connectionTimeoutMillis: 5000, // 5 segundos timeout conexión
      log: () => {}, // Sin logging para mejor performance
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    
    // ✅ VERCEL BLOB STORAGE OPTIMIZADO
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true, // 🔥 CRÍTICO: Todo en cliente
      addRandomSuffix: true,
      cacheControlMaxAge: 365 * 24 * 60 * 60,
    }),

    // ✅ FORM BUILDER SIMPLIFICADO (sin cambios complejos)
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        email: true,
        message: true,
        select: {
          labels: {
            singular: 'Select Field',
            plural: 'Select Fields',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'required',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'options',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ]
        },
        checkbox: {
          labels: {
            singular: 'Checkbox Field',
            plural: 'Checkbox Fields',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'required',
              type: 'checkbox',
            },
          ]
        },
        country: true,
      },
      defaultToEmail: 'valentina@cibernova.es',
      
      // ✅ FORM OVERRIDES SIMPLIFICADOS
      formOverrides: {
        fields: ({ defaultFields }) => defaultFields,
        admin: {
          group: 'General'
        },
        access: {
          read: () => true,
          create: ({ req }) => req.user?.roles === 'admin',
          delete: ({ req }) => req.user?.roles === 'admin',
          update: ({ req }) => req.user?.roles === 'admin',
        },
      },
      
      formSubmissionOverrides: {
        access: {
          create: () => true, 
          read: () => true,  
          update: () => true
        },
        admin: {
          group: 'General'
        },
      }
    }),

    // ✅ SEO PLUGIN SIMPLIFICADO
    seoPlugin({
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `DailyPawie — ${doc.title || 'Pet Care'}`,
      generateDescription: ({ doc }) => generateSEODescription(doc),
      generateURL: ({ doc, collectionSlug }) =>
        `${publicURL}/${collectionSlug}/${doc?.slug}`,
      generateImage: ({ doc }) => doc?.image,
      interfaceName: 'customInterfaceNameSEO',
    }),

    // ✅ REDIRECTS PLUGIN SIMPLIFICADO
    redirectsPlugin({
      collections: ['news'],
      overrides: {
        admin: {
          group: 'General'
        },
        access: {
          read: ({ req }) => req.user?.roles === 'admin',
          create: ({ req }) => req.user?.roles === 'admin',
          delete: ({ req }) => req.user?.roles === 'admin',
          update: ({ req }) => req.user?.roles === 'admin',
        },
        fields: ({ defaultFields }) => defaultFields,
        // ✅ SIN HOOKS COMPLEJOS - evitar afterChange
      },
    }),
  ],
})

// ✅ FUNCIONES OPTIMIZADAS
export function extractLexicalText(content: unknown): string {
  if (!content) return 'Auto-generated description';
  
  // ✅ SIMPLIFICADO - evitar loops complejos
  if (typeof content === 'string') return content;
  if (typeof content !== 'object') return '';
  
  try {
    const text = JSON.stringify(content);
    return text.substring(0, 150).replace(/[{}"\[\]]/g, ' ').trim();
  } catch {
    return 'Auto-generated description';
  }
}

export function generateSEODescription(doc: { content?: unknown }): string {
  if (!doc.content) return 'Pet care and management with DailyPawie';
  
  const text = extractLexicalText(doc.content);
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  return cleanText.length > 150 
    ? cleanText.substring(0, 147) + '...' 
    : cleanText || 'Pet care and management with DailyPawie';
}