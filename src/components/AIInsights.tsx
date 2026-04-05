
"use client"

import { useState } from "react"
import { Sparkles, Loader2, ChevronRight, AlertTriangle, TrendingUp, Trophy, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeStudentDataInsights, type AIDataInsightsSummarizationOutput } from "@/ai/flows/ai-data-insights-summarization"
import { type Student } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export function AIInsights({ students }: { students: Student[] }) {
  const [insights, setInsights] = useState<AIDataInsightsSummarizationOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateInsights = async () => {
    setIsLoading(true)
    try {
      const result = await summarizeStudentDataInsights({ students })
      setInsights(result)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!insights ? (
        <Card className="glass-card border-dashed border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Generate A to Z Intelligence Summary</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Decrypt performance trends, identity top research nodes, and identify critical intervention protocols.
              </p>
            </div>
            <Button onClick={generateInsights} disabled={isLoading} className="gradient-border neon-glow h-12 px-8 uppercase font-bold tracking-widest text-[10px]">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Initiate Neural Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-bold tracking-widest uppercase">System Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {insights.summary.overallTrends}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Trophy className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-sm font-bold tracking-widest uppercase">Elite Nodes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.summary.topPerformers?.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{p.performanceMetric}</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {p.value}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-sm font-bold tracking-widest uppercase">Intervention Protocols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.summary.areasForIntervention?.map((area, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">{area.category}</p>
                      <Badge variant="outline" className="text-[9px] h-4 border-amber-500/20">
                        {area.studentCount} NODES
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">{area.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setInsights(null)} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground">
            Reset Neural Insights
          </Button>
        </div>
      )}
    </div>
  )
}
