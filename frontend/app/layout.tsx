import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SystemControlsProvider } from '@/components/SystemControlsProvider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Career Automate - AI Powered Job Finder',
  description: 'Automate your job search with AI-powered resume generation, project descriptions, and smart job matching.',
  generator: 'CareerAutomate',
  icons: {
    icon: 'https://i.postimg.cc/X7XGRVQb/CA_logo_sq.jpg',
    shortcut: 'https://i.postimg.cc/X7XGRVQb/CA_logo_sq.jpg',
    apple: 'https://i.postimg.cc/X7XGRVQb/CA_logo_sq.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SystemControlsProvider>
          {children}
        </SystemControlsProvider>
        <Analytics />
      </body>
    </html>
  )
}

