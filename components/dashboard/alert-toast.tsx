"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertToastProps {
  message: string
  type?: "success" | "warning" | "info"
  subMessage?: string
  dismissible?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

export function AlertToast({
  message,
  type = "success",
  subMessage,
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000
}: AlertToastProps) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => setVisible(false), autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay])
  
  if (!visible) return null
  
  const iconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: CheckCircle2
  }
  
  const colorMap = {
    success: {
      bg: "bg-[oklch(0.70_0.18_145_/_0.1)]",
      border: "border-[oklch(0.70_0.18_145_/_0.3)]",
      icon: "text-[oklch(0.70_0.18_145)]",
      glow: "shadow-[0_0_30px_oklch(0.70_0.18_145_/_0.15)]"
    },
    warning: {
      bg: "bg-[oklch(0.78_0.16_75_/_0.1)]",
      border: "border-[oklch(0.78_0.16_75_/_0.3)]",
      icon: "text-accent",
      glow: "shadow-[0_0_30px_oklch(0.78_0.16_75_/_0.15)]"
    },
    info: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      icon: "text-primary",
      glow: "shadow-[0_0_30px_oklch(0.78_0.18_195_/_0.15)]"
    }
  }
  
  const Icon = iconMap[type]
  const colors = colorMap[type]
  
  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50 flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm transition-all duration-300 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm",
      colors.bg,
      colors.border,
      colors.glow,
      "animate-in slide-in-from-bottom-5 fade-in-0"
    )}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", colors.icon)} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subMessage}</p>
        )}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
