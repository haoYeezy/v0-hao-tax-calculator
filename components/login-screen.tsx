"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check for the correct password
    if (password === "Chums") {
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 pointer-events-none" />

      <Card className="w-96 shadow-xl relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl">💰</span>
        </div>

        <div className="absolute top-0 left-0 right-0 text-center pt-6">
          <h1 className="text-2xl font-bold text-white">HAO'S TAX TRACKER</h1>
        </div>

        <CardHeader className="space-y-1 pt-20 mt-8">
          <CardTitle className="text-2xl text-center">Hi Hao</CardTitle>
          <CardDescription className="text-center">An application built for a single person: me.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-red-500 text-sm">Incorrect password</p>}
            </div>
            <Button type="submit" className="w-full mt-4 bg-black hover:bg-gray-800">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
