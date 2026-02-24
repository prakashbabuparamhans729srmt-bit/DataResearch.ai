
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function StudentAvatar({ name, status, className }: { name: string, status?: 'Active' | 'Idle', className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  const seed = encodeURIComponent(name)
  
  // Reference centralized placeholder pattern
  const avatarTemplate = PlaceHolderImages.find(img => img.id === "student-avatar-template")
  const imageUrl = avatarTemplate 
    ? avatarTemplate.imageUrl.replace("{seed}", seed)
    : `https://picsum.photos/seed/${seed}/100/100`
  const hint = avatarTemplate?.imageHint || "student avatar"

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className="h-full w-full border-2 border-primary/20">
        <AvatarImage 
          src={imageUrl} 
          alt={name}
          data-ai-hint={hint}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
      </Avatar>
      {status && (
        <span className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
          status === 'Active' ? "bg-emerald-500" : "bg-slate-400"
        )} />
      )}
    </div>
  )
}
