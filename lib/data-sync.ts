import { supabase, getUserId } from "./supabase"
import type { Transaction, EmployeeExpense, CorporateIncome, UserPreferences } from "@/types/schema"

// Convert Date objects to ISO strings for Supabase
const prepareTransactionForStorage = (transaction: Transaction, userId: string) => ({
  id: transaction.id,
  date: transaction.date.toISOString(),
  amount: transaction.amount,
  // Remove the net_amount field since it doesn't exist in the database schema
  type: transaction.type,
  notes: transaction.notes,
  federal_tax: transaction.federalTax,
  provincial_tax: transaction.provincialTax,
  cpp_payment: transaction.cppPayment,
  user_id: userId,
})

const prepareExpenseForStorage = (expense: EmployeeExpense, userId: string) => ({
  id: expense.id,
  date: expense.date.toISOString(),
  amount: expense.amount,
  currency: expense.currency,
  type: expense.type,
  notes: expense.notes,
  user_id: userId,
})

const prepareIncomeForStorage = (income: CorporateIncome, userId: string) => ({
  id: income.id,
  date: income.date.toISOString(),
  amount: income.amount,
  currency: income.currency,
  exchange_rate: income.exchangeRate,
  cad_amount: income.cadAmount,
  client_name: income.clientName,
  notes: income.notes,
  user_id: userId,
})

// Convert Supabase data back to our app format
const parseTransactionFromStorage = (data: any): Transaction => ({
  id: data.id,
  date: new Date(data.date),
  amount: Number(data.amount),
  // Calculate netAmount from amount if it's not in the database
  netAmount: data.net_amount ? Number(data.net_amount) : Number(data.amount) * 0.75, // Estimate net as 75% of gross
  type: data.type as "owner_salary" | "expense",
  notes: data.notes || "",
  federalTax: Number(data.federal_tax),
  provincialTax: Number(data.provincial_tax),
  cppPayment: Number(data.cpp_payment),
})

const parseExpenseFromStorage = (data: any): EmployeeExpense => ({
  id: data.id,
  date: new Date(data.date),
  amount: Number(data.amount),
  currency: data.currency as "CAD" | "USD",
  type: data.type as "flight" | "hotel" | "meals" | "technology",
  notes: data.notes || "",
})

const parseIncomeFromStorage = (data: any): CorporateIncome => ({
  id: data.id,
  date: new Date(data.date),
  amount: Number(data.amount),
  currency: data.currency as "CAD" | "USD",
  exchangeRate: Number(data.exchange_rate),
  cadAmount: Number(data.cad_amount),
  clientName: data.client_name || "",
  notes: data.notes || "",
})

