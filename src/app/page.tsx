
"use client"

import Dashboard from "@/components/Dashboard"
import { AuthPage } from "@/components/AuthPage"
import { useUser } from "@/firebase"
import { Loader2, ShieldCheck, Zap } from "lucide-react"

/**
 * @fileOverview Root Page component that acts as the primary security gateway.
 * It ensures that the first page a user sees is always the Login/Signup screen
 * unless they are already authenticated.
 */
export default function Home() {
  const { user, isUserLoading } = useUser()

  // Initial secure handshake state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        {/* Background Pulse Effect */}
        <div className="absolute inset-0 bg-radial-gradient from-[#07F1D6]/5 to-transparent animate-pulse" />
        
        <div className="relative z-10">
          <div className="relative h-24 w-24">
            <Loader2 className="h-24 w-24 animate-spin text-[#07F1D6] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-[#07F1D6] animate-pulse neon-text" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h3 className="text-2xl font-black tracking-widest text-[#07F1D6] neon-text uppercase italic">
            RESEARCH.<span className="text-white">AI</span>
          </h3>
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-3 w-3 text-[#07F1D6] fill-[#07F1D6]" />
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.5em] font-bold">
              Establishing Secure Link
            </p>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#07F1D6]/20 to-transparent" />
      </div>
    )
  }

  // FORCE: Show AuthPage if no user session is detected
  if (!user) {
    return <AuthPage />
  }

  // Only show Dashboard if identity is verified
  return (
    <main className="min-h-screen bg-[#070707]">
      <Dashboard />
    </main>
  )
}
