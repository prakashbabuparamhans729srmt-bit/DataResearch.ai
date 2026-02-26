"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { month: "Jan", score: 65, attendance: 82 },
  { month: "Feb", score: 72, attendance: 85 },
  { month: "Mar", score: 68, attendance: 88 },
  { month: "Apr", score: 85, attendance: 90 },
  { month: "May", score: 92, attendance: 87 },
]

export function PerformanceTrend() {
  return (
    <Card className="glass-card col-span-1 lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary">Neural Performance Vector</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
