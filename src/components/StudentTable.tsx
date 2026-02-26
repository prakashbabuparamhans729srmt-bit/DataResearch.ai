"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Student } from "@/lib/mock-data"
import { StudentAvatar } from "./StudentAvatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StudentTable({ students }: { students: Student[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary">Intelligence Node Directory</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5 bg-white/5">
              <TableHead className="w-[300px] text-[10px] uppercase tracking-widest font-bold">Subject Node</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Classifiers</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Efficiency</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Presence</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="group border-white/5 hover:bg-primary/5 transition-all">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.name} status={student.status} className="h-10 w-10 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">{student.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-mono">{student.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {student.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[9px] h-5 bg-white/5 border border-white/5 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all uppercase tracking-widest">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 w-32">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase">Rate</span>
                      <span className="text-primary neon-text">{student.averageScorePercentage}%</span>
                    </div>
                    <Progress value={student.averageScorePercentage} className="h-1 bg-white/5" />
                  </div>
                </TableCell>
                <TableCell>
                   <span className={student.attendancePercentage < 75 ? "text-destructive font-bold text-[10px]" : "text-primary neon-text font-bold text-[10px]"}>
                    {student.attendancePercentage}%
                   </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20 neon-glow">
                    LEVEL {student.rank}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {students.length === 0 && (
          <div className="py-20 text-center text-muted-foreground uppercase tracking-[0.2em] font-bold text-xs">
            Scanning for available nodes...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
