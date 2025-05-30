import React from 'react'
import Link from 'next/link';
import CustomIcons from '@/components/ui/customMediaIcons';

const getCurrentYear = () => new Date().getFullYear();

export default function Footer() {
  return (
      <footer className="w-full bg-[#eaeaea]/30 overflow-hidden">
        <div className="py-[60px] px-5 flex flex-col items-center lg:items-start mx-auto h-full justify-center" style={{ paddingBottom: "clamp(3rem, 3vw + 1.2rem, 6rem)" }}>
          <div className="flex flex-col items-center justify-center w-full lg:items-start lg:flex-row">
           
            <div className="flex flex-col items-center lg:items-start justify-center w-[240px] max-w-full p-5 lg:w-1/3">
              <h1 className="text-[55px] font-semibold font-league-spartan">DAILYPAWIE</h1>
              <p className="m-0 text-[#001e4c] font-league-spartan">Pet control platform</p>
            </div>
            
            <div className="flex flex-col items-center lg:w-1/3 p-5 text-center w-full">
              {/* Use Bitter font - now available */}
              <h2 className="max-w-[1000px] mb-[10px] text-center leading-normal text-[var(--primary)] font-light font-bitter" 
                  style={{ fontSize: "clamp(1rem, 2vw + .8rem, 2.5rem)" }}>
                  Get informed!
              </h2>
              <div className="flex flex-col flex-wrap">
                <Link href="/news" className='text-[#001e4c] no-underline hover:opacity-80 font-league-spartan'>All pets info</Link>
                <Link href="/news" className='no-underline text-[#001e4c] hover:opacity-80 font-league-spartan'>Start your own way</Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-[240px] p-5 lg:w-1/3">
              {/* Use Bitter font - now available */}
              <h2 className="max-w-[1000px] mb-[20px] text-center leading-normal text-[var(--primary)] font-light whitespace-nowrap font-bitter "
                  style={{ fontSize: "clamp(1rem, 2vw + .8rem, 2.5rem)" }}>
                Follow us on:
              </h2>
              <div className="flex items-baseline justify-center space-x-4">
                <CustomIcons.FacebookIcon className="w-10 h-10 text-[#001e4c] hover:opacity-80 hover:cursor-pointer" />
                <CustomIcons.InstagramIcon className="w-10 h-10 text-[#001e4c] hover:opacity-80 hover:cursor-pointer" />
                <CustomIcons.LinkedInIcon className="w-10 h-10 text-[#001e4c] hover:opacity-80 hover:cursor-pointer" />
                <CustomIcons.TikTokIcon className="w-10 h-10 text-[#001e4c] hover:opacity-80 hover:cursor-pointer " />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[var(--primary)] text-center py-2.5">
          <p className="text-white font-normal text-sm mx-auto px-4 font-league-spartan">
              Copyright {getCurrentYear()} © DailyPawie. Designed and developed by AndreaVGomes.
          </p>
        </div>
      </footer>
  )
}