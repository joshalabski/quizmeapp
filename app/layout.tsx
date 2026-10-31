import { Analytics } from '@vercel/analytics/next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
import './globals.css'

export const metadata: Metadata = {
  title: 'QuizMe — Study smarter',
  description: 'Turn your notes into focused quiz sessions and remember more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#080b16',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
