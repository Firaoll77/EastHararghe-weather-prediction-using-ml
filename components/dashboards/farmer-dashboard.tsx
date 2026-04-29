"use client"

import { WeatherCard } from "@/components/weather-card"
import { TemperatureChart, RainfallChart } from "@/components/forecast-chart"
import { DailyForecast } from "@/components/hourly-forecast"
import { AlertList } from "@/components/alert-banner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, RefreshCw, Sprout, Tractor, Wheat, CloudRain, Sun, Droplets, Bug, CalendarDays, Leaf, Loader2, Brain, TrendingUp } from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"

type WC = "sunny" | "cloudy" | "partly-cloudy" | "rainy"
function mc(c: string): WC {
  const l = c.toLowerCase()
  if (l.includes("storm")) return "rainy"
  if (l.includes("rain") || l.includes("drizzle")) return "rainy"
  if (l.includes("cloud")) return "cloudy"
  if (l.includes("clear") || l.includes("sunny")) return "sunny"
  return "partly-cloudy"
}
function fd(d: string) { try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) } catch { return d } }
function gd(d: string, i: number) { if (i === 0) return "Today"; try { return new Date(d).toLocaleDateString("en-US", { weekday: "long" }) } catch { return `Day ${i + 1}` } }

export default function FarmerDashboard() {
  const { locations, selectedLocationId, setSelectedLocationId, selectedLocationName, isLoading, isRefreshing, error, data, handleRefresh } = useDashboardData()

  const cw = data.weather ? {
    location: selectedLocationName, temperature: Math.round(data.weather.temperature),
    condition: mc(data.weather.condition) as WC, humidity: data.weather.humidity,
    windSpeed: Math.round(data.weather.wind_speed), pressure: data.weather.pressure,
    feelsLike: data.weather.feels_like ? Math.round(data.weather.feels_like) : Math.round(data.weather.temperature),
  } : null

  const daily = data.forecasts.map((f, i) => ({
    day: gd(f.forecast_date, i), date: fd(f.forecast_date),
    high: Math.round(f.temperature_high), low: Math.round(f.temperature_low),
    condition: mc(f.condition) as WC, precipitation: Math.round(f.precipitation_probability),
  }))

  const tc = data.forecasts.map((f, i) => {
    const dn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let dl = ""; try { dl = dn[new Date(f.forecast_date).getDay()] } catch { dl = `D${i + 1}` }
    return { date: dl, high: Math.round(f.temperature_high), low: Math.round(f.temperature_low), predicted: data.prediction ? Math.round(f.temperature_high - data.prediction.prediction.rainfall_mm * 0.1) : Math.round(f.temperature_high - 1) }
  })

  const rc = data.forecasts.map((f, i) => {
    const dn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let dl = ""; try { dl = dn[new Date(f.forecast_date).getDay()] } catch { dl = `D${i + 1}` }
    return { date: dl, rainfall: Math.round(f.rainfall_amount * 10) / 10, predicted: data.prediction ? Math.round(data.prediction.prediction.rainfall_mm * (1 + (i - 3) * 0.15) * 10) / 10 : Math.round(f.rainfall_amount * 1.1 * 10) / 10 }
  })

  const rv = data.prediction?.prediction.rainfall_mm ?? (data.weather?.rainfall || 0)
  const tv = data.weather?.temperature ?? 0
  const hv = data.weather?.humidity ?? 0

  let ci = 50
  if (rv >= 5 && rv <= 25) ci += 25; else if (rv > 25) ci += 10; else ci += 5
  if (tv >= 18 && tv <= 28) ci += 15; else if (tv > 28) ci -= 5
  if (hv >= 50 && hv <= 80) ci += 10
  ci = Math.max(0, Math.min(100, ci))

  const sp = Math.min(100, rv * 3 + hv * 0.4)
  const sl = sp > 70 ? "High" : sp > 40 ? "Moderate" : "Low"

  let xr = 20; if (tv > 20 && tv < 30) xr += 30; if (hv > 70) xr += 25; if (rv > 5) xr += 15
  xr = Math.min(100, xr); const rl = xr > 60 ? "High" : xr > 30 ? "Moderate" : "Low"

  const gdd = data.weather ? Math.max(0, ((data.weather.temperature + (data.weather.feels_like ?? data.weather.temperature)) / 2) - 10) : null

  const pa = data.prediction
    ? (data.prediction.prediction.category === "heavy" || data.prediction.prediction.category === "extreme"
      ? "Delay planting. Soil may be waterlogged. Wait 2-3 days after heavy rain."
      : data.prediction.prediction.category === "moderate" && tv > 15
        ? "Good planting conditions. Soil moisture is adequate for germination."
        : "Low soil moisture. Consider irrigation before planting or wait for rain.")
    : "Loading prediction data..."

  const alerts = []
  if (data.weather) {
    if (data.weather.rainfall > 10) alerts.push({ id: "r", type: "flood" as const, severity: "warning" as const, title: "Heavy Rainfall - Crop Risk", description: `Excessive rain (${data.weather.rainfall.toFixed(1)}mm) may waterlog fields.`, location: selectedLocationName, validUntil: "Next 6h", timestamp: "Just now" })
    if (data.weather.wind_speed > 15) alerts.push({ id: "w", type: "storm" as const, severity: "advisory" as const, title: "Strong Winds", description: `Winds at ${Math.round(data.weather.wind_speed)} km/h may damage young plants.`, location: selectedLocationName, validUntil: "Ongoing", timestamp: "Just now" })
    if (data.weather.temperature > 35) alerts.push({ id: "h", type: "heat" as const, severity: "watch" as const, title: "Heat Stress Warning", description: `High heat (${Math.round(data.weather.temperature)}°C) may stress crops.`, location: selectedLocationName, validUntil: "Until evening", timestamp: "Just now" })
  }

  if (isLoading && !cw) {
    return (
      <div className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/farm.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Loading agricultural weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen"
      style={{
        backgroundImage: "url('/farm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Green-tinted overlay for farm theme */}
      <div className="absolute inset-0 bg-emerald-950/40" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header - Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-300/30 p-4"
        style={{ backgroundColor: 'rgba(6, 78, 59, 0.6)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)' }}
          >
            <Tractor className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">Farm Weather Center</h1>
            <p className="text-emerald-100/80">Agricultural forecasts and crop advisories</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-[180px] bg-white/10 border-emerald-300/30 text-white focus:bg-white/15 focus:border-emerald-300/50 [&>span]:text-white/80">
              <MapPin className="mr-2 h-4 w-4 text-emerald-300" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-emerald-900/90 backdrop-blur-xl border-emerald-300/30">
              {locations.map((l) => (<SelectItem key={l.id} value={String(l.id)} className="text-white focus:bg-emerald-700/50">{l.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-white/10 border-emerald-300/30 text-white hover:bg-white/20 hover:border-emerald-300/50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge className="gap-1 bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30">
          <Sprout className="h-3 w-3" />Farmer View
        </Badge>
        {data.modelStatus?.model_loaded && (
          <Badge className="gap-1 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/30">
            <Brain className="h-3 w-3" />ML Predictions Active
          </Badge>
        )}
        <Badge className="gap-1 bg-amber-500/20 text-amber-200 border-amber-400/30 hover:bg-amber-500/30">
          <TrendingUp className="h-3 w-3" />{data.modelStatus?.model_type || "RandomForest"}
        </Badge>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/50 p-3 text-sm text-white"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Ag Metrics - Glass Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Crop Weather Index */}
        <div className="rounded-2xl border border-emerald-300/30 p-4"
          style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100/70">Crop Weather Index</p>
              <div className="mt-1 text-3xl font-bold text-white">{ci}/100</div>
              <p className="mt-1 text-xs text-emerald-100/60">{ci > 70 ? "Excellent for crops" : ci > 50 ? "Fair conditions" : "Poor conditions"}</p>
            </div>
            <div className="rounded-full p-3 border border-emerald-400/30" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
              <Wheat className="h-6 w-6 text-emerald-300" />
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-400 transition-all duration-500"
              style={{ width: `${ci}%` }}
            />
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="rounded-2xl border border-emerald-300/30 p-4"
          style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100/70">Soil Moisture</p>
              <div className="mt-1 text-3xl font-bold text-white">{Math.round(sp)}%</div>
              <p className="mt-1 text-xs text-emerald-100/60">{sl} level</p>
            </div>
            <div className="rounded-full p-3 border border-blue-400/30" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
              <Droplets className="h-6 w-6 text-blue-300" />
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.round(sp)}%` }}
            />
          </div>
        </div>

        {/* Pest/Disease Risk */}
        <div className="rounded-2xl border border-emerald-300/30 p-4"
          style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100/70">Pest/Disease Risk</p>
              <div className="mt-1 text-3xl font-bold text-white">{xr}%</div>
              <p className="mt-1 text-xs text-emerald-100/60">{rl} risk today</p>
            </div>
            <div className="rounded-full p-3 border border-orange-400/30" style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)' }}>
              <Bug className="h-6 w-6 text-orange-300" />
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${xr > 60 ? 'bg-gradient-to-r from-red-400 to-orange-400' : xr > 30 ? 'bg-gradient-to-r from-orange-400 to-yellow-400' : 'bg-gradient-to-r from-emerald-400 to-green-400'}`}
              style={{ width: `${xr}%` }}
            />
          </div>
        </div>

        {/* Growing Degree Days */}
        <div className="rounded-2xl border border-emerald-300/30 p-4"
          style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100/70">Growing Degree Days</p>
              <div className="mt-1 text-3xl font-bold text-white">{gdd?.toFixed(1) ?? "--"}</div>
              <p className="mt-1 text-xs text-emerald-100/60">Base 10°C for maize</p>
            </div>
            <div className="rounded-full p-3 border border-amber-400/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}>
              <Sun className="h-6 w-6 text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {cw && <WeatherCard {...cw} />}

          {/* Planting & Field Advisory - Glass Card */}
          <div className="rounded-2xl border border-emerald-300/30 overflow-hidden"
            style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-emerald-300/20">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <CalendarDays className="h-4 w-4 text-emerald-300" />
                Planting & Field Advisory
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-xl p-3 border border-emerald-400/30" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
                <p className="text-sm font-semibold text-emerald-200">Today&apos;s Advice</p>
                <p className="mt-1 text-sm text-emerald-100/80">{pa}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-emerald-100/70"><Leaf className="h-4 w-4 text-emerald-300" />Irrigation Need</span>
                  <span className={sp < 40 ? "text-red-300 font-medium" : "text-emerald-200"}>
                    {sp < 40 ? "High - Irrigate" : "Low - Adequate"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-emerald-100/70"><CloudRain className="h-4 w-4 text-blue-300" />Next Rain (ML)</span>
                  <span className="font-medium text-white">{data.prediction ? `${data.prediction.prediction.rainfall_mm.toFixed(1)}mm` : "Loading..."}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-emerald-100/70"><Sprout className="h-4 w-4 text-amber-300" />Good for</span>
                  <span className="text-emerald-100/80">Maize, Sorghum, Teff</span>
                </div>
              </div>
            </div>
          </div>

          <AlertList alerts={alerts} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* 7-Day Forecast - Glass Card */}
          <div className="rounded-2xl border border-emerald-300/30 overflow-hidden"
            style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-emerald-300/20">
              <h3 className="text-base font-semibold text-white">7-Day Forecast</h3>
            </div>
            <div className="p-4">
              <DailyForecast data={daily} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TemperatureChart data={tc} />
            <RainfallChart data={rc} />
          </div>

          {/* Seasonal Crop Outlook - Glass Card */}
          <div className="rounded-2xl border border-emerald-300/30 overflow-hidden"
            style={{ backgroundColor: 'rgba(6, 78, 59, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-emerald-300/20">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Wheat className="h-4 w-4 text-emerald-300" />
                Seasonal Crop Outlook
              </h3>
            </div>
            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Maize Season</h4>
                  <p className="mt-1 text-xs text-emerald-100/70">Main season (Meher): June-September. Current conditions favorable for vegetative growth.</p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Teff Season</h4>
                  <p className="mt-1 text-xs text-emerald-100/70">Planting window: July-August. Monitor rainfall patterns before sowing.</p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Sorghum</h4>
                  <p className="mt-1 text-xs text-emerald-100/70">Drought-tolerant crop. Suitable for areas with irregular rainfall.</p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Chat/Khat</h4>
                  <p className="mt-1 text-xs text-emerald-100/70">Year-round crop. Requires moderate rainfall and well-drained soil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
