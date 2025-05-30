import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import dogimage from '@/assets/HomeDogImage.png'
import config from '@/payload.config'
import './styles.css'
import Head from 'next/head'
import Link from 'next/link'
import dogCat from '@/assets/DOGOANDCAT.png'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowRight, Calendar,  } from 'lucide-react'
import {  Montserrat, } from 'next/font/google';

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["200", "300", "400", "700", "800", "900"], 
    variable: "--font-spartan"
  });

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  // Remove unused variables or prefix with underscore if needed for future use
  const { user: _user } = await payload.auth({ headers })
  // const _fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="bg-blue-100 ">
    <Head>
      <title>DailyPawie</title>
    </Head>

    <main className="flex items-center justify-center w-full">
      <div className="grid justify-center w-full grid-cols-1 md:grid-cols-2 ">
       <div className='w-full mx-auto bg-[#e2f1f9]'>
        <div className='grid justify-center grid-cols-1 bg-[#3479ba]'>
          <h1 className='pt-[clamp(3rem,3vw+1.2rem,6rem)] font-bold leading-none text-center text-white 
          text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight'>Look up at <br></br>your basic pet info&apos;s</h1>
          <Image
          src={dogimage}
          alt="Dog image"
          width={500}
          height={500}
          className='mx-auto'
          />
        </div>
        <div className='flex flex-col bg-[#e2f1f9] justify-center pt-28 -mt-[110px] pb-[clamp(3rem,3vw+1.2rem,6rem)]'>
            <h1 className='text-[#001e4c] pt-2  font-bold leading-none text-center 
          text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight'>Recommendations</h1>
            <Link href='/news' className="z-20 mx-auto">
                <button className={`z-10 px-6  py-2  mt-2 rounded-md font-normal text-lg 
                     text-white bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#def1ff] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer `}>
                  Read more
                </button>
              </Link>
           
        </div>
       </div>
       
       <div className='bg-[#f4f6f5]  w-full'>
        <div className='max-w-[3000px] px-[clamp(1rem,5vw,8rem)] mx-auto'>
        <div className="z-10 w-full p-2 px-5 pb-28 sm:p-6 md:p-8 ">
     <h1 className='text-[#001e4c] pt-2  font-bold leading-none text-left 
          text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight'>Pet Care <br></br> Reminders</h1>
            <h3 className='pb-2'>To keep your pet healthy and happy</h3> 
              <Link href='/sign-up' className="z-20 mx-auto">
                <button className={`z-10 px-8  py-1  mt-2 rounded-md font-normal text-lg 
                     text-white bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer `}>
                  Get Started
                </button>
              </Link>
        </div>
        <div className="relative h-full pt-6 md:pt-40 ">
          
            <div className="absolute bottom-0 right-0 sm:mr-0 ">
              <Image
                src={dogCat}
                alt="Principal Image"
                width={500}
                height={400}
                priority
                className="w-auto h-auto max-h-full md:h-auto md:w-[24rem]"
              />
            </div>
         
        </div>
      </div> 
       <div className='grid gap-6 px-5 py-5 lg:grid-cols-1 xl:grid-cols-3 lg:gap-8 max-w-[1000px] mx-auto items-stretch'>
          <Link href="/login" className="block h-full">
            <Card className="grid grid-rows-[auto_auto_1fr_auto] pt-0 max-w-[300px] mx-auto border-none bg-white cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg h-full">
              <div className="aspect-[16/9] w-full bg-[#d7ebf7] rounded-t-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"  width="80"
                height="80"><path fill="#FFFFFF" d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z"/></svg>
              </div>
              <CardHeader>
                <h3 className={`text-[20px] font-semibold text-md ${montserrat.className}`}>
                  Improve Pet&apos;s Quality Life
                </h3>
              </CardHeader>
              <CardContent>
                <p className="leading-none text-muted-foreground">Track routines and build healthy habits for happier, healthier pets.</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-foreground">
                  Read more
                  <ArrowRight className="ml-2 size-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>

          <Link href="/login" className="block h-full">
            <Card className="grid grid-rows-[auto_auto_1fr_auto] pt-0 max-w-[300px] mx-auto border-none bg-white cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg h-full">
              <div className="aspect-[16/9] w-full bg-[#3576bb] rounded-t-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"  width="80"
                height="80"><path fill="#FFFFFF" d="M142.4 21.9c5.6 16.8-3.5 34.9-20.2 40.5L96 71.1 96 192c0 53 43 96 96 96s96-43 96-96l0-120.9-26.1-8.7c-16.8-5.6-25.8-23.7-20.2-40.5s23.7-25.8 40.5-20.2l26.1 8.7C334.4 19.1 352 43.5 352 71.1L352 192c0 77.2-54.6 141.6-127.3 156.7C231 404.6 278.4 448 336 448c61.9 0 112-50.1 112-112l0-70.7c-28.3-12.3-48-40.5-48-73.3c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3l0 70.7c0 97.2-78.8 176-176 176c-92.9 0-168.9-71.9-175.5-163.1C87.2 334.2 32 269.6 32 192L32 71.1c0-27.5 17.6-52 43.8-60.7l26.1-8.7c16.8-5.6 34.9 3.5 40.5 20.2zM480 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
              </div>
              <CardHeader>
                <h3 className={`text-lg font-semibold ${montserrat.className}`}>
                  Never Miss a Vet Visit Again
                </h3>
              </CardHeader>
              <CardContent>
                <p className="leading-none text-muted-foreground">Set reminders for check-ups, vaccines, and treatments—on time, every time.</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-foreground">
                  Read more
                  <ArrowRight className="ml-2 size-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>

          <Link href="/login" className="block h-full">
            <Card className="grid grid-rows-[auto_auto_1fr_auto] pt-0 max-w-[300px] mx-auto border-none bg-white cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg h-full">
              <div className="aspect-[16/9] w-full rounded-t-lg flex items-center justify-center bg-[#001e4c]">
                <Calendar width="80" height="80" color='#ffffff'/>
              </div>
              <CardHeader>
                <h3 className={`text-lg font-semibold ${montserrat.className}`}>
                  All Your Pet Info, Always at Hand
                </h3>
              </CardHeader>
              <CardContent>
                <p className="leading-none text-muted-foreground">Access and share your pet&apos;s data anytime, from anywhere.</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-foreground">
                  Read more
                  <ArrowRight className="ml-2 size-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </div>
     
        </div>
       </div>
      
    </main>

    <footer className="p-4 text-center text-white bg-[#3377b8] py-6">
      <p>Because every paw deserves care, love, and a little tech.</p>
    </footer>
  </div>
  )
}