// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob' // ← NUEVO
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl: {
        rejectUnauthorized: false
      }
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // ← NUEVO: Vercel Blob Storage
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true, // habilita para la colección 'media'
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true, // importante para evitar límites de 4.5MB
      addRandomSuffix: true, // añade sufijo aleatorio a nombres de archivo
    }),
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
            type: 'row', 
            fields: [
              {
                name: 'name',
                type: 'text',
                required: true,
                admin: {
                  width: '50%',
                },
              },
              {
                name: 'label',
                type: 'text',
                admin: {
                  width: '50%',
                },
              },
            ]
          },
          {
            type: 'row',
            fields: [
                {
            name: 'defaultValue',
            type: 'text',
            admin: {
              width: "50%",
            },
          },
          {
            name: 'width',
            type: 'number',
            admin: {
              width: "50%",
            },
          },
            ]
          },
          {
            name: 'required',
            type: 'checkbox',
            defaultValue: false,
          },
          {
            name: 'selectType',
            type: 'select',
            label: 'Select Type',
            options: [
              { label: 'Custom Options', value: 'custom' },
              { label: 'Countries', value: 'countries' },
              { label: 'Romania Locations', value: 'romaniaLocations' },
              {label: 'Phone number', value: 'phoneNumber'}
            ],
            defaultValue: 'custom',
            admin: {
              description: 'Choose a predefined list or define custom options'
            }
          },
          {
            name: 'options',
            type: 'array',
            fields: [
              {
                type: 'row',
                fields: [
                    {
                name: 'label',
                type: 'text',
                required: true,
                admin: {
                  width: '50%',
                },
              },
              {
                name: 'value',
                type: 'text',
                required: true,
                admin: {
                  width: '50%',
                },
              },
                ]
              }
            
            ],
            admin: {
              condition: (_, siblingData) => siblingData?.selectType === 'custom',
            },
          },
          {
            name: 'conditionalFields',
            type: 'array',
            label: 'Conditional Fields',
            admin: {
              description: 'Show/hide other fields based on the selected radio option'
            },
            fields: [
              {
                name: 'radioValue',
                type: 'text',
                label: 'When this value is selected',
                admin: {
                  description: 'Enter the value of the radio option that triggers these fields'
                }
              },
              {
                name: 'fields',
                type: 'blocks',
                label: 'Fields to show',
                blocks: [
                  {
                    slug: 'conditionalText',
                    labels: {
                      singular: 'Text Field',
                      plural: 'Text Fields',
                    },
                    fields: [
                      {
                        type: 'row',
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
                        ]
                      },
                    {
                      type: 'row',
                      fields: [
                         {
                        name: 'defaultValue',
                        type: 'text',
                      },
                      {
                        name: 'width',
                        type: 'number',
                      },
                      ]
                    },
                     
                      {
                        name: 'required',
                        type: 'checkbox',
                        defaultValue: false,
                      }
                    ]
                  },
                  {
                    slug: 'conditionalSelectType',
                    labels: {
                      singular: 'Select Field',
                      plural: 'Select Fields',
                    },
                    fields: [
                      {
                        type: 'row',
                        fields: [
                          {
                        name: 'name',
                        type: 'text',
                        required: true,
                        admin: {
                          width: '50%',
                        },
                      },
                      {
                        name: 'label',
                        type: 'textarea',
                        admin: {
                          width: '50%',
                        },
                      },
                        ]
                      },
                      {
                        type: 'row',
                        fields: [
                           {
                        name: 'defaultValue',
                        type: 'text',
                        admin: {
                          width: '50%',
                        },
                      },
                      {
                        name: 'width',
                        type: 'number',
                        admin: {
                          width: '50%',
                        },
                      },
                        ]
                      },
                      {
                        name: 'required',
                        type: 'checkbox',
                        defaultValue: false,
                      },
                      {
                        name: 'selectType',
                        type: 'select',
                        label: 'Select Type',
                        options: [
                          { label: 'Custom Options', value: 'custom' },
                          { label: 'Countries', value: 'countries' },
                        ],
                        defaultValue: 'custom',
                        admin: {
                          description: 'Choose a predefined list or define custom options'
                        }
                      },
                      {
                        name: 'options',
                        type: 'array',
                        fields: [
                          {
                            type: 'row',
                            fields: [
                               {
                            name: 'label',
                            type: 'textarea',
                            required: true,
                            admin: {
                              width: '50%',
                            },
                          },
                          {
                            name: 'value',
                            type: 'text',
                            required: true,
                            admin: {
                              width: '50%',
                            },
                          },
                            ]
                          }
                         
                        ],
                         admin: {
                           condition: (_, siblingData) => siblingData?.options === 'custom',
                         }
                      },
                      {
                        name: 'displayType',
                        type: 'select',
                        label: 'Display Type',
                        options: [
                          { label: 'Dropdown', value: 'dropdown' },
                          { label: 'Checkbox Group', value: 'checkboxGroup' },
                          { label: 'Radio Group', value: 'radioGroup' },
                        ],
                        defaultValue: 'dropdown',
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'displayType',
            type: 'select',
            label: 'Display Type',
            options: [
              { label: 'Dropdown', value: 'dropdown' },
              { label: 'Checkbox Group', value: 'checkboxGroup' },
              { label: 'Radio Group', value: 'radioGroup' },
            ],
            defaultValue: 'dropdown',
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
            type: 'row', 
            fields: [
              {
                name: 'name',
                type: 'text',
                required: true,
                admin: {
                  width: '50%',
                },
              },
              {
                name: 'label',
                type: 'text',
                admin: {
                  width: '50%',
                },
              },
            ]
          },
          {
            type: 'row',
            fields: [
              {
            name: 'width',
            type: 'number',
            admin: {
              width: "50%",
            },
          },
          {
            name: 'required',
            type: 'checkbox',
            admin: {
              width: "50%",
            },
          },
            
            ]
          },
          {
            name: 'LabelLink',
            label: 'This label redirects to:',
            type: `text`
          }
        ]
      },
      country: true,

      },
      

      defaultToEmail: 'valentina@cibernova.es',
      formOverrides: {
        fields: ({ defaultFields }) =>  {
          return [
            ...defaultFields,
            {
              name: 'formSections',
              type: 'array',
              label: 'Form Sections',
              admin: {
                description: 'Organize your form fields into sections'
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Section Title',
                  required: true,
                },

                {
                  name: 'fields',
                  type: 'array',
                  label: 'Fields in this section',
                  fields: [
                    {
                      name: 'fieldName',
                      type: 'text',
                      label: 'Field Name',
                      admin: {
                        description: 'Enter the name of the form field to include in this section'
                      }
                    }
                  ]
                },
                {
                  name:'requiredSection',
                  type: 'checkbox',
                  label: 'Is required?'
                  
                }
              ]
            },
          ];
        },
          admin: {
        group: 'General'
      },

          access: {
            read: () => true,
            create: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
            delete: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
            update: ({ req }) => req.user && req.user.roles ===  'admin' ? true:false,
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
    seoPlugin({
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `Sieupot.ro — ${doc.title}`,
      generateDescription: ({ doc }) => generateSEODescription(doc),
      generateURL: ({ doc, collectionSlug }) =>
        `${publicURL}/${collectionSlug}/${doc?.slug}`,
      generateImage: ({ doc }) => doc?.image,
      interfaceName: 'customInterfaceNameSEO',
    }),
    redirectsPlugin({
      collections: ['news', ],

      overrides: {
        admin: {
          group: 'General'
        },
        access: {
          read: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
          create: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
          delete: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
          update: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
        },
        // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'from') {
              return {
                ...field,
                admin: {
                  description: 'You will need to rebuild the website when changing this field.',
                },
              }
            }
            return field
          })
        },
        hooks: {
          afterChange: [revalidateRedirects],
        },
      },
    }),
  ],
})

