"use client"

import { useState } from "react"
import { Sparkles, Loader2, ChevronRight, AlertTriangle, TrendingUp, Trophy } from "lucide-react"
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
              <h3 className="text-lg font-semibold">Generate AI Analytics Summary</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Get deep insights into performance trends, top performers, and critical intervention areas.
              </p>
            </div>
            <Button onClick={generateInsights} disabled={isLoading} className="gradient-border">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analyze Data with AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-md">Overall Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.summary.overallTrends}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Trophy className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-md">Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.summary.topPerformers?.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.performanceMetric}</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                      {p.value}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-md">Interventions Needed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.summary.areasForIntervention?.map((area, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-500">{area.category}</p>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {area.studentCount} students
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{area.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setInsights(null)} className="text-muted-foreground hover:text-foreground">
            Clear Insights
          </Button>
        </div>
      )}
    </div>
  )
}