// Save user preferences with error handling for missing columns
export const saveUserPreferences = async (preferences: UserPreferences) => {
  const userId = await getUserId()

  // Prepare the data object with only the fields that exist in the database
  const preferencesData: any = {
    user_id: userId,
  }

  // Only add fields if they have values
  if (preferences.lastTransactionDate) {
    preferencesData.last_transaction_date = preferences.lastTransactionDate.toISOString()
  }
  if (preferences.lastExpenseDate) {
    preferencesData.last_expense_date = preferences.lastExpenseDate.toISOString()
  }
  if (preferences.lastIncomeDate) {
    preferencesData.last_income_date = preferences.lastIncomeDate.toISOString()
  }
  if (preferences.businessName) {
    preferencesData.business_name = preferences.businessName
  }
  if (preferences.employeeName) {
    preferencesData.employee_name = preferences.employeeName
  }
  if (preferences.province) {
    preferencesData.province = preferences.province
  }

  // Try to save annual_income, but handle gracefully if column doesn't exist
  if (preferences.annualIncome) {
    try {
      preferencesData.annual_income = preferences.annualIncome
      const { data, error } = await supabase.from("user_preferences").upsert(preferencesData)

      if (error) {
        // If it's a column not found error for annual_income, try without it
        if (error.message.includes("annual_income")) {
          console.warn("annual_income column not found, saving without it")
          delete preferencesData.annual_income
          const { data: retryData, error: retryError } = await supabase.from("user_preferences").upsert(preferencesData)

          if (retryError) {
            console.error("Error saving user preferences (retry):", retryError)
            return false
          }

          // Store annual income in localStorage as fallback
          if (preferences.annualIncome) {
            localStorage.setItem("userAnnualIncome", preferences.annualIncome.toString())
          }

          return true
        } else {
          console.error("Error saving user preferences:", error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error saving user preferences:", error)

      // Fallback: store annual income in localStorage
      if (preferences.annualIncome) {
        localStorage.setItem("userAnnualIncome", preferences.annualIncome.toString())
      }

      // Try to save other preferences without annual_income
      delete preferencesData.annual_income
      try {
        const { data, error } = await supabase.from("user_preferences").upsert(preferencesData)
        if (error) {
          console.error("Error saving user preferences (fallback):", error)
          return false
        }
        return true
      } catch (fallbackError) {
        console.error("Error saving user preferences (fallback):", fallbackError)
        return false
      }
    }
  } else {
    // No annual income to save, proceed normally
    const { data, error } = await supabase.from("user_preferences").upsert(preferencesData)

    if (error) {
      console.error("Error saving user preferences:", error)
      return false
    }

    return true
  }
}

// Get user preferences with fallback for annual income
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const userId = await getUserId()

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId)

    // Instead of using .single(), we'll handle the response manually
    if (error) {
      console.error("Error fetching user preferences:", error)
      // Return preferences with localStorage fallback for annual income
      const fallbackAnnualIncome = localStorage.getItem("userAnnualIncome")
      return {
        annualIncome: fallbackAnnualIncome ? Number(fallbackAnnualIncome) : undefined,
      }
    }

    // If no data or empty array, return empty preferences with localStorage fallback
    if (!data || data.length === 0) {
      const fallbackAnnualIncome = localStorage.getItem("userAnnualIncome")
      return {
        annualIncome: fallbackAnnualIncome ? Number(fallbackAnnualIncome) : undefined,
      }
    }

    // Use the first record if multiple exist
    const prefs = data[0]

    // Get annual income from database or localStorage fallback
    let annualIncome = prefs.annual_income ? Number(prefs.annual_income) : undefined
    if (!annualIncome) {
      const fallbackAnnualIncome = localStorage.getItem("userAnnualIncome")
      annualIncome = fallbackAnnualIncome ? Number(fallbackAnnualIncome) : undefined
    }

    return {
      lastTransactionDate: prefs.last_transaction_date ? new Date(prefs.last_transaction_date) : undefined,
      lastExpenseDate: prefs.last_expense_date ? new Date(prefs.last_expense_date) : undefined,
      lastIncomeDate: prefs.last_income_date ? new Date(prefs.last_income_date) : undefined,
      businessName: prefs.business_name || undefined,
      employeeName: prefs.employee_name || undefined,
      province: prefs.province || undefined,
      annualIncome: annualIncome,
    }
  } catch (error) {
    console.error("Error in getUserPreferences:", error)
    // Return preferences with localStorage fallback for annual income
    const fallbackAnnualIncome = localStorage.getItem("userAnnualIncome")
    return {
      annualIncome: fallbackAnnualIncome ? Number(fallbackAnnualIncome) : undefined,
    }
  }
}

// Sync transactions with Supabase
export const syncTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
  const userId = await getUserId()

  // First, get all transactions for this user
  const { data: existingData, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)

  if (fetchError) {
    console.error("Error fetching transactions:", fetchError)
    return transactions
  }

  // Convert to our app format
  const existingTransactions = existingData?.map(parseTransactionFromStorage) || []

  // Merge local and remote data
  // For simplicity, we'll use the ID to determine if a transaction exists
  const mergedTransactions = [...transactions]

  // Add any remote transactions not in local storage
  existingTransactions.forEach((remoteTransaction) => {
    if (!mergedTransactions.some((t) => t.id === remoteTransaction.id)) {
      mergedTransactions.push(remoteTransaction)
    }
  })

  // Save all transactions back to Supabase
  const { error: upsertError } = await supabase
    .from("transactions")
    .upsert(mergedTransactions.map((t) => prepareTransactionForStorage(t, userId)))

  if (upsertError) {
    console.error("Error syncing transactions:", upsertError)
  }

  return mergedTransactions
}