// ... resto de tu código (extractLexicalText, generateSEODescription)
export function extractLexicalText(content: unknown): string {
  if (!content) return 'Automatically generated description';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeToText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (typeof node !== 'object' || node === null) return '';
    if (typeof node.text === 'string') return node.text;
    if (typeof node.textContent === 'string') return node.textContent;
    let result = '';
    if (Array.isArray(node.children)) {
      result = node.children.map(nodeToText).join(' ');
    } else if (node.content && typeof node.content === 'object') {
      result = nodeToText(node.content);
    } else if (Array.isArray(node.content)) {
      result = node.content.map(nodeToText).join(' ');
    } else if (node.root && typeof node.root === 'object') {
      result = nodeToText(node.root);
    } else if (node.paragraphs && Array.isArray(node.paragraphs)) {
      result = node.paragraphs.map(nodeToText).join('\n');
    } else {
      const possibleContentProps = [
        'root', 'nodes', 'elements', 'paragraphs', 'blocks', 
        'inline', 'content', 'data'
      ];
      
      for (const prop of possibleContentProps) {
        if (node[prop]) {
          const extracted = nodeToText(node[prop]);
          if (extracted) {
            result += ' ' + extracted;
          }
        }
      }
      
      if (!result) {
        for (const key in node) {
          if (typeof node[key] === 'object' && node[key] !== null) {
            const extracted = nodeToText(node[key]);
            if (extracted) {
              result += ' ' + extracted;
            }
          }
        }
      }
    }
    
    return result.trim();
  };
  if (Array.isArray(content)) {
    return content.map(nodeToText).join(' ').trim();
  } else {
    return nodeToText(content).trim();
  }
}

export function generateSEODescription(doc: { content?: unknown }): string {
  if (!doc.content) return 'Auto-generated Description';
  const text = extractLexicalText(doc.content);
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return cleanText.length > 150 ? cleanText.substring(0, 147) + '...' : cleanText;
}