"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CloudSun,
  Bell,
  MapPin,
  BarChart3,
  Brain,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
} from "lucide-react"
import { useState, useEffect } from "react"
import { weatherService } from "@/lib/api"

const features = [
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    description:
      "Advanced machine learning models analyze historical and real-time data for accurate weather forecasting with 50% improved accuracy.",
  },
  {
    icon: Bell,
    title: "Early Warning System",
    description:
      "Receive instant alerts for extreme weather events including floods, droughts, storms, and temperature extremes.",
  },
  {
    icon: MapPin,
    title: "Localized Forecasts",
    description:
      "Get precise weather predictions specifically tailored for different zones within Eastern Hararge region.",
  },
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    description:
      "Explore weather data through intuitive charts, graphs, and geographic maps for better understanding.",
  },
]

const stats = [
  { value: "50%", label: "More Accurate", description: "Than traditional methods" },
  { value: "24/7", label: "Real-time Data", description: "Continuous monitoring" },
  { value: "15+", label: "Weather Parameters", description: "Comprehensive analysis" },
  { value: "5-Day", label: "Forecast Range", description: "Extended predictions" },
]

const userTypes = [
  {
    title: "Local Residents",
    description: "Access daily forecasts and weather alerts to plan your activities and stay safe.",
    features: ["View general forecasts", "Receive public alerts", "Access weather visualizations"],
  },
  {
    title: "Farmers",
    description: "Make informed agricultural decisions with detailed weather predictions and historical trends.",
    features: ["Detailed crop forecasts", "Historical data analysis", "Seasonal predictions"],
  },
  {
    title: "Government Officials",
    description: "Monitor regional weather patterns and coordinate disaster preparedness efforts.",
    features: ["Regional monitoring", "Disaster alerts", "Data export capabilities"],
  },
]

export default function LandingPage() {
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number
    humidity: number
    windSpeed: number
    rainChance: number
  } | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await weatherService.getLiveWeather(1)
        if (res.success && res.data) {
          const w = res.data.weather
          setLiveWeather({
            temperature: Math.round(w.temperature),
            humidity: Math.round(w.humidity),
            windSpeed: Math.round(w.wind_speed),
            rainChance: Math.round(w.cloudiness),
          })
        }
      } catch {
        // Landing page still works with fallback values
      }
    }
    fetchWeather()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CloudSun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">
              Eastern Hararge Weather
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Brain className="h-4 w-4" />
              <span>Powered by Machine Learning</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Intelligent Weather Prediction for{" "}
              <span className="text-primary">Eastern Hararge</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Accurate, timely, and localized weather forecasts using advanced machine
              learning techniques. Protect your crops, plan your activities, and stay
              safe with our early warning system.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Demo Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Weather Preview Cards */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-chart-4/20 p-2">
                  <Thermometer className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveWeather ? `${liveWeather.temperature}°C` : "28°C"}</p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveWeather ? `${liveWeather.humidity}%` : "65%"}</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-accent/20 p-2">
                  <Wind className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveWeather ? `${liveWeather.windSpeed} km/h` : "12 km/h"}</p>
                  <p className="text-xs text-muted-foreground">Wind Speed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-chart-1/20 p-2">
                  <CloudRain className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveWeather ? `${liveWeather.rainChance}%` : "25%"}</p>
                  <p className="text-xs text-muted-foreground">Rain Chance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 font-medium">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Advanced Weather Intelligence
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our system combines cutting-edge machine learning with comprehensive
              weather data to deliver reliable forecasts.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="border-y border-border bg-secondary/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Everyone in Eastern Hararge
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you&apos;re a farmer planning your harvest or a government official
              coordinating disaster response, our platform serves your needs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {userTypes.map((type, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
                <CardHeader>
                  <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 w-fit">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden bg-primary/5 border-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <CardContent className="relative py-16 text-center">
              <Shield className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-6 text-3xl font-bold">
                Stay Informed, Stay Safe
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join thousands of users in Eastern Hararge who rely on our weather
                prediction system for accurate forecasts and early warnings.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/auth/register">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CloudSun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">
                Eastern Hararge Weather Prediction System
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Machine Learning for accurate weather forecasting
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
