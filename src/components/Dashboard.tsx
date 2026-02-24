
"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Upload, 
  Filter, 
  MoreVertical,
  Bell,
  Search,
  LayoutDashboard,
  Target,
  Zap,
  TrendingUp,
  Trophy
} from "lucide-react"
import { generateMockStudents, type Student } from "@/lib/mock-data"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StudentTable } from "./StudentTable"
import { PerformanceTrend } from "./PerformanceChart"
import { VoiceSearch } from "./VoiceSearch"
import { AIInsights } from "./AIInsights"
import { StudentAvatar } from "./StudentAvatar"
import { type GenerativeVoiceSearchOutput } from "@/ai/flows/generative-voice-search"

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, current: true },
  { name: 'Students', icon: Users, current: false },
  { name: 'Analysis', icon: BarChart3, current: false },
  { name: 'Reports', icon: FileText, current: false },
  { name: 'Settings', icon: Settings, current: false },
]

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [filters, setFilters] = useState<GenerativeVoiceSearchOutput>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Generate mock students only on the client to avoid hydration mismatch
    // (Math.random in generateMockStudents produces different values on server vs client)
    setStudents(generateMockStudents(100))
  }, [])

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (filters.gender && student.gender !== filters.gender) return false
      if (filters.academicTags && filters.academicTags.length > 0) {
        const hasTag = filters.academicTags.some(tag => student.tags.includes(tag))
        if (!hasTag) return false
      }
      if (filters.minScore !== undefined && student.averageScorePercentage < filters.minScore) return false
      if (filters.maxScore !== undefined && student.averageScorePercentage > filters.maxScore) return false
      if (filters.keyword && !student.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false
      if (searchQuery && !student.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [students, filters, searchQuery])

  const stats = useMemo(() => ({
    attendance: Math.round(filteredStudents.reduce((acc, s) => acc + s.attendancePercentage, 0) / (filteredStudents.length || 1)),
    avgScore: (filteredStudents.reduce((acc, s) => acc + s.averageScorePercentage, 0) / (filteredStudents.length || 1)).toFixed(1),
    completion: Math.round(filteredStudents.reduce((acc, s) => acc + s.completionPercentage, 0) / (filteredStudents.length || 1)),
    activeCount: filteredStudents.filter(s => s.status === 'Active').length
  }), [filteredStudents])

  const topPerformers = useMemo(() => [...filteredStudents].sort((a, b) => b.averageScorePercentage - a.averageScorePercentage).slice(0, 5), [filteredStudents])

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="glass-card border-r border-white/5">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Target className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">DataResearch.ai</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        isActive={item.current} 
                        className={item.current ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Quick Filters</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Department</p>
                    <div className="flex flex-wrap gap-1">
                      {['Science', 'Arts', 'Commerce'].map(tag => (
                        <Badge 
                          key={tag} 
                          variant={filters.academicTags?.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer text-[10px] hover:bg-primary/20"
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            academicTags: prev.academicTags?.includes(tag) 
                              ? prev.academicTags.filter(t => t !== tag) 
                              : [...(prev.academicTags || []), tag]
                          }))}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Gender</p>
                    <div className="flex gap-1">
                      {['Male', 'Female'].map(g => (
                        <Badge 
                          key={g} 
                          variant={filters.gender === g ? "default" : "outline"}
                          className="cursor-pointer text-[10px] hover:bg-primary/20"
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            gender: prev.gender === g ? undefined : g as any
                          }))}
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-muted-foreground mt-4 h-8"
                    onClick={() => setFilters({})}
                  >
                    Clear All
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
              <StudentAvatar name="Admin User" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">Dr. Smith</span>
                <span className="text-[10px] text-muted-foreground">Analyst</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 glass-card border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              <VoiceSearch onResult={(res) => setFilters(res)} />
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
              </Button>
              <Button className="gradient-border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload Data</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Real-Time Analytics</h2>
                <p className="text-muted-foreground text-sm">Monitoring {filteredStudents.length} students in real-time.</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
                  {stats.activeCount} Active Now
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Attendance', value: `${stats.attendance}%`, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Completion', value: `${stats.completion}%`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Top Rank', value: '#3', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              ].map((stat) => (
                <Card key={stat.label} className="glass-card hover:translate-y-[-2px] transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PerformanceTrend />
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topPerformers.map((student) => (
                    <div key={student.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={student.name} className="h-9 w-9" />
                        <div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.tags[0]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{student.averageScorePercentage}%</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <div key={star} className={`h-1.5 w-1.5 rounded-full ${star <= 4 ? 'bg-amber-400' : 'bg-white/10'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full text-xs mt-2 text-muted-foreground hover:text-primary">
                    View All Rankings
                  </Button>
                </CardContent>
              </Card>
            </div>

            <AIInsights students={filteredStudents.slice(0, 20)} />

            <StudentTable students={filteredStudents} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
