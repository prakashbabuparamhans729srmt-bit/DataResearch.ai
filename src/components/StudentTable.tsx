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
        <CardTitle className="text-sm font-medium">Student Directory</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-[300px]">Student</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="group border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.name} status={student.status} className="h-10 w-10" />
                    <div className="flex flex-col">
                      <span className="text-sm group-hover:text-primary transition-colors">{student.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{student.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {student.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-5 bg-white/5 hover:bg-primary/20 cursor-default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 w-32">
                    <div className="flex items-center justify-between text-[10px]">
                      <span>Average</span>
                      <span className="font-bold">{student.averageScorePercentage}%</span>
                    </div>
                    <Progress value={student.averageScorePercentage} className="h-1 bg-white/10" />
                  </div>
                </TableCell>
                <TableCell>
                   <span className={student.attendancePercentage < 75 ? "text-amber-500 font-medium" : "text-emerald-500 font-medium"}>
                    {student.attendancePercentage}%
                   </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="font-mono bg-indigo-500/5 text-indigo-400 border-indigo-500/20">
                    #{student.rank}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {students.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No students found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}