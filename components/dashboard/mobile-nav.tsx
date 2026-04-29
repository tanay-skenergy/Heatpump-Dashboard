"use client"

import { useState } from "react"
import { 
  LayoutDashboard, 
  BarChart3, 
  Activity, 
  HeadphonesIcon,
  Menu,
  X,
  Sun
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#", active: true },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: Activity, label: "System Health", href: "#" },
  { icon: HeadphonesIcon, label: "Support", href: "#" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sun className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">SolarTherm</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary">IIoT</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  item.active && "bg-sidebar-accent text-primary hover:text-primary"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", item.active && "text-primary")} />
                <span className="text-sm">{item.label}</span>
              </Button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
