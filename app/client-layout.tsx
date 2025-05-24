"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarLayout } from "@/components/sidebar-layout"
import { LoginScreen } from "@/components/login-screen"
import { syncTransactions, syncEmployeeExpenses, syncCorporateIncome } from "@/lib/data-sync"
import { exportAllToCSV } from "@/lib/csv-export"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  // Check if user is logged in on component mount
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn")
    if (loggedInStatus === "true") {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem("isLoggedIn", "true")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("isLoggedIn")
  }

  const syncDataWithSupabase = async () => {
    if (!isLoggedIn) return

    setIsSyncing(true)
    setSyncStatus("syncing")

    try {
      // Get data from localStorage
      const getLocalData = (key: string) => {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            return JSON.parse(data, (key, value) => {
              if (key === "date" && value) {
                return new Date(value)
              }
              return value
            })
          }
        } catch (error) {
          console.error(`Error loading ${key} from localStorage:`, error)
        }
        return []
      }

      const transactions = getLocalData("transactions")
      const employeeExpenses = getLocalData("employeeExpenses")
      const corporateIncome = getLocalData("corporateIncome")

      // Sync all data with Supabase
      await syncTransactions(transactions)
      await syncEmployeeExpenses(employeeExpenses)
      await syncCorporateIncome(corporateIncome)

      setSyncStatus("success")

      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error syncing data with Supabase:", error)
      setSyncStatus("error")

      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleExportAll = () => {
    // Get data from localStorage
    const getLocalData = (key: string) => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          return JSON.parse(data, (key, value) => {
            if (key === "date" && value) {
              return new Date(value)
            }
            return value
          })
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error)
      }
      return []
    }

    const transactions = getLocalData("transactions")
    const employeeExpenses = getLocalData("employeeExpenses")
    const corporateIncome = getLocalData("corporateIncome")

    exportAllToCSV(transactions, employeeExpenses, corporateIncome)
  }

  if (!isLoggedIn) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <LoginScreen onLogin={handleLogin} />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarLayout
          onSync={syncDataWithSupabase}
          syncStatus={syncStatus}
          isSyncing={isSyncing}
          onExport={handleExportAll}
          onLogout={handleLogout}
        >
          {children}
        </SidebarLayout>
      </body>
    </html>
  )
}
