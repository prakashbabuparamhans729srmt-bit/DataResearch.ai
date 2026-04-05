
"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Upload, 
  MoreVertical,
  LayoutDashboard,
  Target,
  Zap,
  TrendingUp,
  Trophy,
  Loader2,
  Download,
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  Save,
  Database,
  Activity,
  ArrowRight,
  Fingerprint,
  Cpu,
  Globe,
  Lock
} from "lucide-react"
import { generateMockStudents, type Student } from "@/lib/mock-data"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const MISSION_INDIA_OBJECTIVES = [
  "1. Data-driven education for India",
  "2. Real-time performance analytics",
  "3. AI-driven insights for teachers",
  "4. Bridge the rural-urban gap",
  "5. Improve attendance patterns",
  "6. Support NEP 2020 goals",
  "7. Track skill development",
  "8. Multilingual India support",
  "9. Secure data (DPDP compliance)",
  "10. Talent identification protocol",
  "11. Digitization of academic records",
  "12. Parent-Teacher AI bridge",
  "13. Regional language research nodes",
  "14. Dropout prediction algorithms",
  "15. Scholarship eligibility automation",
  "16. Vocational skill tracking",
  "17. Mental health support insights",
  "18. Teacher resource optimization",
  "19. Classroom engagement monitoring",
  "20. National ranking synchronization",
  "21. Adaptive learning paths",
  "22. Peer-to-peer knowledge nodes",
  "23. Holistic 360-degree assessment",
  "24. Real-time intervention alerts",
  "25. Resource distribution equity",
  "26. Student wellness telemetry",
  "27. Teacher training AI assistants",
  "28. Localized curriculum mapping",
  "29. Extra-curricular talent tracking",
  "30. Alumni mentorship network link",
  "31. Digital health cards for students",
  "32. Real-time nutritional tracking",
  "33. AI-driven aptitude mapping",
  "34. Community learning circles",
  "35. Local folklore & cultural integration",
  "36. Gamified learning achievements",
  "37. Peer-reviewed research nodes",
  "38. Sustainable school metrics",
  "39. Blockchain-based credentialing",
  "40. Global research exchange link"
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { firestore: db, user: currentUser, isUserLoading: loadingAuth } = useFirebase();

  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState<GenerativeVoiceSearchOutput>({})
  const [searchQuery, setSearchQuery] = useState("")
  
  // Settings States (Default UI state before DB sync)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [autoSync, setAutoSync] = useState(true)
  const [neuralInsights, setNeuralInsights] = useState(true)
  const [language, setLanguage] = useState('English')
  const [securityLevel, setSecurityLevel] = useState('Omega')
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  const { toast } = useToast()

  // Auto-register admin node on first link
  useEffect(() => {
    if (currentUser && db) {
      const adminRef = doc(db, "admin_users", currentUser.uid);
      setDocumentNonBlocking(adminRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Research Admin",
        email: currentUser.email,
        lastSeen: new Date().toISOString(),
        role: "A to Z Administrator"
      }, { merge: true });
    }
  }, [currentUser, db]);

  // Theme Sync Protocol
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

  // Sync state from cloud profile
  useEffect(() => {
    if (adminProfile) {
      if (adminProfile.theme) setTheme(adminProfile.theme as any);
      if (adminProfile.autoSync !== undefined) setAutoSync(adminProfile.autoSync);
      if (adminProfile.neuralInsights !== undefined) setNeuralInsights(adminProfile.neuralInsights);
      if (adminProfile.language) setLanguage(adminProfile.language);
      if (adminProfile.securityLevel) setSecurityLevel(adminProfile.securityLevel);
    }
  }, [adminProfile]);

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "students");
  }, [db]);

  const { data: dbStudents, isLoading: isDbLoading } = useCollection<Student>(studentsQuery);

  // Auto-restore nodes if system is empty and autoSync is active
  useEffect(() => {
    if (mounted && !isDbLoading && dbStudents && dbStudents.length === 0 && autoSync && db && currentUser) {
      const mockData = generateMockStudents(20);
      const studentsCol = collection(db, "students");
      mockData.forEach(student => {
        const studentRef = doc(studentsCol, student.id);
        setDocumentNonBlocking(studentRef, student, { merge: true });
      });
      toast({
        title: "A to Z Auto-Sync Complete",
        description: "Restored 20 intelligence nodes from secure cloud backup.",
      });
    }
  }, [mounted, isDbLoading, dbStudents, autoSync, db, currentUser]);

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSeedData = () => {
    if (!db || !currentUser) {
      toast({ variant: "destructive", title: "Access Denied", description: "Authorization link failed." });
      return;
    }
    const mockData = generateMockStudents(20);
    toast({ title: "Initializing Data Link", description: "Injecting secure records into the directory." });
    
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
      language,
      securityLevel,
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSavingConfig(false);
      toast({
        title: "A to Z Configuration Saved",
        description: "System protocols have been encrypted and uploaded to the cloud.",
      });
    }, 800);
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
            <h3 className="text-xl font-bold tracking-widest text-primary neon-text uppercase italic">Establishing A to Z Link</h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-mono">Verifying Neural Protocols...</p>
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
                { label: 'System Presence', value: `${stats.attendance}%`, icon: Zap },
                { label: 'Intel Accuracy', value: stats.avgScore, icon: TrendingUp },
                { label: 'Mission Completion', value: `${stats.completion}%`, icon: Target },
                { label: 'Elite Ranking', value: filteredStudents.length > 0 ? `#${filteredStudents[0]?.rank || 1}` : 'N/A', icon: Trophy },
              ].map((stat) => (
                <Card key={stat.label} className="glass-card hover:translate-y-[-4px] transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <stat.icon className="h-6 w-6 text-primary" />
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
              <PerformanceTrend students={filteredStudents} />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary flex items-center gap-2">
                    <Target className="h-4 w-4" /> A to Z National Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-[280px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {MISSION_INDIA_OBJECTIVES.map((obj, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary neon-glow shrink-0" />
                        <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">{obj}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StudentTable students={filteredStudents.slice(0, 5)} />
                <Button variant="ghost" className="w-full mt-4 text-[10px] uppercase tracking-widest font-bold text-primary hover:bg-primary/5" onClick={() => setActiveTab('students')}>
                  View Full Records Directory <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Top Research Nodes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {topPerformers.map((student) => (
                    <div key={student.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={student.name} status={student.status} className="h-10 w-10 ring-1 ring-primary/30" />
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{student.tags[0]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{student.averageScorePercentage}%</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {neuralInsights && <AIInsights students={filteredStudents.slice(0, 20)} />}
          </div>
        )
      case 'students':
        return <StudentTable students={filteredStudents} />
      case 'analysis':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceTrend students={filteredStudents} />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-primary tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> Faculty Efficiency Unit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {['Science', 'Arts', 'Commerce'].map(tag => {
                    const tagStudents = students.filter(s => s.tags.includes(tag));
                    const tagEfficiency = tagStudents.length > 0 
                      ? Math.round(tagStudents.reduce((acc, s) => acc + s.averageScorePercentage, 0) / tagStudents.length)
                      : 0;
                    return (
                      <div key={tag} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span>{tag} Department</span>
                          <span className="text-primary">{tagEfficiency}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-primary neon-glow rounded-full transition-all duration-1000" 
                            style={{ width: `${tagEfficiency}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
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
                   <CardTitle className="text-primary tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                     <FileText className="h-4 w-4" /> Archive Vault
                   </CardTitle>
                   <CardDescription className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Encrypted summaries and insights</CardDescription>
                 </div>
                 <Database className="h-6 w-6 text-primary" />
               </CardHeader>
               <CardContent className="grid md:grid-cols-2 gap-4">
                 {[
                   { name: 'National Performance Audit', date: 'Oct 2023', size: '2.4 MB', type: 'Official' },
                   { name: 'Rural Education Efficiency', date: 'Sep 2023', size: '1.8 MB', type: 'Research' },
                   { name: 'Skill Growth Projection', date: 'Aug 2023', size: '3.1 MB', type: 'Internal' },
                   { name: 'A to Z System Log', date: 'July 2023', size: '5.2 MB', type: 'Audit' },
                 ].map((report, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                     <div className="flex items-center gap-4">
                        <Download className="h-4 w-4 text-primary" />
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
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-primary tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                  <Settings className="h-4 w-4" /> A to Z Protocol Config
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Identity Access</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Admin Mail</p>
                      <p className="text-sm font-mono bg-white/5 p-2 rounded border border-white/5 truncate">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">System Overrides</h4>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-medium">Auto-Sync Nodes</span>
                      <Switch checked={autoSync} onCheckedChange={setAutoSync} className="data-[state=checked]:bg-primary" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-medium">Neural Insights</span>
                      <Switch checked={neuralInsights} onCheckedChange={setNeuralInsights} className="data-[state=checked]:bg-primary" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Language Link</h4>
                    <div className="flex gap-2">
                      {['Hindi', 'English'].map((lang) => (
                        <Button
                          key={lang}
                          variant={language === lang ? "default" : "outline"}
                          className="flex-1 uppercase tracking-widest text-[10px] font-bold h-10"
                          onClick={() => setLanguage(lang)}
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Vision Mode</h4>
                    <div className="flex gap-2">
                      {[
                        { id: 'light', icon: Sun },
                        { id: 'dark', icon: Moon },
                        { id: 'system', icon: Monitor },
                      ].map((m) => (
                        <Button
                          key={m.id}
                          variant={theme === m.id ? "default" : "outline"}
                          className="flex-1 h-10"
                          onClick={() => setTheme(m.id as any)}
                        >
                          <m.icon className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button disabled={isSavingConfig} onClick={handleSaveSettings} className="bg-primary text-black hover:bg-primary/80 uppercase tracking-widest font-bold text-[10px] neon-glow">
                    {isSavingConfig ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                    Save A to Z Protocol
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
                <h1 className="text-lg font-bold tracking-tighter leading-none italic">RESEARCH.AI</h1>
                <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground font-bold">A to Z Intelligence</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/50 px-4 mb-2">Operational Hub</SidebarGroupLabel>
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
                        <item.icon className={cn("h-5 w-5", activeTab === item.id && "text-primary")} />
                        <span className="font-bold tracking-widest text-xs uppercase">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <StudentAvatar name={currentUser?.displayName || "Research Admin"} className="h-10 w-10" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate">{currentUser?.displayName || "Research Lead"}</span>
                <span className="text-[8px] text-primary/80 uppercase tracking-widest font-bold">Lvl: {securityLevel}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-20 glass-card border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-6 flex-1">
              <SidebarTrigger className="md:hidden" />
              <VoiceSearch onResult={(res) => {
                setFilters(res)
                setActiveTab('students')
              }} />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Integrity: 100%</span>
              </div>
              <Button 
                onClick={handleSeedData}
                disabled={isDbLoading}
                className="bg-primary/10 text-primary border-primary/30 border hover:bg-primary/20 font-bold tracking-widest uppercase text-[10px] h-10 px-6 rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span>Sync Cloud</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter uppercase text-white leading-none italic">
                  {activeTab.toUpperCase()} UNIT
                </h2>
                <p className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase">
                  {isDbLoading ? "Restoring encrypted stream..." : `Analyzing ${filteredStudents.length} active nodes`}
                </p>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">A to Z Active</span>
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
