
"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Upload, 
  MoreVertical,
  Bell,
  LayoutDashboard,
  Target,
  Zap,
  TrendingUp,
  Trophy,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  Save,
  Database
} from "lucide-react"
import { generateMockStudents, type Student } from "@/lib/mock-data"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { StudentTable } from "./StudentTable"
import { PerformanceTrend } from "./PerformanceChart"
import { VoiceSearch } from "./VoiceSearch"
import { AIInsights } from "./AIInsights"
import { StudentAvatar } from "./StudentAvatar"
import { Chatbot } from "./Chatbot"
import { type GenerativeVoiceSearchOutput } from "@/ai/flows/generative-voice-search"
import { useCollection, useFirebase, useMemoFirebase, setDocumentNonBlocking, useDoc, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const navigation = [
  { id: 'dashboard', name: 'Operational Hub', icon: LayoutDashboard },
  { id: 'students', name: 'Student Records', icon: Users },
  { id: 'analysis', name: 'Intelligence Unit', icon: BarChart3 },
  { id: 'reports', name: 'Archive Vault', icon: FileText },
  { id: 'settings', name: 'Control Panel', icon: Settings },
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { firestore: db, user: currentUser, isUserLoading: loadingAuth } = useFirebase();

  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState<GenerativeVoiceSearchOutput>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  
  // Settings States
  const [autoSync, setAutoSync] = useState(true)
  const [neuralInsights, setNeuralInsights] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  const { toast } = useToast()

  // Register User as Admin or Update Last Seen
  useEffect(() => {
    if (currentUser && db) {
      const adminRef = doc(db, "admin_users", currentUser.uid);
      setDocumentNonBlocking(adminRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Research Admin",
        email: currentUser.email,
        lastSeen: new Date().toISOString()
      }, { merge: true });
    }
  }, [currentUser, db]);

  // Theme Management
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null;
    return doc(db, "admin_users", currentUser.uid);
  }, [db, currentUser]);

  const { data: adminProfile, isLoading: isAdminLoading } = useDoc(adminDocRef);

  // Sync Settings from DB once loaded
  useEffect(() => {
    if (adminProfile) {
      if (adminProfile.theme) setTheme(adminProfile.theme as any);
      if (adminProfile.autoSync !== undefined) setAutoSync(adminProfile.autoSync);
      if (adminProfile.neuralInsights !== undefined) setNeuralInsights(adminProfile.neuralInsights);
    }
  }, [adminProfile]);

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "students");
  }, [db]);

  const { data: dbStudents, isLoading: isDbLoading } = useCollection<Student>(studentsQuery);

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSeedData = () => {
    if (!db || !currentUser) {
      toast({ variant: "destructive", title: "Access Denied", description: "Authorization system initializing." });
      return;
    }
    const mockData = generateMockStudents(20);
    toast({ title: "Initializing Research", description: "Injecting 20 secure records into Firestore" });
    
    const studentsCol = collection(db, "students");
    mockData.forEach(student => {
      const studentRef = doc(studentsCol, student.id);
      setDocumentNonBlocking(studentRef, student, { merge: true });
    });
  };

  const handleSaveSettings = () => {
    if (!db || !currentUser) return;
    setIsSavingConfig(true);
    
    const adminRef = doc(db, "admin_users", currentUser.uid);
    updateDocumentNonBlocking(adminRef, {
      autoSync,
      neuralInsights,
      theme,
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSavingConfig(false);
      toast({
        title: "Protocol Updated",
        description: "System configuration has been securely saved to the cloud.",
      });
    }, 800);
  };

  const handleReportDownload = (reportName: string) => {
    toast({
      title: "Generating Archive",
      description: `Preparing ${reportName} for secure download...`,
    });
  };

  const students = useMemo(() => dbStudents || [], [dbStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (filters.gender && student.gender !== filters.gender) return false
      if (filters.academicTags && filters.academicTags.length > 0) {
        const hasTag = filters.academicTags.some(tag => student.tags.includes(tag))
        if (!hasTag) return false
      }
      if (filters.minScore !== undefined && student.averageScorePercentage < filters.minScore) return false
      if (filters.maxScore !== undefined && student.averageScorePercentage > filters.maxScore) return false
      
      const searchStr = (filters.keyword || searchQuery).toLowerCase();
      if (searchStr) {
        const matchesName = student.name.toLowerCase().includes(searchStr);
        const matchesId = student.id.toLowerCase().includes(searchStr);
        const matchesTags = student.tags.some(t => t.toLowerCase().includes(searchStr));
        if (!matchesName && !matchesId && !matchesTags) return false;
      }
      
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

  if (!mounted) return null;

  const renderContent = () => {
    if (loadingAuth || isAdminLoading || (isDbLoading && !students.length)) {
      return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary neon-text" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold tracking-widest text-primary neon-text uppercase">System Initializing</h3>
            <p className="text-sm text-muted-foreground mt-1">Verifying secure administrative protocols...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Attendance', value: `${stats.attendance}%`, icon: Zap, color: 'text-primary' },
                { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-primary' },
                { label: 'Completion', value: `${stats.completion}%`, icon: Target, color: 'text-primary' },
                { label: 'Rankings', value: filteredStudents.length > 0 ? `#${filteredStudents[0]?.rank || 1}` : 'N/A', icon: Trophy, color: 'text-primary' },
              ].map((stat) => (
                <Card key={stat.label} className="glass-card hover:translate-y-[-4px] transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-bold tracking-tight text-primary neon-text">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PerformanceTrend />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary">Elite Performers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {topPerformers.length > 0 ? topPerformers.map((student) => (
                    <div key={student.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={student.name} className="h-10 w-10 ring-1 ring-primary/30" />
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{student.tags[0]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{student.averageScorePercentage}%</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center space-y-4">
                      <AlertCircle className="h-10 w-10 text-primary/40 mx-auto" />
                      <p className="text-xs text-muted-foreground tracking-widest uppercase">Database Offline</p>
                      <Button variant="outline" size="sm" onClick={handleSeedData} className="border-primary/50 text-primary hover:bg-primary/10">Restore Records</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {neuralInsights && <AIInsights students={filteredStudents.slice(0, 20)} />}
            <StudentTable students={filteredStudents.slice(0, 5)} />
          </div>
        )
      case 'students':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <StudentTable students={filteredStudents} />
          </div>
        )
      case 'analysis':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceTrend />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-primary tracking-widest uppercase">Intelligence breakdown</CardTitle>
                  <CardDescription className="text-muted-foreground/60">Departmental efficiency analysis</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {['Science', 'Arts', 'Commerce'].map(tag => (
                    <div key={tag} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>{tag} Faculty</span>
                        <span className="text-primary">{Math.floor(Math.random() * 30 + 70)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                        <div 
                          className="h-full bg-primary neon-glow rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {neuralInsights && <AIInsights students={filteredStudents} />}
          </div>
        )
      case 'reports':
        return (
          <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-700">
             <Card className="glass-card">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle className="text-primary tracking-widest uppercase">Data Research Archive</CardTitle>
                   <CardDescription className="text-muted-foreground/60">Encrypted academic summaries and datasets</CardDescription>
                 </div>
                 <div className="bg-primary/10 p-3 rounded-xl">
                   <FileText className="h-8 w-8 text-primary" />
                 </div>
               </CardHeader>
               <CardContent className="grid md:grid-cols-2 gap-4">
                 {[
                   { name: 'Monthly Performance Summary', date: 'Oct 2023', size: '2.4 MB', type: 'Intel' },
                   { name: 'Attendance Correlation Study', date: 'Sep 2023', size: '1.8 MB', type: 'Research' },
                   { name: 'Student Growth Analysis', date: 'Aug 2023', size: '3.1 MB', type: 'Internal' },
                   { name: 'Global Benchmark Report', date: 'July 2023', size: '5.2 MB', type: 'External' },
                 ].map((report, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                     <div className="flex items-center gap-4">
                        <button onClick={() => handleReportDownload(report.name)} className="bg-primary/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Download className="h-5 w-5 text-primary" />
                        </button>
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{report.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{report.date} • {report.size}</p>
                        </div>
                     </div>
                     <Badge variant="outline" className="text-[9px] border-primary/20 text-primary uppercase">{report.type}</Badge>
                   </div>
                 ))}
               </CardContent>
             </Card>
          </div>
        )
      case 'settings':
        return (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-700 space-y-6">
            <Card className="glass-card overflow-hidden">
              <div className="h-24 bg-primary/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <CardHeader className="relative pb-10">
                <div className="absolute -top-12 left-6">
                  <StudentAvatar name={currentUser?.displayName || "Research Admin"} className="h-24 w-24 ring-4 ring-background" />
                </div>
                <div className="pl-28">
                  <CardTitle className="text-xl font-bold">{currentUser?.displayName || "Research Director"}</CardTitle>
                  <CardDescription className="text-primary neon-text font-bold text-[10px] uppercase tracking-[0.2em]">{adminProfile ? 'Access Level: Omega' : 'Access Pending'}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Core Identity</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Admin UID</p>
                      <p className="text-sm font-mono bg-white/5 p-2 rounded border border-white/5 truncate">{currentUser?.uid}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Contact Node</p>
                      <p className="text-sm font-mono bg-white/5 p-2 rounded border border-white/5 truncate">{currentUser?.email || "admin@dataresearch.ai"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">System Preferences</h4>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-medium">Auto-Sync Records</span>
                      <Switch checked={autoSync} onCheckedChange={setAutoSync} className="data-[state=checked]:bg-primary" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-medium">Neural Insights</span>
                      <Switch checked={neuralInsights} onCheckedChange={setNeuralInsights} className="data-[state=checked]:bg-primary" />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-white/5" />
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Appearance Protocol</h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'light', label: 'Light Mode', icon: Sun },
                      { id: 'dark', label: 'Dark Mode', icon: Moon },
                      { id: 'system', label: 'System Default', icon: Monitor },
                    ].map((m) => (
                      <button
                        key={m.id}
                        className={cn(
                          "flex items-center gap-2 border border-white/10 h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all",
                          theme === m.id ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                        onClick={() => setTheme(m.id as any)}
                      >
                        <m.icon className="h-4 w-4" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => toast({ title: "Export Started", description: "Securely compiling system logs..." })} className="border-white/10 hover:bg-white/5 uppercase tracking-widest font-bold text-[10px]">
                    <Database className="h-3 w-3 mr-2" />
                    Export Logs
                  </Button>
                  <Button disabled={isSavingConfig} onClick={handleSaveSettings} className="bg-primary text-black hover:bg-primary/80 uppercase tracking-widest font-bold text-[10px]">
                    {isSavingConfig ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <Sidebar className="glass-card border-r border-white/5 shadow-none">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 neon-glow">
                <Target className="text-black h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tighter leading-none">RESEARCH.<span className="text-primary neon-text">AI</span></h1>
                <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Data Research System</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/50 px-4 mb-2">System Modules</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeTab === item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "transition-all duration-300 py-6 px-4",
                          activeTab === item.id 
                            ? "bg-primary/10 text-primary border-r-2 border-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", activeTab === item.id && "neon-text text-primary")} />
                        <span className="font-bold tracking-widest text-xs uppercase">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/50 px-4 mb-2">Departmental Filter</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 space-y-4">
                  <div className="flex flex-col gap-2">
                    {['Science', 'Arts', 'Commerce'].map(tag => (
                      <div 
                        key={tag} 
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border",
                          filters.academicTags?.includes(tag) 
                            ? "bg-primary/10 border-primary/30 text-primary" 
                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                        )}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          academicTags: prev.academicTags?.includes(tag) 
                            ? prev.academicTags.filter(t => t !== tag) 
                            : [...(prev.academicTags || []), tag]
                        }))}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{tag}</span>
                        {filters.academicTags?.includes(tag) && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors h-8"
                    onClick={() => setFilters({})}
                  >
                    Reset Overrides
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <StudentAvatar name={currentUser?.displayName || "Research Admin"} className="h-10 w-10" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate">{currentUser?.displayName || "Research Lead"}</span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary neon-glow animate-pulse" />
                  <span className="text-[8px] text-primary/80 uppercase tracking-widest font-bold">{adminProfile ? 'Status: Secure' : 'Syncing...'}</span>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-20 glass-card border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-6 flex-1">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-3 w-full max-w-2xl group">
                <VoiceSearch onResult={(res) => {
                  setFilters(res)
                  setActiveTab('students')
                }} />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Admin Mode Active</span>
              </div>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
                {stats.activeCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full neon-glow" />}
              </Button>
              <Button 
                onClick={handleSeedData}
                disabled={isDbLoading}
                className="bg-primary/10 text-primary border-primary/30 border hover:bg-primary/20 transition-all font-bold tracking-widest uppercase text-[10px] h-10 px-6 rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span>Initialize Research</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">
                  {activeTab === 'dashboard' ? 'Operational Hub' : activeTab.toUpperCase() + ' UNIT'}
                </h2>
                <p className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase">
                  {isDbLoading ? "Decrypting stream..." : `Analyzing ${filteredStudents.length} active research nodes`}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 group cursor-default transition-all hover:bg-primary/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Integrity: 100%</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
        <Chatbot />
      </div>
    </SidebarProvider>
  )
}
