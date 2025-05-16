import { supabase, getUserId } from "./supabase"
import type { Transaction, EmployeeExpense, CorporateIncome, UserPreferences } from "@/types/schema"

// Convert Date objects to ISO strings for Supabase
const prepareTransactionForStorage = (transaction: Transaction, userId: string) => ({
  id: transaction.id,
  date: transaction.date.toISOString(),
  amount: transaction.amount,
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

// Save user preferences
export const saveUserPreferences = async (preferences: UserPreferences) => {
  const userId = await getUserId()

  const { data, error } = await supabase.from("user_preferences").upsert({
    user_id: userId,
    last_transaction_date: preferences.lastTransactionDate?.toISOString(),
    last_expense_date: preferences.lastExpenseDate?.toISOString(),
    last_income_date: preferences.lastIncomeDate?.toISOString(),
  })

  if (error) {
    console.error("Error saving user preferences:", error)
    return false
  }

  return true
}

// Get user preferences
export const getUserPreferences = async (): Promise<UserPreferences> => {
  const userId = await getUserId()

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user preferences:", error)
    return {}
  }

  return {
    lastTransactionDate: data.last_transaction_date ? new Date(data.last_transaction_date) : undefined,
    lastExpenseDate: data.last_expense_date ? new Date(data.last_expense_date) : undefined,
    lastIncomeDate: data.last_income_date ? new Date(data.last_income_date) : undefined,
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
