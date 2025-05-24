"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CloudIcon as CloudSync,
  Download,
  Home,
  LogOut,
  Settings,
} from "lucide-react"
import { getUserPreferences } from "@/lib/data-sync"

interface SidebarLayoutProps {
  children: React.ReactNode
  onSync: () => Promise<void>
  syncStatus: "idle" | "syncing" | "success" | "error"
  isSyncing: boolean
  onExport: () => void
  onLogout: () => void
}

export function SidebarLayout({ children, onSync, syncStatus, isSyncing, onExport, onLogout }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [businessName, setBusinessName] = useState("Hao's Business")
  const pathname = usePathname()

  // Load business name from user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences()
      if (prefs.businessName) {
        setBusinessName(prefs.businessName)
      }
    }

    loadPreferences()
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && <h2 className="font-bold text-lg truncate">{businessName}</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <Link href="/" passHref>
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <Home className="h-4 w-4 mr-2" />
              {!collapsed && <span>Dashboard</span>}
            </Button>
          </Link>
          <Link href="/explainer" passHref>
            <Button
              variant={pathname === "/explainer" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {!collapsed && <span>Explainer</span>}
            </Button>
          </Link>
          <Link href="/tax-rates" passHref>
            <Button
              variant={pathname === "/tax-rates" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {!collapsed && <span>Tax Rates</span>}
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button
              variant={pathname === "/settings" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <Settings className="h-4 w-4 mr-2" />
              {!collapsed && <span>Settings</span>}
            </Button>
          </Link>
        </nav>

        <div className="p-2 border-t border-gray-200 space-y-1">
          <Button
            variant="outline"
            onClick={onSync}
            disabled={isSyncing}
            className={cn(
              "w-full justify-start",
              collapsed && "justify-center",
              syncStatus === "success" && "text-green-600",
              syncStatus === "error" && "text-red-600",
            )}
          >
            <CloudSync className={cn("h-4 w-4 mr-2", collapsed && "mr-0", isSyncing && "animate-spin")} />
            {!collapsed && (
              <>
                {syncStatus === "idle" && "Sync Data"}
                {syncStatus === "syncing" && "Syncing..."}
                {syncStatus === "success" && "Synced!"}
                {syncStatus === "error" && "Sync Failed"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className={cn("w-full justify-start", collapsed && "justify-center")}
          >
            <Download className="h-4 w-4 mr-2" />
            {!collapsed && <span>Export All</span>}
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className={cn("w-full justify-start", collapsed && "justify-center")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4">{children}</div>
      </div>
    </div>
  )
}
