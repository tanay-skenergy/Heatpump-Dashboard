"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  color?: string
  className?: string
}

function Sparkline({ data, color = "oklch(0.78 0.18 195)", className }: SparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const width = 80
  const height = 32
  const padding = 2
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(" ")
  
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={`sparklineGradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparklineGradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width - padding}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r="3"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  sparklineData?: number[]
  trend?: "up" | "down" | "stable"
  trendValue?: string
  icon?: React.ReactNode
  variant?: "default" | "status" | "power"
  status?: "on" | "off"
  accentColor?: "cyan" | "amber" | "green"
}

export function StatCard({
  title,
  value,
  unit,
  sparklineData,
  trend,
  trendValue,
  icon,
  variant = "default",
  status,
  accentColor = "cyan"
}: StatCardProps) {
  const colorMap = {
    cyan: "oklch(0.78 0.18 195)",
    amber: "oklch(0.78 0.16 75)",
    green: "oklch(0.70 0.18 145)"
  }
  
  const glowColorMap = {
    cyan: "shadow-[0_0_20px_oklch(0.78_0.18_195_/_0.3)]",
    amber: "shadow-[0_0_20px_oklch(0.78_0.16_75_/_0.3)]",
    green: "shadow-[0_0_20px_oklch(0.70_0.18_145_/_0.3)]"
  }

  if (variant === "status") {
    return (
      <Card className={cn(
        "relative overflow-hidden border-border/50 bg-card p-5 transition-all duration-300 hover:border-border",
        status === "on" && glowColorMap.green
      )}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className={cn(
                "relative flex h-12 w-20 items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide",
                status === "on" 
                  ? "bg-[oklch(0.70_0.18_145_/_0.15)] text-[oklch(0.70_0.18_145)]" 
                  : "bg-muted text-muted-foreground"
              )}>
                {status === "on" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-[oklch(0.70_0.18_145_/_0.2)]" />
                )}
                <span className="relative">{status?.toUpperCase()}</span>
              </div>
            </div>
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        {status === "on" && (
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[oklch(0.70_0.18_145_/_0.05)] blur-2xl" />
        )}
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card p-5 transition-all duration-300 hover:border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span 
              className="text-3xl font-light tracking-tight"
              style={{ color: colorMap[accentColor] }}
            >
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {trend && trendValue && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              trend === "up" && "text-[oklch(0.70_0.18_145)]",
              trend === "down" && "text-destructive",
              trend === "stable" && "text-muted-foreground"
            )}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "stable" && "→"}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
          {sparklineData && (
            <Sparkline 
              data={sparklineData} 
              color={colorMap[accentColor]}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
