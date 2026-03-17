"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Mic, Loader2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { chatHelper } from "@/ai/flows/chatbot-flow"
import { cn } from "@/lib/utils"

type Message = {
  role: 'user' | 'model'
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Namaste! I am your AI Assistant. How can I help you navigate DataResearch.ai today?' }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const result = await chatHelper({ message: userMessage })
      setMessages(prev => [...prev, { role: 'model', content: result.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I encountered a neural sync error. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.")
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN' // Supports Hindi or multi
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
    recognition.start()
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 bg-primary text-primary-foreground hover:scale-110 transition-transform duration-300 neon-glow",
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[550px] glass-card z-50 flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500 border-primary/20 overflow-hidden">
          <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-bold tracking-widest uppercase">Research Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-black/20 text-white">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-hidden bg-black/40">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex gap-2", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                      m.role === 'user' ? "bg-white/10 border-white/20" : "bg-primary/10 border-primary/40"
                    )}>
                      {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-xs leading-relaxed max-w-[80%]",
                      m.role === 'user' ? "bg-primary text-black font-medium rounded-tr-none" : "bg-white/5 text-white border border-white/5 rounded-tl-none"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce delay-150" />
                        <span className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 bg-black/60 border-t border-white/5 gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn("h-10 w-10 shrink-0 border-white/10 hover:text-primary", isListening && "bg-primary/20 text-primary border-primary animate-pulse")}
              onClick={startListening}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="bg-white/5 border-white/10 text-xs h-10 focus-visible:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-10 w-10 bg-primary text-black hover:bg-primary/80 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
