"use client"

import { useEffect, useState } from "react"

interface TemperatureGaugeProps {
  value: number
  min?: number
  max?: number
  unit?: string
  label?: string
}

export function TemperatureGauge({
  value,
  min = 0,
  max = 100,
  unit = "°C",
  label = "Current Water Temperature"
}: TemperatureGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100)
    return () => clearTimeout(timer)
  }, [value])

  const percentage = ((animatedValue - min) / (max - min)) * 100
  const angle = (percentage / 100) * 270 - 135 // Arc from -135 to 135 degrees
  
  // Calculate the arc path
  const radius = 120
  const strokeWidth = 16
  const center = 150
  
  const polarToCartesian = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180)
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians)
    }
  }
  
  const startAngle = -135
  const endAngle = 135
  const currentAngle = startAngle + (percentage / 100) * (endAngle - startAngle)
  
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(endAngle)
  const current = polarToCartesian(currentAngle)
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  const currentLargeArcFlag = currentAngle - startAngle <= 180 ? "0" : "1"
  
  const backgroundArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  const valueArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${currentLargeArcFlag} 1 ${current.x} ${current.y}`

  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      <svg 
        width="300" 
        height="250" 
        viewBox="0 0 300 250" 
        className="drop-shadow-2xl"
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.15 195)" />
            <stop offset="50%" stopColor="oklch(0.78 0.18 195)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 75)" />
          </linearGradient>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.25 0.005 260)" />
            <stop offset="100%" stopColor="oklch(0.20 0.005 260)" />
          </linearGradient>
        </defs>
        
        {/* Background arc */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="url(#backgroundGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc with glow */}
        <path
          d={valueArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Tick marks */}
        {[...Array(11)].map((_, i) => {
          const tickAngle = startAngle + (i / 10) * (endAngle - startAngle)
          const innerRadius = radius - strokeWidth / 2 - 8
          const outerRadius = radius - strokeWidth / 2 - 4
          const innerPos = polarToCartesian(tickAngle)
          const outerPos = {
            x: center + innerRadius * Math.cos((tickAngle - 90) * Math.PI / 180),
            y: center + innerRadius * Math.sin((tickAngle - 90) * Math.PI / 180)
          }
          return (
            <line
              key={i}
              x1={outerPos.x}
              y1={outerPos.y}
              x2={center + (innerRadius - 8) * Math.cos((tickAngle - 90) * Math.PI / 180)}
              y2={center + (innerRadius - 8) * Math.sin((tickAngle - 90) * Math.PI / 180)}
              stroke="oklch(0.40 0 0)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          )
        })}
        
        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r="70"
          fill="oklch(0.15 0.005 260)"
          className="drop-shadow-lg"
        />
        <circle
          cx={center}
          cy={center}
          r="68"
          fill="none"
          stroke="oklch(0.25 0.005 260)"
          strokeWidth="2"
        />
        
        {/* Temperature value */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="fill-foreground text-5xl font-light tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {animatedValue.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + 25}
          textAnchor="middle"
          className="fill-primary text-2xl font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {unit}
        </text>
      </svg>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>{min}{unit}</span>
          <div className="h-px w-16 bg-border" />
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  )
}
