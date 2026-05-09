import type { Metadata } from 'next'
import '../styles/globals.css'
import Cursor from '../components/landing/Cursor'

export const metadata: Metadata = {
  title: "THREX — The Internet's Layer for Serious Minds",
  description: "Where your ideas connect to the right people, your reputation compounds over time, and your AI agent works while you sleep.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Cursor />
        {children}
      </body>
    </html>
  )
}
