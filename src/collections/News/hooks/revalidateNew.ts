import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { News } from '../../../payload-types'

export const revalidateNew: CollectionAfterChangeHook<News> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/news/${doc.slug}`

      payload.logger.info(`Revalidating new at path: ${path}`)

      revalidatePath(path)
      revalidateTag('news-sitemap')
    }

    // If the new was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/news/${previousDoc.slug}`

      payload.logger.info(`Revalidating old new at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('news-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<News> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/news/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('news-sitemap')
  }

  return doc
}
