"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudSun, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const userRoles = [
  { value: "resident", label: "Local Resident", description: "Access general forecasts and public alerts" },
  { value: "farmer", label: "Farmer", description: "Detailed agricultural forecasts and planning tools" },
  { value: "government", label: "Government Official", description: "Regional monitoring and disaster coordination" },
]

const locations = [
  "Harar City",
  "Gursum",
  "Babile",
  "Fedis",
  "Kombolcha",
  "Jarso",
  "Chinaksen",
  "Midega Tola",
  "Kersa",
  "Haramaya",
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          first_name: formData.name.split(' ')[0] || formData.name,
          last_name: formData.name.split(' ').slice(1).join(' ') || '',
          role: formData.role || 'resident',
          location: formData.location,
        },
      },
    })
    
    if (error) {
      setError(error.message || 'Registration failed. Please try again.')
      setIsLoading(false)
      return
    }
    
    // If session is immediately available, auto-login
    if (data.session) {
      router.refresh()
      router.replace("/dashboard")
      return
    }
    
    // Try to sign in directly (works if email confirmation is disabled)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })
    
    if (!signInError && signInData.session) {
      router.refresh()
      router.replace("/dashboard")
      return
    }
    
    // Otherwise, user needs to confirm their email
    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
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
        
        <div className="relative w-full max-w-md rounded-3xl border border-white/40 p-8 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)' }}
          >
            <CheckCircle className="h-7 w-7 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Account created!</h1>
          <p className="mt-4 text-white/80 drop-shadow-sm">
            We sent a confirmation link to <strong className="text-white">{formData.email}</strong>.
            <br /><br />
            Please <strong className="text-white">click the link in your email</strong> to verify your account, then come back and sign in.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/auth/login">
              <Button className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] font-bold border-0 transition-all duration-300 group">
                Go to Sign In
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs text-white/60">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                className="text-amber-300 hover:text-amber-200 underline"
                onClick={() => { setSuccess(false); setFormData({ ...formData, email: "" }) }}
              >
                try a different email
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
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
      
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-2 items-center">
        {/* Left side - Benefits */}
        <div className="hidden flex-col justify-center lg:flex">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <CloudSun className="h-6 w-6 text-amber-300" />
            </div>
            <span className="font-bold text-xl text-white drop-shadow-lg">Eastern Hararge Weather</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white drop-shadow-lg leading-tight">
            Get accurate weather predictions for your area
          </h1>
          <p className="mt-4 text-lg text-white/80 drop-shadow-sm">
            Join our platform to receive localized forecasts, early warnings, and
            actionable recommendations based on machine learning predictions.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-white/30 p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)' }}
            >
              <CheckCircle className="mt-0.5 h-5 w-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Personalized Forecasts</p>
                <p className="text-sm text-white/70">
                  Get weather predictions tailored to your specific location
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/30 p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)' }}
            >
              <CheckCircle className="mt-0.5 h-5 w-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Early Warning Alerts</p>
                <p className="text-sm text-white/70">
                  Receive notifications about extreme weather events
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/30 p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)' }}
            >
              <CheckCircle className="mt-0.5 h-5 w-5 text-amber-300 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Historical Data Access</p>
                <p className="text-sm text-white/70">
                  Explore past weather trends and seasonal patterns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="rounded-3xl border border-white/40 p-8"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div className="text-center lg:text-left mb-6">
            <Link href="/" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 lg:hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <CloudSun className="h-7 w-7 text-amber-300" />
            </Link>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Create an account</h2>
            <p className="mt-1 text-white/70 drop-shadow-sm">
              Start receiving accurate weather forecasts today
            </p>
          </div>
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/50 p-3 text-sm text-white"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/25 focus:border-white/50"
              />
            </div>

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
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
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
              <p className="text-xs text-white/60">
                At least 8 characters, not a common password, avoid personal info
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-white font-medium">I am a</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/25 focus:border-white/50 [&>span]:text-white/70 [&[data-state=open]>span]:text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40">
                  {userRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-slate-800 focus:bg-sky-100">
                      <div>
                        <p>{role.label}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white font-medium">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData({ ...formData, location: value })
                }
              >
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/25 focus:border-white/50 [&>span]:text-white/70 [&[data-state=open]>span]:text-white">
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40">
                  {locations.map((location) => (
                    <SelectItem key={location} value={location} className="text-slate-800 focus:bg-sky-100">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] font-bold border-0 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-amber-300 hover:text-amber-200 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
