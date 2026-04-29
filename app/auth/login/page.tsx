"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudSun, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      
      if (error) {
        setError(error.message || 'Invalid email or password. Please try again.')
        setIsLoading(false)
        return
      }
      
      // Success — refresh and navigate to dashboard
      router.refresh()
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: "url('/465.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Light overlay */}
      <div className="absolute inset-0 bg-black/25" />
      
      <div className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="rounded-3xl border border-white/40 p-8"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <CloudSun className="h-7 w-7 text-amber-300" />
            </Link>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Welcome back</h1>
            <p className="mt-1 text-white/70 drop-shadow-sm">
              Sign in to access your weather dashboard
            </p>
          </div>
          
          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/50 p-3 text-sm text-white"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
              {error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/25 focus:border-white/50"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-300 hover:text-amber-200 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/25 focus:border-white/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] font-bold border-0 transition-all duration-300 group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-amber-300 hover:text-amber-200 font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
