import type { Transaction, EmployeeExpense, CorporateIncome } from "@/types/schema"

// Helper function to convert date to YYYY-MM-DD format
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

// Export transactions to CSV
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const headers = ["Date", "Type", "Amount", "Federal Tax", "Provincial Tax", "CPP Payment", "Notes"]

  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type,
    t.amount.toFixed(2),
    t.federalTax.toFixed(2),
    t.provincialTax.toFixed(2),
    t.cppPayment.toFixed(2),
    `"${t.notes?.replace(/"/g, '""') || ""}"`,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

// Export employee expenses to CSV
export const exportExpensesToCSV = (expenses: EmployeeExpense[]): string => {
  const headers = ["Date", "Type", "Amount", "Currency", "Notes"]

  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.type,
    e.amount.toFixed(2),
    e.currency,
    `"${e.notes?.replace(/"/g, '""') || ""}"`,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

// Export corporate income to CSV
export const exportIncomeToCSV = (income: CorporateIncome[]): string => {
  const headers = ["Date", "Client", "Amount", "Currency", "Exchange Rate", "CAD Amount", "Notes"]

  const rows = income.map((i) => [
    formatDate(i.date),
    `"${i.clientName?.replace(/"/g, '""') || ""}"`,
    i.amount.toFixed(2),
    i.currency,
    i.exchangeRate.toFixed(2),
    i.cadAmount.toFixed(2),
    `"${i.notes?.replace(/"/g, '""') || ""}"`,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Append to the document, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export all data to a single CSV file
export const exportAllToCSV = (
  transactions: Transaction[],
  expenses: EmployeeExpense[],
  income: CorporateIncome[],
): void => {
  const transactionsCSV = exportTransactionsToCSV(transactions)
  const expensesCSV = exportExpensesToCSV(expenses)
  const incomeCSV = exportIncomeToCSV(income)

  const combinedCSV = [
    "# CORPORATE TRANSACTIONS",
    transactionsCSV,
    "\n\n# EMPLOYEE EXPENSES",
    expensesCSV,
    "\n\n# CORPORATE INCOME",
    incomeCSV,
  ].join("\n")

  downloadCSV(combinedCSV, `haos-tax-tracker-export-${formatDate(new Date())}.csv`)
}
