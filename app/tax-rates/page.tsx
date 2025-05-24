"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TaxRatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Canadian Corporate Tax Rates</h1>
        <p className="text-muted-foreground">Current and upcoming tax rates for Canadian small businesses</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tax rates are subject to change. Always verify current rates with the CRA or a qualified tax professional.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="2024">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2024">2024 Tax Rates</TabsTrigger>
          <TabsTrigger value="2025">2025 Tax Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="2024" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2024 Small Business Tax Rates</CardTitle>
              <CardDescription>Federal and provincial corporate tax rates for small businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Small Business Rate</TableHead>
                    <TableHead>General Rate</TableHead>
                    <TableHead>Small Business Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Federal</TableCell>
                    <TableCell>9%</TableCell>
                    <TableCell>15%</TableCell>
                    <TableCell>$500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ontario</TableCell>
                    <TableCell>3.2%</TableCell>
                    <TableCell>11.5%</TableCell>
                    <TableCell>$500,000</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted">
                    <TableCell className="font-medium">Combined</TableCell>
                    <TableCell className="font-medium">12.2%</TableCell>
                    <TableCell className="font-medium">26.5%</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">CPP Contribution Rates (2024)</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Maximum Pensionable Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Employee</TableCell>
                      <TableCell>5.95%</TableCell>
                      <TableCell rowSpan={3}>$68,500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Employer</TableCell>
                      <TableCell>5.95%</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted">
                      <TableCell className="font-medium">Self-Employed</TableCell>
                      <TableCell className="font-medium">11.9%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Small Business Deduction Eligibility</CardTitle>
              <CardDescription>Requirements to qualify for the small business tax rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To qualify for the small business deduction (SBD) in 2024, a corporation must meet the following
                criteria:
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Be a Canadian-controlled private corporation (CCPC)</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Have active business income earned in Canada</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Have taxable capital employed in Canada of less than $10 million (full SBD) or between $10 million
                    and $50 million (reduced SBD)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Have adjusted aggregate investment income in the previous tax year of less than $50,000 (full SBD)
                    or between $50,000 and $150,000 (reduced SBD)
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The small business deduction is reduced on a straight-line basis when taxable capital is between $10
                  million and $50 million, or when investment income is between $50,000 and $150,000.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2025" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2025 Small Business Tax Rates (Projected)</CardTitle>
              <CardDescription>
                Anticipated federal and provincial corporate tax rates for small businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  2025 rates are projections based on currently announced policies and may change with new legislation.
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Small Business Rate</TableHead>
                    <TableHead>General Rate</TableHead>
                    <TableHead>Small Business Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Federal</TableCell>
                    <TableCell>9%</TableCell>
                    <TableCell>15%</TableCell>
                    <TableCell>$500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ontario</TableCell>
                    <TableCell>3.2%</TableCell>
                    <TableCell>11.5%</TableCell>
                    <TableCell>$500,000</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted">
                    <TableCell className="font-medium">Combined</TableCell>
                    <TableCell className="font-medium">12.2%</TableCell>
                    <TableCell className="font-medium">26.5%</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">CPP Contribution Rates (2025 Projected)</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Maximum Pensionable Earnings (Est.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Employee</TableCell>
                      <TableCell>5.95%</TableCell>
                      <TableCell rowSpan={3}>$70,100 (estimated)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Employer</TableCell>
                      <TableCell>5.95%</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted">
                      <TableCell className="font-medium">Self-Employed</TableCell>
                      <TableCell className="font-medium">11.9%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Changes for 2025</CardTitle>
              <CardDescription>Potential changes to corporate tax policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Based on current announcements and trends, the following changes may affect corporate taxation in 2025:
              </p>

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    The federal government has indicated that the small business tax rate will remain stable at 9% for
                    eligible CCPCs.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>The small business limit is expected to remain at $500,000 of active business income.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    CPP contribution rates are projected to remain stable, though the maximum pensionable earnings
                    amount typically increases annually with inflation.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tax planning should account for potential changes in federal and provincial budgets that may be
                  announced in 2024 and early 2025.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
