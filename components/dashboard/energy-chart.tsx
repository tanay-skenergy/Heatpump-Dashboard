"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

interface EnergyChartProps {
  data: { time: string; value: number }[]
  title?: string
}

export function EnergyChart({ 
  data,
  title = "Energy Consumption"
}: EnergyChartProps) {
  return (
    <Card className="border-border/50 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Last 24 hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Consumption (kW)</span>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.78 0.18 195)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="oklch(0.78 0.18 195)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.60 0 0)', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.60 0 0)', fontSize: 11 }}
              tickFormatter={(value) => `${value}kW`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {payload.map((entry, index) => (
                        <p 
                          key={index}
                          className="text-sm font-medium"
                          style={{ color: entry.color }}
                        >
                          {entry.value} kW
                        </p>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="oklch(0.78 0.18 195)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsumption)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
