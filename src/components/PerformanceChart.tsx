
"use client"

import { useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Student } from "@/lib/mock-data"

export function PerformanceTrend({ students }: { students?: Student[] }) {
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    
    // If no students or empty, return baseline
    if (!students || students.length === 0) {
      return months.map(m => ({ month: m, score: 0, attendance: 0 }));
    }

    // Dynamic A to Z Calculation: Average out the trends of all filtered students
    return months.map((month, idx) => {
      const avgScore = Math.round(students.reduce((acc, s) => acc + (s.trends?.[idx] || 0), 0) / students.length);
      // Generate attendance trend based on a stable variation of the score for mock realism
      const avgAttendance = Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage - (5 - idx)), 0) / students.length);
      
      return {
        month,
        score: avgScore,
        attendance: Math.min(100, Math.max(0, avgAttendance))
      };
    });
  }, [students]);

  return (
    <Card className="glass-card col-span-1 lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary">Neural Performance Vector</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#666', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#666', fontWeight: 'bold' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#070707', 
                  border: '1px solid #07F1D644',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#07F1D6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#07F1D6', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#07F1D6', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={2000}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#FFFFFF" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#FFFFFF', strokeWidth: 0 }} 
                activeDot={{ r: 5, fill: '#FFFFFF', stroke: '#07F1D6', strokeWidth: 2 }}
                animationDuration={2500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
