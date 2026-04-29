"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  Sprout,
  Loader2,
  Sun,
} from "lucide-react"
import { useState, useEffect } from "react"
import { weatherService } from "@/lib/api"

const features = [
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    description:
      "Advanced machine learning models analyze historical and real-time data for accurate weather forecasting.",
  },
  {
    icon: Bell,
    title: "Early Warning System",
    description:
      "Receive instant alerts for extreme weather events including floods, droughts, and storms.",
  },
  {
    icon: MapPin,
    title: "Localized Forecasts",
    description:
      "Get precise weather predictions tailored for different zones within Eastern Hararge region.",
  },
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    description:
      "Explore weather data through intuitive charts, graphs, and geographic maps.",
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
    icon: Users,
    title: "Local Residents",
    description: "Access daily forecasts and weather alerts to plan your activities and stay safe.",
    features: ["View general forecasts", "Receive public alerts", "Access weather visualizations"],
  },
  {
    icon: Sprout,
    title: "Farmers",
    description: "Make informed agricultural decisions with detailed weather predictions and historical trends.",
    features: ["Detailed crop forecasts", "Historical data analysis", "Seasonal predictions"],
  },
  {
    icon: Shield,
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
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      setWeatherLoading(true)
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
      } finally {
        setWeatherLoading(false)
      }
    }
    fetchWeather()
  }, [])

  return (
    <div className="min-h-screen">
      {/* ================= HERO — 465.jpg Rainbow Sky ================= */}
      <section
        className="relative min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/465.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* No overlay — image shows fully */}
        {/* <div className="absolute inset-0 bg-black/10" /> */}

        {/* Glass Header */}
        <header className="relative z-10 border-b border-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(16px)' }}>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <CloudSun className="h-5 w-5 text-amber-300" />
              </div>
              <span className="font-semibold text-white tracking-wide">
                Eastern Hararge Weather
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white/70 hover:text-white hover:bg-white/15 rounded-lg border border-transparent hover:border-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-lg bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 font-bold border-0 transition-all duration-300"
              >
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Glass Panel with Text */}
              <div className="rounded-3xl border border-white/50 p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1.5 text-sm text-amber-400" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <Brain className="h-4 w-4" />
                  <span>Powered by Machine Learning</span>
                </div>

                <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-5xl text-white leading-[1.2] drop-shadow-lg">
                  Intelligent Weather{" "}
                  <span className="text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">
                    Prediction
                  </span>{" "}
                  for{" "}
                  <span className="relative text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">
                    Eastern Hararge
                    <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                  </span>
                </h1>

                <p className="mt-6 text-lg text-white/60 leading-relaxed">
                  Accurate, timely, and localized weather forecasts using advanced ML.
                  Protect your crops, plan your activities, and stay safe.
                </p>

                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    asChild
                    className="rounded-xl bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 font-bold px-7 border-0 transition-all duration-300 ease-out group"
                  >
                    <Link href="/auth/register" className="gap-2">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    asChild
                    className="rounded-xl text-white/80 hover:text-white hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] px-7 border border-white/20 hover:border-white/35 transition-all duration-300"
                  >
                    <Link href="/dashboard">View Demo Dashboard</Link>
                  </Button>
                </div>
              </div>

              {/* Right: Glass Weather Cards */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Thermometer, value: liveWeather ? `${liveWeather.temperature}°C` : "--", label: "Temperature", color: "text-rose-300" },
                    { icon: Droplets, value: liveWeather ? `${liveWeather.humidity}%` : "--", label: "Humidity", color: "text-sky-300" },
                    { icon: Wind, value: liveWeather ? `${liveWeather.windSpeed} km/h` : "--", label: "Wind Speed", color: "text-emerald-300" },
                    { icon: CloudRain, value: liveWeather ? `${liveWeather.rainChance}%` : "--", label: "Cloud Cover", color: "text-amber-300" },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/45 p-6 transition-all duration-300 hover:border-white/55"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)' }}
                    >
                      <card.icon className={`h-6 w-6 mb-3 ${card.color}`} />
                      {weatherLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                      ) : (
                        <p className="text-3xl font-semibold text-white drop-shadow-md">{card.value}</p>
                      )}
                      <p className="text-sm text-white/70 mt-1 drop-shadow-sm">{card.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS — tiny-cloud-sun-sky.jpg ================= */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: "url('/tiny-cloud-sun-sky.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Light overlay for blue sky */}
        <div className="absolute inset-0 bg-white/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/50 p-12" style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-sky-700 drop-shadow-sm">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-semibold text-slate-800">{stat.label}</div>
                  <div className="text-sm text-slate-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES — 465.jpg (Rainbow Sky) ================= */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: "url('/465.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Very light overlay to show rainbow */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white drop-shadow-lg">
              Advanced Weather Intelligence
            </h2>
            <p className="mt-4 text-white/70 drop-shadow-md">
              Our system combines cutting-edge machine learning with comprehensive
              weather data to deliver reliable forecasts.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/30 p-6 transition-all duration-300 hover:border-white/40"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(16px)' }}
              >
                <div className="mb-4 inline-flex rounded-xl p-3 border border-amber-400/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}>
                  <feature.icon className="h-6 w-6 text-amber-300" />
                </div>
                <h3 className="text-lg font-semibold text-white drop-shadow-md">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= USER TYPES — tiny-cloud-sun-sky.jpg (Blue Sky) ================= */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: "url('/tiny-cloud-sun-sky.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/35" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 drop-shadow-sm">
              Built for Everyone in Eastern Hararge
            </h2>
            <p className="mt-4 text-slate-700 text-lg">
              Whether you&apos;re a farmer planning your harvest or a government official
              coordinating disaster response, our platform serves your needs.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {userTypes.map((type, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/60 p-8 transition-all duration-300 hover:border-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(24px)' }}
              >
                <div className="mb-4 inline-flex rounded-xl p-3 border border-sky-500/40" style={{ backgroundColor: 'rgba(14, 165, 233, 0.18)' }}>
                  <type.icon className="h-7 w-7 text-sky-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{type.title}</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{type.description}</p>
                <ul className="mt-4 space-y-2">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-sky-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    size="sm"
                    asChild
                    className="w-full rounded-lg bg-sky-600 text-white hover:bg-sky-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] font-semibold border-0 transition-all duration-300"
                  >
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA — 465.jpg (Rainbow Sky) ================= */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: "url('/465.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Light overlay to show rainbow */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 p-12" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                <Sun className="h-7 w-7 text-amber-300" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-lg">
                Stay Informed, Stay Safe
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70 drop-shadow-md">
                Join thousands of users in Eastern Hararge who rely on our weather
                prediction system for accurate forecasts and early warnings.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 font-bold px-7 border-0 transition-all duration-300 ease-out group"
                >
                  <Link href="/auth/register" className="gap-2">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="rounded-xl text-white/80 hover:text-white hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] px-7 border border-white/20 hover:border-white/35 transition-all duration-300"
                >
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER — tiny-cloud-sun-sky.jpg (Blue Sky) ================= */}
      <footer
        className="relative border-t border-white/30"
        style={{
          backgroundImage: "url('/tiny-cloud-sun-sky.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/50" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30" style={{ backgroundColor: 'rgba(14, 165, 233, 0.12)' }}>
                <CloudSun className="h-4 w-4 text-sky-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Eastern Hararge Weather Prediction System
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Powered by Machine Learning for accurate weather forecasting
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
