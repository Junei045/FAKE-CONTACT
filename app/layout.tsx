import type { Metadata, Viewport } from 'next'
import { Zen_Kaku_Gothic_New, Geist_Mono } from 'next/font/google'
import './globals.css'

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-zen-kaku',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'フェイク・コンタクト｜見抜く力を磨くSNS訓練シミュレーター',
  description:
    'SNSなりすまし詐欺を疑似体験で見抜く力を養う、スマホ向け没入型トレーニングゲーム。本物と偽物を見分ける7つのチェックポイントを実践的に学べます。',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1A1A2E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
