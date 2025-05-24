"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { CustomCalendar } from "@/components/custom-calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginScreen } from "@/components/login-screen"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarLayout } from "@/components/sidebar-layout"
import type { Transaction, EmployeeExpense, CorporateIncome, UserPreferences } from "@/types/schema"
import {
  syncTransactions,
  syncEmployeeExpenses,
  syncCorporateIncome,
  deleteTransactionFromSupabase,
  deleteExpenseFromSupabase,
  deleteIncomeFromSupabase,
  clearAllTransactionsFromSupabase,
  clearAllExpensesFromSupabase,
  clearAllIncomeFromSupabase,
  saveUserPreferences,
  getUserPreferences,
} from "@/lib/data-sync"
import {
  exportAllToCSV,
  exportTransactionsToCSV,
  exportExpensesToCSV,
  exportIncomeToCSV,
  downloadCSV,
} from "@/lib/csv-export"

// Import the tax calculator
// Add this import at the top of the file with the other imports

import { calculateGrossFromNet } from "@/lib/tax-calculator"
// Add this import at the top with the other imports
import { TransactionDetail } from "@/components/transaction-detail"

// Tax rates for 2024-2025 (simplified for demonstration)
const TAX_RATES = {
  FEDERAL_CORPORATE_TAX_RATE: 0.09, // Federal small business rate
  ONTARIO_CORPORATE_TAX_RATE: 0.032, // Ontario small business rate
  CPP_RATE: 0.119, // Self-employed CPP rate for 2024
}

// Default exchange rate (USD to CAD)
const DEFAULT_EXCHANGE_RATE = 1.35

