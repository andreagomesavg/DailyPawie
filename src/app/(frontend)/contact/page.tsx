import { Montserrat } from 'next/font/google';
import Link from 'next/link'
import React from 'react'



const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["200", "300", "400", "700", "800", "900"], 
    variable: "--font-montserrat",
  });
export default function page() {
  return (
    <div>
              <div  className='top-0 w-full h-full'>
        <div className='px-5 lg:px-[5.63rem] flex flex-col items-center mx-auto max-w-[600px] relative  pb-14' >
      <div className='flex flex-col items-center justify-center w-full text-left flex-nowrap'>
        <div className='relative w-full mt-0'>
          <div className={` text-center font-light z-20 relative max-w-[1440px]  ${montserrat.className}`}>
            <h1 className={`my-0 font-[800]  text-[31px] md:text-[58px]  leading-tight pt-[120px] md:pt-[130px] uppercase  ${montserrat.className}`}>Contact</h1>
          </div>
          <div className={`absolute text-[150px] font-black mt-0 md:mt-[51px] top-0 mb-[100px] md:mb-0 z-10 self-center text-[#ddf1ff] w-full text-center opacity-40  ${montserrat.className}`}>
            US
          </div>
        </div>
      </div>
    </div> 
      </div>
        <div className='grid justify-center w-full grid-cols-1 lg:grid-cols-2'>
    <div className='flex bg-[#ddf1ff] items-center justify-center flex-col min-h-[40vh]'>
    <div>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 512 512"
  className="w-[39px] h-[39px] pt-5 lg:pt-0 lg:w-[78px] lg:h-[78px]"
>
  <path fill="#FFFFFF" d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
</svg>
</div>
      <Link className='no-underline text-[var(--primary)] hover:opacity-70 text-[32px] lg:text-[48px] hover:cursor-pointer'
      href={"#"}
      >+34 123 14 18 17</Link>
      
    </div>
    <div className='flex flex-col justify-center items-center bg-[#001e4c] min-h-[40vh]'>
      <div>
      <svg xmlns="http://www.w3.org/2000/svg"  className="w-[39px] h-[39px] pt-5 lg:pt-0 lg:w-[78px] lg:h-[78px]" viewBox="0 0 512 512"><path fill="#FFFFFF" d="M255.4 48.2c.2-.1 .4-.2 .6-.2s.4 .1 .6 .2L460.6 194c2.1 1.5 3.4 3.9 3.4 6.5l0 13.6L291.5 355.7c-20.7 17-50.4 17-71.1 0L48 214.1l0-13.6c0-2.6 1.2-5 3.4-6.5L255.4 48.2zM48 276.2L190 392.8c38.4 31.5 93.7 31.5 132 0L464 276.2 464 456c0 4.4-3.6 8-8 8L56 464c-4.4 0-8-3.6-8-8l0-179.8zM256 0c-10.2 0-20.2 3.2-28.5 9.1L23.5 154.9C8.7 165.4 0 182.4 0 200.5L0 456c0 30.9 25.1 56 56 56l400 0c30.9 0 56-25.1 56-56l0-255.5c0-18.1-8.7-35.1-23.4-45.6L284.5 9.1C276.2 3.2 266.2 0 256 0z"/></svg>
      </div>
     <Link className='no-underline text-[var(--primary)] hover:opacity-70 text-[32px] lg:text-[48px] hover:cursor-pointer hover:border-b-4 hover:border-[var(--primary)] transition-all duration-300 ease-in-out' href={ ""} >dailypawie@gmail.com</Link>
    </div>
  </div>
    </div>
    
  )
}
