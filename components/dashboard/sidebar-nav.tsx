"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BarChart3, 
  Activity, 
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Sun
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#", active: true },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: Activity, label: "System Health", href: "#" },
  { icon: HeadphonesIcon, label: "Support", href: "#" },
]

interface SidebarNavProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function SidebarNav({ collapsed = false, onToggle }: SidebarNavProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sun className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">SolarTherm</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary">IIoT</span>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const button = (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  item.active && "bg-sidebar-accent text-primary hover:text-primary",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", item.active && "text-primary")} />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Button>
            )
            
            if (collapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            
            return button
          })}
        </nav>
        
        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
