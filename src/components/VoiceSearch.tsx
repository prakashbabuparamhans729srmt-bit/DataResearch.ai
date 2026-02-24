"use client"

import { useState } from "react"
import { Mic, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generativeVoiceSearch, type GenerativeVoiceSearchOutput } from "@/ai/flows/generative-voice-search"
import { useToast } from "@/hooks/use-toast"

export function VoiceSearch({ onResult }: { onResult: (res: GenerativeVoiceSearchOutput) => void }) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const result = await generativeVoiceSearch({ query })
      onResult(result)
      toast({
        title: "Search successful",
        description: `Applied filters based on: "${query}"`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Could not process your query. Please try again.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search students (e.g. 'high scores in Science')"
          className="pl-10 pr-12 bg-card/50 border-white/5 focus-visible:ring-primary h-10 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/20 text-muted-foreground hover:text-primary"
          onClick={() => {
            // Mocking voice recognition trigger
            setQuery("students with score > 90 in Science")
            toast({ title: "Listening...", description: "Voice input active" })
          }}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}