
"use client"

import { useState } from "react"
import { ShieldCheck, Mail, Lock, UserPlus, LogIn, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirebase, initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase"
import { useToast } from "@/hooks/use-toast"

export function AuthPage() {
  const { auth } = useFirebase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setIsLoading(true)
    try {
      initiateEmailSignIn(auth, email, password)
      toast({ title: "Connecting...", description: "Verifying your research credentials." })
    } catch (error) {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setIsLoading(true)
    try {
      initiateEmailSignUp(auth, email, password)
      toast({ title: "Registering...", description: "Creating your admin profile." })
    } catch (error) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to create account." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    if (!auth) return
    initiateAnonymousSignIn(auth)
    toast({ title: "Guest Access", description: "Entering system with restricted protocols." })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#07F1D6]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#07F1D6]/5 blur-[100px] rounded-full" />

      <Card className="w-full max-w-[450px] glass-card border-white/5 relative z-10 animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-[#07F1D6] h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shadow-[#07F1D6]/30 neon-glow">
            <ShieldCheck className="text-black h-10 w-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter uppercase text-white">
              RESEARCH.<span className="text-[#07F1D6] neon-text">AI</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.3em] font-bold">
              Secure Intelligence Access | A to Z
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#07F1D6] data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#07F1D6] data-[state=active]:text-black font-bold uppercase text-[10px] tracking-widest">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Contact Node (Email)</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@research.ai" 
                    className="bg-white/5 border-white/10 focus-visible:ring-[#07F1D6]" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Access Key (Password)</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-white/5 border-white/10 focus-visible:ring-[#07F1D6]" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-[#07F1D6] text-black hover:bg-[#07F1D6]/80 font-bold uppercase tracking-widest py-6">
                  {isLoading ? "Authenticating..." : "Initiate Login"}
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">New Node Email</Label>
                  <Input 
                    type="email" 
                    placeholder="yourname@research.ai" 
                    className="bg-white/5 border-white/10 focus-visible:ring-[#07F1D6]" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Security Protocol Key</Label>
                  <Input 
                    type="password" 
                    placeholder="Create Password" 
                    className="bg-white/5 border-white/10 focus-visible:ring-[#07F1D6]" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-white/80 font-bold uppercase tracking-widest py-6">
                  {isLoading ? "Provisioning..." : "Register Account"}
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#070707] px-4 text-muted-foreground">Alternative Protocols</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" onClick={handleGuestMode} className="border-white/10 hover:bg-white/5 text-muted-foreground font-bold uppercase tracking-widest text-[10px] h-12">
              <ArrowRight className="mr-2 h-4 w-4" />
              Enter via Guest Protocol (Read-Only)
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-8">
          <p className="text-[9px] text-center text-muted-foreground/40 uppercase tracking-[0.2em] px-8">
            A to Z System is protected by encryption layer omega. All unauthorized access attempts are logged.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