export default function TransactionTracker() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({})
  const [businessName, setBusinessName] = useState("Your Business")
  const [employeeName, setEmployeeName] = useState("Hao")

  // Corporate transactions state
  const [amount, setAmount] = useState<string>("")
  const [transactionType, setTransactionType] = useState<"owner_salary" | "expense">("owner_salary")
  const [transactionDate, setTransactionDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState<string>("")
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTransactions = localStorage.getItem("transactions")
        if (savedTransactions) {
          // Parse the saved transactions and convert date strings back to Date objects
          return JSON.parse(savedTransactions, (key, value) => {
            // Convert date strings back to Date objects
            if (key === "date" && value) {
              return new Date(value)
            }
            return value
          })
        }
      } catch (error) {
        console.error("Error loading transactions from localStorage:", error)
      }
    }
    return []
  })

  // Transaction editing state
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<Date>(new Date())
  const [editingAmount, setEditingAmount] = useState<string>("")
  const [editingType, setEditingType] = useState<"owner_salary" | "expense">("owner_salary")

  // Employee expenses state
  const [expenseAmount, setExpenseAmount] = useState<string>("")
  const [expenseCurrency, setExpenseCurrency] = useState<"CAD" | "USD">("CAD")
  const [expenseDate, setExpenseDate] = useState<Date>(new Date())
  const [expenseType, setExpenseType] = useState<"flight" | "hotel" | "meals" | "technology">("meals")
  const [expenseNotes, setExpenseNotes] = useState<string>("")
  const [employeeExpenses, setEmployeeExpenses] = useState<EmployeeExpense[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedExpenses = localStorage.getItem("employeeExpenses")
        if (savedExpenses) {
          return JSON.parse(savedExpenses, (key, value) => {
            if (key === "date" && value) {
              return new Date(value)
            }
            return value
          })
        }
      } catch (error) {
        console.error("Error loading employee expenses from localStorage:", error)
      }
    }
    return []
  })

  // Corporate income state
  const [incomeAmount, setIncomeAmount] = useState<string>("")
  const [incomeCurrency, setIncomeCurrency] = useState<"CAD" | "USD">("USD")
  const [incomeDate, setIncomeDate] = useState<Date>(new Date())
  const [exchangeRate, setExchangeRate] = useState<string>(DEFAULT_EXCHANGE_RATE.toString())
  const [clientName, setClientName] = useState<string>("")
  const [incomeNotes, setIncomeNotes] = useState<string>("")
  const [corporateIncome, setCorporateIncome] = useState<CorporateIncome[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedIncome = localStorage.getItem("corporateIncome")
        if (savedIncome) {
          return JSON.parse(savedIncome, (key, value) => {
            if (key === "date" && value) {
              return new Date(value)
            }
            return value
          })
        }
      } catch (error) {
        console.error("Error loading corporate income from localStorage:", error)
      }
    }
    return []
  })

  // Add these state variables inside the TransactionTracker component, after the other state declarations
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false)

  // Check if user is logged in on component mount
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn")
    if (loggedInStatus === "true") {
      setIsLoggedIn(true)
    }
  }, [])

  // Load user preferences when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const loadUserPreferences = async () => {
        const prefs = await getUserPreferences()
        setUserPreferences(prefs)

        // Set business and employee names
        if (prefs.businessName) {
          setBusinessName(prefs.businessName)
        }
        if (prefs.employeeName) {
          setEmployeeName(prefs.employeeName)
        }

        // Set default dates based on user preferences
        if (prefs.lastTransactionDate) {
          setTransactionDate(prefs.lastTransactionDate)
        }
        if (prefs.lastExpenseDate) {
          setExpenseDate(prefs.lastExpenseDate)
        }
        if (prefs.lastIncomeDate) {
          setIncomeDate(prefs.lastIncomeDate)
        }
      }

      loadUserPreferences()
    }
  }, [isLoggedIn])

  // Sync data with Supabase when logged in
  useEffect(() => {
    if (isLoggedIn) {
      syncDataWithSupabase()
    }
  }, [isLoggedIn])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("transactions", JSON.stringify(transactions))
      } catch (error) {
        console.error("Error saving transactions to localStorage:", error)
      }
    }
  }, [transactions])

  // Save employee expenses to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("employeeExpenses", JSON.stringify(employeeExpenses))
      } catch (error) {
        console.error("Error saving employee expenses to localStorage:", error)
      }
    }
  }, [employeeExpenses])

  // Save corporate income to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("corporateIncome", JSON.stringify(corporateIncome))
      } catch (error) {
        console.error("Error saving corporate income to localStorage:", error)
      }
    }
  }, [corporateIncome])

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
      // Sync all data with Supabase
      const syncedTransactions = await syncTransactions(transactions)
      const syncedExpenses = await syncEmployeeExpenses(employeeExpenses)
      const syncedIncome = await syncCorporateIncome(corporateIncome)

      // Update local state with merged data
      setTransactions(syncedTransactions)
      setEmployeeExpenses(syncedExpenses)
      setCorporateIncome(syncedIncome)

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setAmount(value)
  }

  const handleEditingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setEditingAmount(value)
  }

  const handleExpenseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setExpenseAmount(value)
  }

  const handleIncomeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setIncomeAmount(value)
  }

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setExchangeRate(value)
  }

  // Calculate payroll tax and CPP for owner salary
  const calculatePayrollTaxes = (amount: number, type: "owner_salary" | "expense") => {
    let federalTax = 0
    let provincialTax = 0
    let cppPayment = 0

    if (type === "owner_salary") {
      federalTax = amount * TAX_RATES.FEDERAL_CORPORATE_TAX_RATE
      provincialTax = amount * TAX_RATES.ONTARIO_CORPORATE_TAX_RATE
      cppPayment = amount * TAX_RATES.CPP_RATE
    }

    return { federalTax, provincialTax, cppPayment }
  }

  // Calculate corporate tax based on income minus owner salary
  const calculateCorporateTax = () => {
    // Total corporate income in CAD
    const totalIncome = corporateIncome.reduce((sum, i) => sum + i.cadAmount, 0)

    // Total owner salary (deductible expense)
    const totalOwnerSalary = transactions.filter((t) => t.type === "owner_salary").reduce((sum, t) => sum + t.amount, 0)

    // Taxable income (income minus owner salary)
    const taxableIncome = Math.max(0, totalIncome - totalOwnerSalary)

    // Calculate federal and provincial corporate tax
    const federalCorporateTax = taxableIncome * TAX_RATES.FEDERAL_CORPORATE_TAX_RATE
    const provincialCorporateTax = taxableIncome * TAX_RATES.ONTARIO_CORPORATE_TAX_RATE
    const totalCorporateTax = federalCorporateTax + provincialCorporateTax

    return {
      taxableIncome,
      federalCorporateTax,
      provincialCorporateTax,
      totalCorporateTax,
    }
  }

  // Update the handleSubmit function to use the gross amount calculation
  // Find the handleSubmit function and update it

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) return

    const netAmountValue = Number.parseFloat(amount)

    // Calculate gross amount and taxes
    const { grossAmount, federalTax, provincialTax, cppPayment } = calculateGrossFromNet(
      netAmountValue,
      userPreferences.annualIncome || 50000,
      userPreferences.province || "ON",
    )

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: transactionDate,
      amount: grossAmount, // Store the gross amount
      netAmount: netAmountValue, // Store the net amount too
      type: transactionType,
      notes: notes,
      federalTax,
      provincialTax,
      cppPayment,
    }

    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    setAmount("")
    setNotes("")

    // Save the last transaction date to user preferences
    const updatedPrefs = {
      ...userPreferences,
      lastTransactionDate: transactionDate,
    }
    setUserPreferences(updatedPrefs)
    await saveUserPreferences(updatedPrefs)

    // Sync with Supabase
    await syncTransactions(updatedTransactions)
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!expenseAmount || Number.parseFloat(expenseAmount) <= 0) return

    const amountValue = Number.parseFloat(expenseAmount)

    const newExpense: EmployeeExpense = {
      id: Date.now().toString(),
      date: expenseDate,
      amount: amountValue,
      currency: expenseCurrency,
      type: expenseType,
      notes: expenseNotes,
    }

    const updatedExpenses = [...employeeExpenses, newExpense]
    setEmployeeExpenses(updatedExpenses)
    setExpenseAmount("")
    setExpenseNotes("")

    // Save the last expense date to user preferences
    const updatedPrefs = {
      ...userPreferences,
      lastExpenseDate: expenseDate,
    }
    setUserPreferences(updatedPrefs)
    await saveUserPreferences(updatedPrefs)

    // Sync with Supabase
    await syncEmployeeExpenses(updatedExpenses)
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!incomeAmount || Number.parseFloat(incomeAmount) <= 0) return
    if (!exchangeRate || Number.parseFloat(exchangeRate) <= 0) return

    const amountValue = Number.parseFloat(incomeAmount)
    const rateValue = Number.parseFloat(exchangeRate)

    // Calculate CAD amount based on currency and exchange rate
    const cadAmount = incomeCurrency === "CAD" ? amountValue : amountValue * rateValue

    const newIncome: CorporateIncome = {
      id: Date.now().toString(),
      date: incomeDate,
      amount: amountValue,
      currency: incomeCurrency,
      exchangeRate: rateValue,
      cadAmount: cadAmount,
      clientName: clientName,
      notes: incomeNotes,
    }

    const updatedIncome = [...corporateIncome, newIncome]
    setCorporateIncome(updatedIncome)
    setIncomeAmount("")
    setClientName("")
    setIncomeNotes("")

    // Save the last income date to user preferences
    const updatedPrefs = {
      ...userPreferences,
      lastIncomeDate: incomeDate,
    }
    setUserPreferences(updatedPrefs)
    await saveUserPreferences(updatedPrefs)

    // Sync with Supabase
    await syncCorporateIncome(updatedIncome)
  }

  // Start editing a transaction
  const startEditingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id)
    setEditingDate(transaction.date)
    setEditingAmount(transaction.amount.toString())
    setEditingType(transaction.type)
  }

  // Cancel editing a transaction
  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
  }

  // Save edited transaction
  const saveEditedTransaction = async (id: string, notes: string) => {
    if (!editingAmount || Number.parseFloat(editingAmount) <= 0) return

    const amountValue = Number.parseFloat(editingAmount)
    const { federalTax, provincialTax, cppPayment } = calculatePayrollTaxes(amountValue, editingType)

    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        return {
          ...transaction,
          date: editingDate,
          amount: amountValue,
          type: editingType,
          federalTax,
          provincialTax,
          cppPayment,
        }
      }
      return transaction
    })

    setTransactions(updatedTransactions)
    setEditingTransactionId(null)

    // Sync with Supabase
    await syncTransactions(updatedTransactions)
  }

  // Delete individual transaction handlers
  const deleteTransaction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)
      setTransactions(updatedTransactions)

      // Delete from Supabase
      await deleteTransactionFromSupabase(id)
    }
  }

  const deleteExpense = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      const updatedExpenses = employeeExpenses.filter((expense) => expense.id !== id)
      setEmployeeExpenses(updatedExpenses)

      // Delete from Supabase
      await deleteExpenseFromSupabase(id)
    }
  }

  const deleteIncome = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      const updatedIncome = corporateIncome.filter((income) => income.id !== id)
      setCorporateIncome(updatedIncome)

      // Delete from Supabase
      await deleteIncomeFromSupabase(id)
    }
  }

  const clearAllTransactions = async () => {
    if (window.confirm("Are you sure you want to clear all transactions? This cannot be undone.")) {
      setTransactions([])

      // Clear from Supabase
      await clearAllTransactionsFromSupabase()
    }
  }

  const clearAllExpenses = async () => {
    if (window.confirm("Are you sure you want to clear all employee expenses? This cannot be undone.")) {
      setEmployeeExpenses([])

      // Clear from Supabase
      await clearAllExpensesFromSupabase()
    }
  }

  const clearAllIncome = async () => {
    if (window.confirm("Are you sure you want to clear all corporate income records? This cannot be undone.")) {
      setCorporateIncome([])

      // Clear from Supabase
      await clearAllIncomeFromSupabase()
    }
  }

  // Export data to CSV
  const handleExportAll = () => {
    exportAllToCSV(transactions, employeeExpenses, corporateIncome)
  }

  const handleExportTransactions = () => {
    const csv = exportTransactionsToCSV(transactions)
    downloadCSV(csv, `haos-tax-tracker-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const handleExportExpenses = () => {
    const csv = exportExpensesToCSV(employeeExpenses)
    downloadCSV(csv, `haos-tax-tracker-expenses-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const handleExportIncome = () => {
    const csv = exportIncomeToCSV(corporateIncome)
    downloadCSV(csv, `haos-tax-tracker-income-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  // Calculate totals for corporate transactions
  const totalOwnerSalary = transactions.filter((t) => t.type === "owner_salary").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const totalFederalTax = transactions.reduce((sum, t) => sum + t.federalTax, 0)
  const totalProvincialTax = transactions.reduce((sum, t) => sum + t.provincialTax, 0)
  const totalCPP = transactions.reduce((sum, t) => sum + t.cppPayment, 0)
  const totalPayrollTaxOwed = totalFederalTax + totalProvincialTax + totalCPP

  // Calculate corporate tax
  const corporateTax = calculateCorporateTax()

  // Calculate running totals for each transaction
  const transactionsWithRunningTotals = transactions
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((transaction, index, array) => {
      const previousTransactions = array.slice(0, index + 1)
      const runningFederalTax = previousTransactions.reduce((sum, t) => sum + t.federalTax, 0)
      const runningProvincialTax = previousTransactions.reduce((sum, t) => sum + t.provincialTax, 0)
      const runningCPP = previousTransactions.reduce((sum, t) => sum + t.cppPayment, 0)
      const runningTotal = runningFederalTax + runningProvincialTax + runningCPP

      return {
        ...transaction,
        runningFederalTax,
        runningProvincialTax,
        runningCPP,
        runningTotal,
      }
    })

  // Calculate totals for employee expenses by type and currency
  const expenseTotals = {
    CAD: {
      flight: employeeExpenses
        .filter((e) => e.currency === "CAD" && e.type === "flight")
        .reduce((sum, e) => sum + e.amount, 0),
      hotel: employeeExpenses
        .filter((e) => e.currency === "CAD" && e.type === "hotel")
        .reduce((sum, e) => sum + e.amount, 0),
      meals: employeeExpenses
        .filter((e) => e.currency === "CAD" && e.type === "meals")
        .reduce((sum, e) => sum + e.amount, 0),
      technology: employeeExpenses
        .filter((e) => e.currency === "CAD" && e.type === "technology")
        .reduce((sum, e) => sum + e.amount, 0),
      total: employeeExpenses.filter((e) => e.currency === "CAD").reduce((sum, e) => sum + e.amount, 0),
    },
    USD: {
      flight: employeeExpenses
        .filter((e) => e.currency === "USD" && e.type === "flight")
        .reduce((sum, e) => sum + e.amount, 0),
      hotel: employeeExpenses
        .filter((e) => e.currency === "USD" && e.type === "hotel")
        .reduce((sum, e) => sum + e.amount, 0),
      meals: employeeExpenses
        .filter((e) => e.currency === "USD" && e.type === "meals")
        .reduce((sum, e) => sum + e.amount, 0),
      technology: employeeExpenses
        .filter((e) => e.currency === "USD" && e.type === "technology")
        .reduce((sum, e) => sum + e.amount, 0),
      total: employeeExpenses.filter((e) => e.currency === "USD").reduce((sum, e) => sum + e.amount, 0),
    },
  }

  // Calculate totals for corporate income
  const incomeTotals = {
    CAD: corporateIncome.filter((i) => i.currency === "CAD").reduce((sum, i) => sum + i.amount, 0),
    USD: corporateIncome.filter((i) => i.currency === "USD").reduce((sum, i) => sum + i.amount, 0),
    totalCAD: corporateIncome.reduce((sum, i) => sum + i.cadAmount, 0),
  }

  // Add these functions inside the TransactionTracker component, before the return statement

  // Open transaction detail
  const openTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsTransactionDetailOpen(true)
  }

  // Update transaction
  const updateTransaction = async (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))

    setTransactions(updatedTransactions)

    // Sync with Supabase
    await syncTransactions(updatedTransactions)

    // Close the detail view
    setIsTransactionDetailOpen(false)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <SidebarLayout
      sidebarContent={
        <>
          <div className="px-4 py-6">
            <h2 className="mb-2 font-semibold">{businessName}</h2>
            <p className="text-sm text-muted-foreground">Manage your business finances and track tax obligations.</p>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
            <Collapsible className="w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  Explainer
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4">
                <p className="text-sm text-muted-foreground">Detailed explanations of tax calculations.</p>
              </CollapsibleContent>
            </Collapsible>
            <Button variant="ghost" className="w-full justify-start">
              Tax Rates
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
          </div>
          <div className="mt-6 px-4 space-y-2">
            <Button
              variant="outline"
              onClick={syncDataWithSupabase}
              disabled={isSyncing}
              className={cn(
                "w-full flex items-center gap-2",
                syncStatus === "success" && "text-green-600",
                syncStatus === "error" && "text-red-600",
              )}
            >
              {syncStatus === "idle" && "Sync Data"}
              {syncStatus === "syncing" && "Syncing..."}
              {syncStatus === "success" && "Synced!"}
              {syncStatus === "error" && "Sync Failed"}
            </Button>
            <Button variant="outline" onClick={handleExportAll} className="w-full flex items-center gap-2">
              Export All
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full flex items-center gap-2">
              Logout
            </Button>
          </div>
        </>
      }
    >
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center">Hao's Business Tracker</h1>
        </div>

        <Tabs defaultValue="corporate" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="corporate">Corporate Transactions</TabsTrigger>
            <TabsTrigger value="income">Corporate Income</TabsTrigger>
            <TabsTrigger value="employee">Employee Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="corporate">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Transaction</CardTitle>
                  <CardDescription>Record money transferred to yourself and calculate tax obligations</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Net Amount ($CAD)</Label>
                      <Input id="amount" placeholder="0.00" value={amount} onChange={handleAmountChange} />
                      <p className="text-xs text-muted-foreground">
                        Enter the actual amount received by the employee (after-tax amount)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Transaction Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !transactionDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {transactionDate ? format(transactionDate, "MMMM d, yyyy") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CustomCalendar
                            mode="single"
                            selected={transactionDate}
                            onSelect={(date) => date && setTransactionDate(date)}
                            defaultMonth={transactionDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Transaction Type</Label>
                      <RadioGroup
                        value={transactionType}
                        onValueChange={(value) => setTransactionType(value as "owner_salary" | "expense")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="owner_salary" id="owner_salary" />
                          <Label htmlFor="owner_salary">Owner Salary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expense" id="expense" />
                          <Label htmlFor="expense">Expense</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add details about this transaction"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {transactionType === "owner_salary" && amount && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Payroll Tax Calculation Preview</h4>
                        {userPreferences.annualIncome ? (
                          <div className="space-y-1 text-sm">
                            <p className="flex justify-between">
                              <span>Net Amount (Take-home):</span>
                              <span>${Number.parseFloat(amount || "0").toFixed(2)}</span>
                            </p>
                            {(() => {
                              const netAmount = Number.parseFloat(amount || "0")
                              const { grossAmount, federalTax, provincialTax, cppPayment, totalDeductions } =
                                calculateGrossFromNet(
                                  netAmount,
                                  userPreferences.annualIncome || 50000,
                                  userPreferences.province || "ON",
                                )
                              return (
                                <>
                                  <p className="flex justify-between font-medium">
                                    <span>Gross Amount (Before Tax):</span>
                                    <span>${grossAmount.toFixed(2)}</span>
                                  </p>
                                  <div className="border-t pt-1 mt-1">
                                    <p className="flex justify-between">
                                      <span>
                                        Federal Tax (based on ${userPreferences.annualIncome.toLocaleString()} annual
                                        income):
                                      </span>
                                      <span>${federalTax.toFixed(2)}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span>Provincial Tax ({userPreferences.province || "ON"}):</span>
                                      <span>${provincialTax.toFixed(2)}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span>CPP (11.9%):</span>
                                      <span>${cppPayment.toFixed(2)}</span>
                                    </p>
                                  </div>
                                  <div className="border-t pt-1 mt-1">
                                    <p className="flex justify-between font-medium">
                                      <span>Total Deductions:</span>
                                      <span>${totalDeductions.toFixed(2)}</span>
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Tax rates are based on your projected annual income, not this individual
                                    transaction.
                                  </p>
                                </>
                              )
                            })()}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="text-amber-600">
                              Please set your annual income in Settings to see tax calculations.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Add Transaction
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payroll Tax Obligations</CardTitle>
                    <CardDescription>Total amounts owed for owner salary payments</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportTransactions}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Transaction Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Owner Salary</p>
                        <p className="text-2xl font-bold">${totalOwnerSalary.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Payroll Tax Obligations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Federal Payroll Tax (9%)</p>
                        <p className="text-2xl font-bold">${totalFederalTax.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Payable to CRA as payroll tax</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Ontario Payroll Tax (3.2%)</p>
                        <p className="text-2xl font-bold">${totalProvincialTax.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Payable to Ontario as provincial tax</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">CPP Obligations</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">CPP Contributions (11.9%)</p>
                      <p className="text-2xl font-bold">${totalCPP.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Self-employed CPP contributions payable to CRA
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg mt-4">
                    <p className="text-sm font-medium">Total Payroll Tax Owed</p>
                    <p className="text-3xl font-bold">${totalPayrollTaxOwed.toFixed(2)}</p>
                    <div className="mt-2 text-sm">
                      <p className="flex justify-between">
                        <span>Payroll Taxes:</span> <span>${(totalFederalTax + totalProvincialTax).toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>CPP Contributions:</span> <span>${totalCPP.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Record of all your corporate transactions and associated obligations</CardDescription>
              </CardHeader>

              <CardContent>
                {transactionsWithRunningTotals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Gross Amount</TableHead>
                          <TableHead className="text-right">Net Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsWithRunningTotals.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openTransactionDetail(transaction)}
                          >
                            <TableCell>{format(transaction.date, "MMMM d, yyyy")}</TableCell>
                            <TableCell>{transaction.type === "owner_salary" ? "Owner Salary" : "Expense"}</TableCell>
                            <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${transaction.netAmount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other TabsContent components here */}
        </Tabs>
      </div>

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          isOpen={isTransactionDetailOpen}
          onClose={() => setIsTransactionDetailOpen(false)}
          onDelete={deleteTransaction}
          onUpdate={updateTransaction}
          userPreferences={{
            annualIncome: userPreferences.annualIncome,
            province: userPreferences.province,
          }}
        />
      )}
    </SidebarLayout>
  )
}
