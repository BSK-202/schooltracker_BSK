import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
// <CHANGE> Ajout de la sidebar au layout principal
import { AdminSidebar } from "@/components/admin-sidebar"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "TransRoute Admin",
  description: "Système de gestion de transport scolaire",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-secondary/30">
        {/* <CHANGE> Structure flex avec sidebar fixe et contenu scrollable */}
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
