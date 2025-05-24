"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"
import { getUserPreferences, saveUserPreferences } from "@/lib/data-sync"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [province, setProvince] = useState<string>("ON")
  const [annualIncome, setAnnualIncome] = useState<number | undefined>()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  // Load existing preferences
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
        setProvince(prefs.province)
      }
      if (prefs.annualIncome) {
        setAnnualIncome(prefs.annualIncome)
      }
    }

    loadPreferences()
  }, [])

  const handleSaveSettings = async () => {
    setSaveStatus("saving")

    try {
      // Get current preferences first
      const currentPrefs = await getUserPreferences()

      // Update with new values
      const updatedPrefs = {
        ...currentPrefs,
        businessName,
        employeeName,
        province,
        annualIncome,
      }

      // Save to Supabase
      await saveUserPreferences(updatedPrefs)

      setSaveStatus("success")

      // Reset status after delay
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveStatus("error")

      // Reset status after delay
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Customize the business and employee names used throughout the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name</Label>
            <Input
              id="employeeName"
              placeholder="Enter employee name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This name will be used to refer to the owner/employee throughout the application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select value={province || "ON"} onValueChange={(value) => setProvince(value)}>
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AB">Alberta</SelectItem>
                <SelectItem value="BC">British Columbia</SelectItem>
                <SelectItem value="MB">Manitoba</SelectItem>
                <SelectItem value="NB">New Brunswick</SelectItem>
                <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                <SelectItem value="NS">Nova Scotia</SelectItem>
                <SelectItem value="ON">Ontario</SelectItem>
                <SelectItem value="PE">Prince Edward Island</SelectItem>
                <SelectItem value="QC">Quebec</SelectItem>
                <SelectItem value="SK">Saskatchewan</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Province used for tax calculations</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualIncome">Anticipated Annual Income ($CAD)</Label>
            <Input
              id="annualIncome"
              type="number"
              placeholder="Enter anticipated annual income"
              value={annualIncome || ""}
              onChange={(e) => setAnnualIncome(e.target.value ? Number(e.target.value) : undefined)}
            />
            <p className="text-sm text-muted-foreground">Used to calculate appropriate tax rates</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Alert className={saveStatus === "success" ? "bg-green-50 text-green-800 border-green-200" : "hidden"}>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">Settings saved successfully!</AlertDescription>
          </Alert>
          <Button onClick={handleSaveSettings} disabled={saveStatus === "saving"} className="ml-auto">
            {saveStatus === "saving" ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
          <CardDescription>Details about this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p>
              <strong>Application:</strong> Hao's Tax Tracker
            </p>
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Last Updated:</strong> May 2024
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This application is designed for tracking tax obligations for small businesses in Canada. Always consult
              with a qualified tax professional for tax advice.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
