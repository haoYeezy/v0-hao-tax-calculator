"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomCalendar } from "@/components/custom-calendar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Transaction } from "@/types/schema"
import { calculateGrossFromNet } from "@/lib/tax-calculator"

interface TransactionDetailProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
  onUpdate: (updatedTransaction: Transaction) => Promise<void>
  userPreferences: {
    annualIncome?: number
    province?: string
  }
}

export function TransactionDetail({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  userPreferences,
}: TransactionDetailProps) {
  // State for editing
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form state
  const [editDate, setEditDate] = useState<Date>(transaction.date)
  const [editAmount, setEditAmount] = useState<string>(transaction.netAmount.toString())
  const [editType, setEditType] = useState<"owner_salary" | "expense">(transaction.type)
  const [editNotes, setEditNotes] = useState<string>(transaction.notes)

  // Handle amount change (only allow numbers and decimal points)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setEditAmount(value)
  }

  // Handle save
  const handleSave = async () => {
    if (!editAmount || Number.parseFloat(editAmount) <= 0) return

    const netAmountValue = Number.parseFloat(editAmount)

    // Calculate gross amount and taxes
    const { grossAmount, federalTax, provincialTax, cppPayment } = calculateGrossFromNet(
      netAmountValue,
      userPreferences.annualIncome || 50000,
      userPreferences.province || "ON",
    )

    const updatedTransaction: Transaction = {
      ...transaction,
      date: editDate, // Use the edited date
      amount: grossAmount,
      netAmount: netAmountValue,
      type: editType,
      notes: editNotes,
      federalTax,
      provincialTax,
      cppPayment,
    }

    await onUpdate(updatedTransaction)
    setIsEditing(false)
  }

  // Handle delete
  const handleDelete = async () => {
    await onDelete(transaction.id)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  // Calculate tax rates
  const federalRate = transaction.federalTax / transaction.amount
  const provincialRate = transaction.provincialTax / transaction.amount
  const cppRate = transaction.cppPayment / transaction.amount
  const totalRate = federalRate + provincialRate + cppRate

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Edit Transaction" : "Transaction Details"}</SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Make changes to this transaction"
                : `Viewing transaction from ${format(transaction.date, "MMMM d, yyyy")}`}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            {!isEditing ? (
              // View mode
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Transaction Information</h3>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      aria-label="Edit transaction"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p>{format(transaction.date, "MMMM d, yyyy")}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p>{transaction.type === "owner_salary" ? "Owner Salary" : "Expense"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Net Amount (Take-home)</p>
                    <p>${transaction.netAmount.toFixed(2)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Gross Amount (Before Tax)</p>
                    <p>${transaction.amount.toFixed(2)}</p>
                  </div>

                  {transaction.notes && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p>{transaction.notes}</p>
                    </div>
                  )}
                </div>

                {transaction.type === "owner_salary" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tax Calculation</h3>
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Federal Tax (based on annual income of $
                          {userPreferences.annualIncome?.toLocaleString() || "unknown"})
                        </span>
                        <span>${transaction.federalTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Provincial Tax ({userPreferences.province || "ON"})</span>
                        <span>${transaction.provincialTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">CPP (11.9%)</span>
                        <span>${transaction.cppPayment.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                        <span>Total Deductions</span>
                        <span>
                          ${(transaction.federalTax + transaction.provincialTax + transaction.cppPayment).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Tax rates are calculated based on your projected annual income, not this individual transaction.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit mode
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Net Amount ($CAD)</Label>
                  <Input id="edit-amount" placeholder="0.00" value={editAmount} onChange={handleAmountChange} />
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
                          !editDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "MMMM d, yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CustomCalendar
                        mode="single"
                        selected={editDate}
                        onSelect={(date) => date && setEditDate(date)}
                        defaultMonth={editDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <RadioGroup
                    value={editType}
                    onValueChange={(value) => setEditType(value as "owner_salary" | "expense")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner_salary" id="edit_owner_salary" />
                      <Label htmlFor="edit_owner_salary">Owner Salary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="edit_expense" />
                      <Label htmlFor="edit_expense">Expense</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Add details about this transaction"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                {editType === "owner_salary" && editAmount && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Payroll Tax Calculation Preview</h4>
                    {userPreferences.annualIncome ? (
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span>Net Amount (Take-home):</span>
                          <span>${Number.parseFloat(editAmount || "0").toFixed(2)}</span>
                        </p>
                        {(() => {
                          const netAmount = Number.parseFloat(editAmount || "0")
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
                                Tax rates are based on your projected annual income, not this individual transaction.
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
              </div>
            )}
          </div>

          <SheetFooter>
            {isEditing ? (
              <div className="flex w-full space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
              </div>
            ) : (
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </SheetClose>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction and remove it from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
