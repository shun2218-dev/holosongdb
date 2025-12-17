import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { InstallPrompt } from "@/components/install-prompt"
import { PWAWrapper } from "@/components/pwa-wrapper"
import { DynamicHeader } from "@/components/dynamic-header"
import { SiteFooter } from "@/components/site-footer"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "HoloSong DB | ホロライブ楽曲データベース",
  description:
    "HoloSong DBは、ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイトです。タレント名、曲名、作詞作曲者など、様々な条件であなたの好きな一曲を見つけよう！",
  generator: "v0.app",
  manifest: "/manifest.json",
  verification: {
    google: "Q07EXCDVuV7zVPUiniVNCtfa5K92c2TDDfoGJ_fB__0",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HoloSong DB",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "HoloSong DB | ホロライブ楽曲データベース",
    description:
      "HoloSong DBは、ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイトです。タレント名、曲名、作詞作曲者など、様々な条件であなたの好きな一曲を見つけよう！",
    type: "website",
    url: "https://www.holosongdb.com",
    siteName: "HoloSong DB",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HoloSong DB - ホロライブ楽曲データベース",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HoloSong DB | ホロライブ楽曲データベース",
    description:
      "HoloSong DBは、ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイトです。タレント名、曲名、作詞作曲者など、様々な条件であなたの好きな一曲を見つけよう！",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icons/icon-192x192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "HoloSong DB",
    "application-name": "HoloSong DB",
    "msapplication-TileColor": "#27C7FF",
    "theme-color": "#27C7FF",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HoloSong DB" />
        <meta name="theme-color" content="#27C7FF" />
        <meta name="google-site-verification" content="Q07EXCDVuV7zVPUiniVNCtfa5K92c2TDDfoGJ_fB__0" />
      </head>
      <body className="font-sans">
        <DynamicHeader />
        <PWAWrapper>
          <Suspense fallback={null}>{children}</Suspense>
        </PWAWrapper>
        <SiteFooter />
        <InstallPrompt />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('[App] SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('[App] SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
