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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="text-6xl mx-4 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
              💵
            </span>
          ))}
        </div>
      </div>

      <Card className="w-96 shadow-xl relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl">💰</span>
        </div>

        <div className="circular-text-container">
          <div className="circular-text">
            {Array.from("HAOS' TAX TRACKER").map((char, i) => (
              <span
                key={i}
                className="circular-text-char"
                style={{
                  transform: `rotate(${i * 15}deg)`,
                  transformOrigin: "0 80px",
                  position: "absolute",
                  left: "50%",
                  top: "-10px",
                  height: "80px",
                  fontFamily: "Impact, sans-serif",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#c0c0c0",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5)",
                  WebkitTextStroke: "1px #808080",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <CardHeader className="space-y-1 pt-16 mt-8">
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
