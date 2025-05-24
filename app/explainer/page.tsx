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
  const [province, setProvince] = useState("Ontario")
  const [annualIncome, setAnnualIncome] = useState<number | undefined>()

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
      if (prefs.province) {
        // Convert province code to full name
        const provinceNames: Record<string, string> = {
          AB: "Alberta",
          BC: "British Columbia",
          MB: "Manitoba",
          NB: "New Brunswick",
          NL: "Newfoundland and Labrador",
          NS: "Nova Scotia",
          ON: "Ontario",
          PE: "Prince Edward Island",
          QC: "Quebec",
          SK: "Saskatchewan",
        }
        setProvince(provinceNames[prefs.province] || "Ontario")
      }
      if (prefs.annualIncome) {
        setAnnualIncome(prefs.annualIncome)
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Taxes</TabsTrigger>
          <TabsTrigger value="personal">Personal Income Tax</TabsTrigger>
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
                    <strong>Personal Income Tax:</strong> Federal and provincial taxes on owner salary based on personal
                    tax rates determined by your projected annual income.
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
                <h3 className="font-medium mb-2">Net vs. Gross Salary</h3>
                <p className="mb-2">
                  This application allows you to enter the <strong>net amount</strong> (take-home pay) and automatically
                  calculates the <strong>gross amount</strong> (before-tax salary) that needs to be paid to achieve that
                  net amount.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Gross Salary = Net Salary ÷ (1 - Combined Tax Rate)</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  The combined tax rate includes federal and provincial income tax plus CPP contributions.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Federal Income Tax</h3>
                <p className="mb-2">
                  Federal income tax is calculated using the marginal tax rate based on your projected annual income.
                  This ensures that the tax calculation accurately reflects your tax bracket.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Federal Tax = Gross Salary × Marginal Federal Tax Rate</p>
                </div>
                <p className="mt-2 text-sm">
                  For example, if your annual income is $75,000, you would be in the 20.5% federal tax bracket (for
                  income between $55,867 and $111,733 in 2024).
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{province} Provincial Tax</h3>
                <p className="mb-2">
                  Provincial tax is also calculated using the marginal tax rate based on your projected annual income,
                  using the tax brackets for your province.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Provincial Tax = Gross Salary × Marginal Provincial Tax Rate</p>
                </div>
                <p className="mt-2 text-sm">
                  For example, if your annual income is $75,000 in Ontario, you would be in the 9.15% provincial tax
                  bracket (for income between $49,231 and $98,463 in 2024).
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">CPP Contributions</h3>
                <p className="mb-2">
                  As a self-employed individual, {employeeName} must contribute both the employee and employer portions
                  of CPP, totaling 11.9% for 2024.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">CPP Contribution = Gross Salary × 0.119</p>
                </div>
                <p className="mt-2 text-sm">
                  CPP contributions are subject to a maximum annual contribution based on the Year's Maximum Pensionable
                  Earnings (YMPE), which is $68,500 for 2024.
                </p>
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
                  <p>
                    <strong>Important:</strong> This application uses your projected annual income (set in Settings) to
                    determine the appropriate tax brackets. This ensures that your tax calculations are based on your
                    actual tax situation, not just the individual transaction amounts.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Income Tax Calculation</CardTitle>
              <CardDescription>How personal income tax is calculated for net-to-gross conversion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This application uses personal income tax rates to calculate the gross salary amount needed to achieve a
                desired net (take-home) pay. The calculation is based on:
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Annual Income Setting</h3>
                <p className="mb-2">
                  Your anticipated annual income ({annualIncome ? `$${annualIncome.toLocaleString()}` : "not set"})
                  determines which tax brackets apply to your income.
                </p>
                <p className="text-sm text-muted-foreground">
                  This setting can be adjusted in the Settings page and affects all tax calculations.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Federal Income Tax Brackets (2024)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Income Range</th>
                        <th className="text-right py-2">Tax Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">$0 to $55,867</td>
                        <td className="text-right">15%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">$55,867 to $111,733</td>
                        <td className="text-right">20.5%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">$111,733 to $173,205</td>
                        <td className="text-right">26%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">$173,205 to $246,752</td>
                        <td className="text-right">29%</td>
                      </tr>
                      <tr>
                        <td className="py-2">Over $246,752</td>
                        <td className="text-right">33%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{province} Provincial Income Tax Brackets (2024)</h3>
                {province === "Ontario" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Income Range</th>
                          <th className="text-right py-2">Tax Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">$0 to $49,231</td>
                          <td className="text-right">5.05%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">$49,231 to $98,463</td>
                          <td className="text-right">9.15%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">$98,463 to $150,000</td>
                          <td className="text-right">11.16%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">$150,000 to $220,000</td>
                          <td className="text-right">12.16%</td>
                        </tr>
                        <tr>
                          <td className="py-2">Over $220,000</td>
                          <td className="text-right">13.16%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Tax brackets for {province} are applied based on the current provincial rates.</p>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Marginal vs. Effective Tax Rates</h3>
                <p className="mb-2">
                  <strong>Marginal tax rate</strong> is the rate of tax applied to your next dollar of income. This is
                  determined by which tax bracket your income falls into.
                </p>
                <p className="mb-2">
                  <strong>Effective tax rate</strong> is the average rate of tax on your total income, calculated as
                  total tax divided by total income.
                </p>
                <p className="mb-2">
                  This application uses the <strong>marginal tax rate</strong> for calculating taxes on salary payments,
                  which is more accurate for determining taxes on additional income.
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Net-to-Gross Calculation</h3>
                <p className="mb-2">
                  When you enter a net amount (take-home pay), the application calculates the gross amount using this
                  formula:
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">
                    Gross Amount = Net Amount ÷ (1 - (Marginal Federal Rate + Marginal Provincial Rate + CPP Rate))
                  </p>
                </div>
                <p className="mt-2 text-sm">
                  This ensures that after all taxes and CPP contributions are deducted, the employee receives exactly
                  the net amount specified.
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The application uses simplified tax calculations. For precise tax planning, consult with a tax
                  professional who can account for all deductions, credits, and specific circumstances.
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
                  Federal corporate tax for small businesses is calculated at 9% of taxable income.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-mono">Federal Corporate Tax = Taxable Income × 0.09</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{province} Provincial Corporate Tax</h3>
                <p className="mb-2">
                  {province} provincial corporate tax for small businesses is calculated at 3.2% of taxable income.
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
