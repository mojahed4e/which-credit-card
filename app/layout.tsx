import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RAQM – Which Card?",
  applicationName: "RAQM Card Advisor",
  description:
    "Find the best UAE credit card for your next purchase. Compare ADCB 365, Emirates Islamic SWITCH, Ajman ULTRACASH, SIB Cashback, DIB Wala'a, and Citi Premier.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RAQM Card",
  },
  icons: {
    icon: [
      {
        url: "/icons/raqm-card-192.jpg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/raqm-card-512.jpg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/raqm-card-apple-180.jpg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
