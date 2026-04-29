"use client"

import { Bell, ChevronDown, User, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm",
      className
    )}>
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sun className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">SolarTherm</span>
        </div>
        
        <h1 className="hidden text-lg font-medium text-foreground lg:block">Dashboard</h1>
        
        {/* System Status */}
        <div className="hidden items-center gap-2 rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.70_0.18_145)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[oklch(0.70_0.18_145)]" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">System Online</span>
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </Button>
        
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="gap-2 pl-2 pr-3 text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-secondary text-xs">PR</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium text-foreground">Pradeep Rathi</span>
                <span className="text-[10px] text-muted-foreground">Customer</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Customer Login</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
