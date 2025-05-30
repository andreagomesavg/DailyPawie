import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { generateMeta } from '@/utilities/generateMeta'

import { League_Spartan } from "next/font/google";
import { PayloadRedirects } from '@/components/ui/payload/PayloadRedirects'
import { LivePreviewListener } from '@/components/ui/LivePreviewListener'
import RichText from '@/components/ui/RichText'

  const leagueSpartan = League_Spartan({
    subsets: ["latin"],
    weight: ["400", "700", "900"], 
    variable: "--font-spartan"
  });


export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const news = await payload.find({
    collection: 'news',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = news.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getUTCDate()} ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
};
export default async function New({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/news/' + slug
  const newPost = await queryNewBySlug({ slug })

  if (!newPost) return <PayloadRedirects url={url} />

  return (
    <div className='w-full p-0 m-0 max-w-screen'>
       <section className="px-5 py-16 max-w-[1200px] mx-auto">

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />} 
      <div className='container mx-auto'>
        <h4 className={`text-left font-normal my-0 py-0   ${leagueSpartan.className}`}>{formatDate(newPost.publishedAt)}</h4>
          <h1 className={` ${leagueSpartan.className}`}>{newPost.title}</h1>  
      <div className='w-full px-4 overflow-hidden'>
            <RichText className="w-full max-w-full" data={newPost.content} enableGutter={false} />
        </div> 
        
      </div>
     
    </section>
     <div className='bg-[#def1ff] w-full m-0 p-0 mx-auto items-start justify-center gap-[30px] flex' style={{paddingTop: 'clamp(3rem,3vw + 1.2rem,6rem)', paddingBottom: 'clamp(3rem,3vw + 1.2rem,6rem)'}}>
      <div className='px-5 w-full max-w-[1360px] '>
        <div className='w-full'>
            <h4  className={`text-left font-extrabold my-0 pb-[15px] uppercase w-full text-black  ${leagueSpartan.className}`}>You might also be interested in...</h4>
          </div>
          <div className='pb-5 border-t-2 border-black'></div>
      </div> 
        </div>
    </div>
   
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const newPost = await queryNewBySlug({ slug })

  return generateMeta({ doc: newPost })
}

const queryNewBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'news',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
 
  return result.docs?.[0] || null
})
