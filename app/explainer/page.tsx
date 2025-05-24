"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserPreferences } from "@/lib/data-sync"

export default function ExplainerPage() {
  const [businessName, setBusinessName] = useState("Your Business")
  const [employeeName, setEmployeeName] = useState("Hao")

  // Load business and employee names from user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences()
      if (prefs.businessName) {
        setBusinessName(prefs.businessName)
      }
      if (prefs.employeeName) {
        setEmployeeName(prefs.employeeName)
      }
    }

    loadPreferences()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tax Calculation Explainer</h1>
        <p className="text-muted-foreground">A comprehensive guide to how {businessName} calculates tax obligations</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This document explains the tax calculation logic used in this application. Please consult with a qualified
          accountant for professional tax advice.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Taxes</TabsTrigger>
          <TabsTrigger value="corporate">Corporate Tax</TabsTrigger>
          <TabsTrigger value="expenses">Employee Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation Overview</CardTitle>
              <CardDescription>How the application tracks and calculates tax obligations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This application tracks three main types of financial data for {businessName}:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Corporate Transactions:</strong> Money transferred to the owner ({employeeName}) as salary or
                  other corporate expenses.
                </li>
                <li>
                  <strong>Corporate Income:</strong> Revenue received from clients in CAD or USD.
                </li>
                <li>
                  <strong>Employee Expenses:</strong> Business expenses incurred by {employeeName} as an employee.
                </li>
              </ol>

              <div className="p-4 bg-muted rounded-lg mt-4">
                <h3 className="font-medium mb-2">Key Tax Calculations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Payroll Taxes:</strong> Federal and provincial taxes on owner salary payments.
                  </li>
                  <li>
                    <strong>CPP Contributions:</strong> Canada Pension Plan contributions for self-employed individuals.
                  </li>
                  <li>
                    <strong>Corporate Income Tax:</strong> Tax on corporate profits (income minus expenses).
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Flow</CardTitle>
              <CardDescription>How information moves through the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>User enters transactions, income, or expenses</li>
                  <li>Application calculates tax implications in real-time</li>
                  <li>Data is stored locally and synced to cloud database</li>
                  <li>Running totals are maintained for all tax obligations</li>
                  <li>Reports can be exported as CSV files</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Tax Calculation</CardTitle>
              <CardDescription>How owner salary payments are taxed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                When {businessName} pays {employeeName} as the owner, the application calculates the following tax
                obligations:
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Federal Payroll Tax</h3>
                <p className="mb-2">Federal payroll tax is calculated at 15% of the gross salary amount.</p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Federal Tax = Salary Amount × 0.15</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Ontario Provincial Tax</h3>
                <p className="mb-2">Ontario provincial tax is calculated at 3.2% of the gross salary amount.</p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Provincial Tax = Salary Amount × 0.032</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">CPP Contributions</h3>
                <p className="mb-2">
                  As a self-employed individual, {employeeName} must contribute both the employee and employer portions
                  of CPP, totaling 10.95% for 2024.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">CPP Contribution = Salary Amount × 0.1095</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Total Payroll Tax Obligation</h3>
                <p className="mb-2">
                  The total amount that must be remitted to tax authorities is the sum of all three components.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Total Remittance = Federal Tax + Provincial Tax + CPP Contribution</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These calculations are simplified for tracking purposes. Actual tax filings may require additional
                  adjustments based on specific circumstances.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corporate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Tax Calculation</CardTitle>
              <CardDescription>How business income is taxed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Corporate tax is calculated on the taxable income of {businessName}, which is the total revenue minus
                eligible expenses (including owner salary).
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Taxable Income Calculation</h3>
                <p className="mb-2">
                  Taxable income is determined by subtracting eligible expenses from total revenue.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Taxable Income = Total Revenue - Owner Salary - Other Expenses</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Federal Corporate Tax</h3>
                <p className="mb-2">
                  Federal corporate tax for small businesses is calculated at 15% of taxable income.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Federal Corporate Tax = Taxable Income × 0.15</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Ontario Provincial Corporate Tax</h3>
                <p className="mb-2">
                  Ontario provincial corporate tax for small businesses is calculated at 3.2% of taxable income.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Provincial Corporate Tax = Taxable Income × 0.032</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Total Corporate Tax</h3>
                <p className="mb-2">
                  The total corporate tax obligation is the sum of federal and provincial corporate taxes.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Total Corporate Tax = Federal Corporate Tax + Provincial Corporate Tax</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Small business tax rates apply to Canadian-controlled private corporations (CCPCs) with taxable
                  capital employed in Canada of less than $10 million and taxable income eligible for the small business
                  deduction.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Expenses Tracking</CardTitle>
              <CardDescription>How business expenses are tracked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The application tracks expenses incurred by {employeeName} as an employee of {businessName}. These
                expenses are categorized and tracked in both CAD and USD.
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Expense Categories</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Flight:</strong> Air travel expenses
                  </li>
                  <li>
                    <strong>Hotel:</strong> Accommodation expenses
                  </li>
                  <li>
                    <strong>Meals:</strong> Food and dining expenses
                  </li>
                  <li>
                    <strong>Technology:</strong> Equipment and software expenses
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Tax Implications</h3>
                <p>
                  Employee expenses are tracked for record-keeping purposes but do not directly affect tax calculations
                  in this application. In practice, these expenses may be:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Deductible business expenses for the corporation</li>
                  <li>Subject to GST/HST input tax credits</li>
                  <li>Reportable on T2200 forms for employee tax returns</li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Consult with an accountant to determine the proper tax treatment of employee expenses based on your
                  specific situation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
