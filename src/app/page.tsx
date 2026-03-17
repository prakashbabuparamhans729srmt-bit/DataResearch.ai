
"use client"

import Dashboard from "@/components/Dashboard"
import { AuthPage } from "@/components/AuthPage"
import { useUser } from "@/firebase"
import { Loader2, ShieldCheck } from "lucide-react"

export default function Home() {
  const { user, isUserLoading } = useUser()

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-[#07F1D6]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#07F1D6] neon-text" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold tracking-widest text-[#07F1D6] neon-text uppercase">Verifying Identity</h3>
          <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest">Secure Handshake in progress...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in, show AuthPage
  if (!user) {
    return <AuthPage />
  }

  // If logged in, show Dashboard
  return (
    <main className="min-h-screen">
      <Dashboard />
    </main>
  )
}