// Sync employee expenses with Supabase
export const syncEmployeeExpenses = async (expenses: EmployeeExpense[]): Promise<EmployeeExpense[]> => {
  const userId = await getUserId()

  // First, get all expenses for this user
  const { data: existingData, error: fetchError } = await supabase
    .from("employee_expenses")
    .select("*")
    .eq("user_id", userId)

  if (fetchError) {
    console.error("Error fetching employee expenses:", fetchError)
    return expenses
  }

  // Convert to our app format
  const existingExpenses = existingData?.map(parseExpenseFromStorage) || []

  // Merge local and remote data
  const mergedExpenses = [...expenses]

  // Add any remote expenses not in local storage
  existingExpenses.forEach((remoteExpense) => {
    if (!mergedExpenses.some((e) => e.id === remoteExpense.id)) {
      mergedExpenses.push(remoteExpense)
    }
  })

  // Save all expenses back to Supabase
  const { error: upsertError } = await supabase
    .from("employee_expenses")
    .upsert(mergedExpenses.map((e) => prepareExpenseForStorage(e, userId)))

  if (upsertError) {
    console.error("Error syncing employee expenses:", upsertError)
  }

  return mergedExpenses
}

// Sync corporate income with Supabase
export const syncCorporateIncome = async (income: CorporateIncome[]): Promise<CorporateIncome[]> => {
  const userId = await getUserId()

  // First, get all income records for this user
  const { data: existingData, error: fetchError } = await supabase
    .from("corporate_income")
    .select("*")
    .eq("user_id", userId)

  if (fetchError) {
    console.error("Error fetching corporate income:", fetchError)
    return income
  }

  // Convert to our app format
  const existingIncome = existingData?.map(parseIncomeFromStorage) || []

  // Merge local and remote data
  const mergedIncome = [...income]

  // Add any remote income not in local storage
  existingIncome.forEach((remoteIncome) => {
    if (!mergedIncome.some((i) => i.id === remoteIncome.id)) {
      mergedIncome.push(remoteIncome)
    }
  })

  // Save all income back to Supabase
  const { error: upsertError } = await supabase
    .from("corporate_income")
    .upsert(mergedIncome.map((i) => prepareIncomeForStorage(i, userId)))

  if (upsertError) {
    console.error("Error syncing corporate income:", upsertError)
  }

  return mergedIncome
}

// Delete a transaction from Supabase
export const deleteTransactionFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting transaction:", error)
    return false
  }

  return true
}

// Delete an expense from Supabase
export const deleteExpenseFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("employee_expenses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting expense:", error)
    return false
  }

  return true
}

// Delete an income record from Supabase
export const deleteIncomeFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("corporate_income").delete().eq("id", id)

  if (error) {
    console.error("Error deleting income:", error)
    return false
  }

  return true
}

// Clear all transactions for a user
export const clearAllTransactionsFromSupabase = async (): Promise<boolean> => {
  const userId = await getUserId()

  const { error } = await supabase.from("transactions").delete().eq("user_id", userId)

  if (error) {
    console.error("Error clearing transactions:", error)
    return false
  }

  return true
}

// Clear all expenses for a user
export const clearAllExpensesFromSupabase = async (): Promise<boolean> => {
  const userId = await getUserId()

  const { error } = await supabase.from("employee_expenses").delete().eq("user_id", userId)

  if (error) {
    console.error("Error clearing expenses:", error)
    return false
  }

  return true
}

// Clear all income for a user
export const clearAllIncomeFromSupabase = async (): Promise<boolean> => {
  const userId = await getUserId()

  const { error } = await supabase.from("corporate_income").delete().eq("user_id", userId)

  if (error) {
    console.error("Error clearing income:", error)
    return false
  }

  return true
}
