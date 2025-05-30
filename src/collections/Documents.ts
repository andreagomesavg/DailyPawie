import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
    slug: 'documents',
    access: {
      read: authenticated,
      create: ({ req }) => req.user && req.user.roles === 'petOwner' || 'admin' ? true:false,
      delete: ({ req }) => req.user && req.user.roles === 'petOwner' || 'admin' ? true:false,
      update: ({ req }) => req.user && req.user.roles === 'petOwner' || 'admin' ? true:false,
    },
    admin: {
      group: 'General'
    },
    upload: {
        staticDir: 'uploads/docs', 
       
    },
    fields: [
        {
          name: 'title',
          type: 'text',
          
        },
      ],
}