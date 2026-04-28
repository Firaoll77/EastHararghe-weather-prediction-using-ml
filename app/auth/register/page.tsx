"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudSun, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { authService } from "@/lib/api"

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
    
    const result = await authService.register({
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password,
      first_name: formData.name.split(' ')[0] || formData.name,
      last_name: formData.name.split(' ').slice(1).join(' ') || '',
      role: (formData.role || 'resident') as any,
    })
    
    if (!result.success || result.error) {
      let errMsg = 'Registration failed. Please try again.'
      if (typeof result.error === 'string') {
        errMsg = result.error
      } else if (result.errors) {
        const fieldErrors = Object.entries(result.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('; ')
        errMsg = fieldErrors
      } else if ((result.error as any)?.message) {
        errMsg = (result.error as any).message
      }
      setError(errMsg)
      setIsLoading(false)
      return
    }
    
    // Auto-login after successful registration
    const loginResult = await authService.login({
      email: formData.email,
      password: formData.password,
    })
    
    if (loginResult.success) {
      router.replace("/dashboard")
      return
    }
    
    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <Card className="relative w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation link to <strong>{formData.email}</strong>. 
              Please click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="relative grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left side - Benefits */}
        <div className="hidden flex-col justify-center lg:flex">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <CloudSun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Eastern Hararge Weather</span>
          </Link>
          
          <h1 className="text-3xl font-bold">
            Get accurate weather predictions for your area
          </h1>
          <p className="mt-4 text-muted-foreground">
            Join our platform to receive localized forecasts, early warnings, and
            actionable recommendations based on machine learning predictions.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Personalized Forecasts</p>
                <p className="text-sm text-muted-foreground">
                  Get weather predictions tailored to your specific location
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Early Warning Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about extreme weather events
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Historical Data Access</p>
                <p className="text-sm text-muted-foreground">
                  Explore past weather trends and seasonal patterns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="text-center lg:text-left">
            <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:hidden">
              <CloudSun className="h-6 w-6 text-primary-foreground" />
            </Link>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Start receiving accurate weather forecasts today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, not a common password, avoid personal info
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <p>{role.label}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
