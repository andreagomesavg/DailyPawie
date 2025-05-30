import { BlocksFeature, FixedToolbarFeature, HeadingFeature, HorizontalRuleFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { CollectionConfig } from "payload";
import { authenticatedOrPublished } from "@/access/autheinticatedorPublished";
import { generatePreviewPath } from "@/utilities/generatePreviewPath";
import { slugField } from "@/fields/slug";
import { revalidateDelete, revalidateNew } from "./hooks/revalidateNew";
import { populateAuthors } from "./hooks/populateAuthors";
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';

export const News: CollectionConfig<'news'> = {
    slug: 'news',
    access: {
      create: ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
      delete:  ({ req }) => req.user && req.user.roles === 'admin' ? true:false,
      read: authenticatedOrPublished,
      update:  ({ req }) => req.user && req.user.roles === 'admin' || 'editor' ? true:false,
    },
    defaultPopulate: {
        title: true,
        slug: true,
       
      },
    admin: {
      defaultColumns: ['title', 'slug', 'updatedAt', 'publishedAt', 'authors'],
      livePreview: {
        url: ({ data, req }) => {
          const path = generatePreviewPath({
            slug: typeof data?.slug === 'string' ? data.slug : '',
            collection: 'news',
            req,
          })
     
          return path
        },
      },
      preview: (data, { req }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'news',
          req,
        }),
      useAsTitle: 'title',
    },

      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      {
        name: 'image',
        label: 'Image',
        type: 'upload',
        relationTo: 'media',
        required: true,
    },
        {
          type: 'tabs',
          tabs: [
            {
              fields: [
                {
                  name: 'content',
                  type: 'richText',
                  editor: lexicalEditor({
                    features: ({ rootFeatures }) => {
                      return [
                        ...rootFeatures,
                        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                        BlocksFeature({ }),
                        FixedToolbarFeature(),
                        InlineToolbarFeature(),
                        HorizontalRuleFeature(),
                      ]
                    },
                  }),
                  label: false,
                  required: true,
                },
              ],
              label: 'Content',
            },
            {
              name: 'meta',
              label: 'SEO',
              fields: [
                OverviewField({
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.content',
                  imagePath: 'meta.image',
                }),
                MetaTitleField({
                  hasGenerateFn: true,
                }),
                MetaImageField({
                  hasGenerateFn: true,
                  relationTo: 'media',
                }),
    
                MetaDescriptionField({
                  hasGenerateFn: true,
                }),
                PreviewField({
                  // if the `generateUrl` function is configured
                  hasGenerateFn: true,
    
                  // field paths to match the target field for data
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.description',
                }),
              ],
            },
          ],
        },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            position: 'sidebar',
            
          },
          hooks: {
            beforeChange: [
              ({ siblingData, value }) => {
                if (siblingData._status === 'published' && !value) {
                  return new Date()
                }
                return value
              },
            ],
          },
        },
       
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
      required: true,
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
      ],
      
  hooks: {
    afterChange: [revalidateNew],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
      versions: {
        drafts: {
          autosave: {
            interval: 100, // We set this interval for optimal live preview
          },
          schedulePublish: true,
        },
        maxPerDoc: 50,
      },
}
