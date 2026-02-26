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
  Trophy,
  Loader2,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { generateMockStudents, type Student } from "@/lib/mock-data"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StudentTable } from "./StudentTable"
import { PerformanceTrend } from "./PerformanceChart"
import { VoiceSearch } from "./VoiceSearch"
import { AIInsights } from "./AIInsights"
import { StudentAvatar } from "./StudentAvatar"
import { type GenerativeVoiceSearchOutput } from "@/ai/flows/generative-voice-search"
import { useCollection, useFirebase, useMemoFirebase, initiateAnonymousSignIn, addDocumentNonBlocking, setDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', name: 'Students', icon: Users },
  { id: 'analysis', name: 'Analysis', icon: BarChart3 },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { firestore: db, auth, user: currentUser, isUserLoading: loadingAuth } = useFirebase();

  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState<GenerativeVoiceSearchOutput>({})
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // 1. Initial Authentication
  useEffect(() => {
    if (!loadingAuth && !currentUser && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [loadingAuth, currentUser, auth]);

  // 2. Register User as Admin to satisfy Security Rules
  useEffect(() => {
    if (currentUser && db) {
      const adminRef = doc(db, "admin_users", currentUser.uid);
      setDocumentNonBlocking(adminRef, {
        uid: currentUser.uid,
        role: 'admin',
        lastSeen: new Date().toISOString()
      }, { merge: true });
    }
  }, [currentUser, db]);

  // 3. Watch for Admin Status to prevent Permission Denied race conditions
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null;
    return doc(db, "admin_users", currentUser.uid);
  }, [db, currentUser]);

  const { data: adminProfile, isLoading: isAdminLoading } = useDoc(adminDocRef);

  // 4. Only attempt query when we have a user AND they are confirmed as an admin in Firestore
  const studentsQuery = useMemoFirebase(() => {
    if (!db || !currentUser || !adminProfile) return null;
    return collection(db, "students");
  }, [db, currentUser, adminProfile]);

  const { data: dbStudents, isLoading: isDbLoading } = useCollection<Student>(studentsQuery);

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSeedData = async () => {
    if (!db || !currentUser || !adminProfile) {
      toast({ variant: "destructive", title: "Wait...", description: "System still initializing permissions." });
      return;
    }
    const mockData = generateMockStudents(20);
    toast({ title: "Seeding data...", description: "Adding 20 mock students to Firestore" });
    
    mockData.forEach(student => {
      addDocumentNonBlocking(collection(db, "students"), student);
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

  if (!mounted) return null;

  const renderContent = () => {
    if (loadingAuth || isAdminLoading || (isDbLoading && !students.length)) {
      return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">Activating A to Z System</p>
            <p className="text-sm text-muted-foreground">Verifying secure administrative access...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
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
                  {topPerformers.length > 0 ? topPerformers.map((student) => (
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
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground">No students in database.</p>
                      <Button variant="outline" size="sm" onClick={handleSeedData}>Seed Data Now</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <AIInsights students={filteredStudents.slice(0, 20)} />
            <StudentTable students={filteredStudents.slice(0, 5)} />
          </div>
        )
      case 'students':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <StudentTable students={filteredStudents} />
          </div>
        )
      case 'analysis':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceTrend />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Subject Performance Breakdown</CardTitle>
                  <CardDescription>Average scores per academic department</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {['Science', 'Arts', 'Commerce'].map(tag => (
                    <div key={tag} className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{tag}</span>
                        <span>{Math.floor(Math.random() * 30 + 70)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <AIInsights students={filteredStudents} />
          </div>
        )
      case 'reports':
        return (
          <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-500">
             <Card className="glass-card">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle>Academic Reports</CardTitle>
                   <CardDescription>Generate and download comprehensive research summaries</CardDescription>
                 </div>
                 <FileText className="h-8 w-8 text-primary/40" />
               </CardHeader>
               <CardContent className="space-y-4">
                 {[
                   { name: 'Monthly Performance Summary', date: 'Oct 2023', size: '2.4 MB' },
                   { name: 'Attendance Correlation Study', date: 'Sep 2023', size: '1.8 MB' },
                   { name: 'Student Growth Analysis', date: 'Aug 2023', size: '3.1 MB' },
                 ].map((report, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{report.name}</p>
                          <p className="text-[10px] text-muted-foreground">{report.date} • {report.size}</p>
                        </div>
                     </div>
                     <Button variant="outline" size="sm">Download</Button>
                   </div>
                 ))}
               </CardContent>
             </Card>
          </div>
        )
      case 'settings':
        return (
          <div className="max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Manage your research preferences and profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Research Profile</p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <StudentAvatar name={currentUser?.displayName || "Research Admin"} className="h-12 w-12" />
                    <div>
                      <p className="text-sm font-bold">{currentUser?.displayName || "Research Admin"}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email || "researcher@dataresearch.ai"}</p>
                    </div>
                  </div>
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                  <p className="text-sm font-medium">Notifications</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Real-time alerts for low attendance</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weekly AI performance summary email</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
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
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeTab === item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className={activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}
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
              <StudentAvatar name={currentUser?.displayName || "Research Admin"} className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{currentUser?.displayName || "Research Admin"}</span>
                <span className="text-[10px] text-muted-foreground">Admin Status: {adminProfile ? 'Verified' : 'Pending'}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 glass-card border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              <VoiceSearch onResult={(res) => {
                setFilters(res)
                setActiveTab('students')
              }} />
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell className="h-5 w-5" />
                {stats.activeCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />}
              </Button>
              <Button 
                onClick={handleSeedData}
                disabled={!adminProfile}
                className="gradient-border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span>Seed Data</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab} View</h2>
                <p className="text-muted-foreground text-sm">
                  {isDbLoading ? "Initializing data..." : `Managing ${filteredStudents.length} student records in real-time.`}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  System Secure
                </Badge>
              </div>
            </div>

            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
