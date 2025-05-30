import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from 'next/image'

import { Montserrat } from 'next/font/google';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

 
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "700", "800", "900"], 
  variable: "--font-spartan"
});

// Define the type for searchParams as a Promise
type SearchParamsType = Promise<{
  page?: string
}>

export default async function Page({ 
  searchParams 
}: { 
  searchParams: SearchParamsType 
}) {
  // Await the searchParams Promise
  const params = await searchParams
  const page = parseInt(params?.page || '1', 10)
  const payload = await getPayload({ config: configPromise })

  const news = await payload.find({
    collection: 'news',
    depth: 2,
    limit: 10,
    page,
    overrideAccess: false,
  })
  const totalPages = news.totalPages

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getUTCDate()} ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  };
  
  return (
    <section className="pb-32">
      <div className='top-0 w-full h-full'>
        <div className='px-5 lg:px-[5.63rem] flex flex-col items-center mx-auto max-w-[600px] relative mb-0 pb-0' >
          <div className='flex flex-col items-center justify-center w-full text-left flex-nowrap'>
            <div className='relative w-full mt-0'>
              <div className={`text-center font-light z-20 relative max-w-[1440px] ${montserrat.className}`}>
                <h1 className={`my-0 font-[800] text-[31px] md:text-[58px] leading-tight pt-[120px] md:pt-[130px] uppercase ${montserrat.className}`}>News</h1>
              </div>
              <div className={`absolute hidden lg:block text-[150px] font-black mt-0 md:mt-[51px] top-0 mb-[100px] md:mb-0 z-10 self-center text-[#ddf1ff] w-full text-center opacity-70 pr-2 ${montserrat.className}`}>
                NEWS
              </div>
            </div>
          </div>
        </div> 
      </div>
       
    
      <div className={`flex items-start text-[16px] text-center font-normal z-20 relative pt-[50px] md:pt-10 px-5 lg:px-[100px] xl:px-[250px] pb-16 ${montserrat.className}`}>
        <p className='max-w-3xl leading-[1.6] text-[#404040] mx-auto border-t border-[#3479ba] pt-4'>Welcome to our news and blog section — your source for thought-provoking insights, important updates, and stories that matter. From political developments and party initiatives to behind-the-scenes looks and informative articles, we keep you connected with what&apos;s happening and why it counts.</p>
      </div> 
  
      <div className={`container flex flex-col items-center gap-16 mx-auto max-w-[1200px] ${montserrat.className}`}>
        <div className="grid px-5 gap-y-10 sm:grid-cols-12 sm:gap-y-12 md:gap-y-16 lg:gap-y-20">
          {news.docs.map((newPost) => (
            <Card
              key={newPost.id}
              className="order-last bg-transparent border-0 shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <h3 className="font-semibold no-underline">
                    <a
                      href={`/news/${newPost.slug}` || ""}
                      target="_blank"
                      className={`text-[var(--primary)] no-underline hover:underline font-semibold ${montserrat.className}`} 
                    >
                      {newPost.title}
                    </a>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">
                    
                  </p> 
                  <div className="flex items-center mt-6 space-x-4 text-xl md:mt-8">
                  
                    <span className="text-muted-foreground">
                      {formatDate(newPost.publishedAt)}
                    </span>
                  </div>
                  <div className="flex items-center mt-6 space-x-2 md:mt-8">
                    <a
                      href={`/news/${newPost.slug}` || ""}
                      target="_blank"
                      className="inline-flex items-center text-[var(--primary)] no-underline hover:underline font-semibold text-base"
                    >
                      <span>Read More</span>
                      <ArrowRight className="ml-2 transition-transform size-4" />
                    </a>
                  </div>
                </div>
                <div className="order-first sm:order-last sm:col-span-5">
                  {typeof newPost.image !== 'number' && newPost.image?.url && (
                    <a href={`/news/${newPost.slug}` || ""} target="_blank" className="block">
                      <div className="aspect-[16/9] overflow-clip rounded-lg border border-gray-200 relative">
                        <Image
                          src={newPost.image.url || ""}
                          alt={newPost.title}
                          fill={true}
                          className="object-cover w-full h-full transition-opacity duration-200 fade-in hover:opacity-70"
                        />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Pagination className='pb-8 mx-auto'>
          <PaginationContent className={`mx-auto p-0 ${montserrat.className}`}>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${page - 1}`} className='no-underline' />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`?page=${i + 1}`} isActive={i + 1 === page} className='no-underline'>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${page + 1}`} className='no-underline' />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  )
}

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: SearchParamsType 
}): Promise<Metadata> {
  const params = await searchParams
  const page = parseInt(params?.page || '1', 10)
  
  const title = page > 1 
    ? `DailyPawie News - Page ${page}`
    : 'DailyPawie News'
    
  return {
    title,
    description: 'Latest news and updates about pet care and DailyPawie platform'
  }
}