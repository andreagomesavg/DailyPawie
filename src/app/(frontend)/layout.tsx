import React from 'react'
import '@/styles/payloadStyles.css' // Your CSS file already has the Google Fonts import
import { Navbar } from '../blocks/navbar'
import Footer from '../blocks/footer'

export const metadata = {
  description: 'DailyPawie platform is a space for sharing and discovering the latest trends in technology, design, and innovation. Join us to explore insightful articles, tutorials, and resources that inspire creativity and foster learning.',
  title: 'DailyPawie',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar/>
        <main>{children}</main>
        <Footer/>
      </body>
    </html>
  )
}