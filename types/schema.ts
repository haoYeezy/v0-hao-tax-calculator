export type CorporateTransactionType = "owner_salary" | "expense"
export type ExpenseType = "flight" | "hotel" | "meals" | "technology"
export type Currency = "CAD" | "USD"

export interface Transaction {
  id: string
  date: Date
  amount: number
  type: CorporateTransactionType
  notes: string
  federalTax: number
  provincialTax: number
  cppPayment: number
}

export interface EmployeeExpense {
  id: string
  date: Date
  amount: number
  currency: Currency
  type: ExpenseType
  notes: string
}

export interface CorporateIncome {
  id: string
  date: Date
  amount: number
  currency: Currency
  exchangeRate: number
  cadAmount: number
  clientName: string
  notes: string
}

export interface UserPreferences {
  lastTransactionDate?: Date
  lastExpenseDate?: Date
  lastIncomeDate?: Date
}
