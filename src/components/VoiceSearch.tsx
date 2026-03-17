"use client"

import { useState } from "react"
import { Mic, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generativeVoiceSearch, type GenerativeVoiceSearchOutput } from "@/ai/flows/generative-voice-search"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function VoiceSearch({ onResult }: { onResult: (res: GenerativeVoiceSearchOutput) => void }) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const result = await generativeVoiceSearch({ query })
      onResult(result)
      toast({
        title: "Intelligence Search Complete",
        description: `Neural filters applied for: "${query}"`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not parse query via neural link. Try manual search.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        variant: "destructive",
        title: "Hardware Error",
        description: "Audio protocol not supported in this browser environment."
      })
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      toast({ title: "Listening...", description: "System is processing audio input" })
    }
    
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      // Auto trigger search
      setTimeout(() => handleSearch(), 200)
    }
    
    recognition.onerror = () => {
      setIsListening(false)
      toast({ variant: "destructive", title: "Audio Error", description: "Could not capture voice nodes." })
    }

    recognition.start()
  }

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-xl w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="System Search (e.g. 'Science students with score > 80')"
          className="pl-10 pr-12 bg-card/50 border-white/5 focus-visible:ring-primary h-12 rounded-xl transition-all font-medium text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all rounded-lg",
              isListening && "text-primary bg-primary/10 animate-pulse"
            )}
            onClick={startVoiceSearch}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </form>
  )
}
