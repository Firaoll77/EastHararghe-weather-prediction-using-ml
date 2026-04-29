"use client"

import { WeatherCard } from "@/components/weather-card"
import { HourlyForecast, DailyForecast } from "@/components/hourly-forecast"
import { AlertList } from "@/components/alert-banner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, Home, Shirt, Umbrella, Car, Dumbbell, Sprout, CloudSun, ThermometerSun, Droplets, Wind, Loader2 } from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"

type WeatherCondition = "sunny" | "cloudy" | "partly-cloudy" | "rainy"

function mapCondition(condition: string): WeatherCondition {
  const lower = condition.toLowerCase()
  if (lower.includes("thunderstorm") || lower.includes("storm")) return "rainy"
  if (lower.includes("rain") || lower.includes("drizzle")) return "rainy"
  if (lower.includes("cloud") || lower.includes("overcast")) return "cloudy"
  if (lower.includes("clear") || lower.includes("sunny")) return "sunny"
  return "partly-cloudy"
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

function getDayName(dateStr: string, index: number): string {
  if (index === 0) return "Today"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { weekday: "long" })
  } catch {
    return `Day ${index + 1}`
  }
}

function getOutfitAdvice(temp: number, condition: string, rainProb: number): { icon: typeof Shirt; text: string } {
  if (rainProb > 60) return { icon: Umbrella, text: "Bring an umbrella and wear waterproof shoes." }
  if (temp > 32) return { icon: Shirt, text: "Wear light, breathable clothing and a hat. Stay hydrated." }
  if (temp < 15) return { icon: Shirt, text: "Dress warmly with layers. A jacket is recommended." }
  if (condition.toLowerCase().includes("rain")) return { icon: Umbrella, text: "Carry a light rain jacket or umbrella." }
  return { icon: Shirt, text: "Comfortable casual wear. Perfect weather for outdoor activities." }
}

function getActivityAdvice(temp: number, wind: number, rainProb: number): { icon: typeof Dumbbell; text: string } {
  if (rainProb > 70 || wind > 25) return { icon: Car, text: "Not ideal for outdoor activities. Consider indoor plans." }
  if (temp > 35) return { icon: Car, text: "Avoid strenuous outdoor activities. Stay in shade and hydrate." }
  if (temp > 25 && rainProb < 30 && wind < 15) return { icon: Dumbbell, text: "Great weather for outdoor exercise, walking, or sports." }
  return { icon: Dumbbell, text: "Fair conditions for outdoor activities. Check forecast before heading out." }
}

export default function ResidentDashboard() {
  const {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    selectedLocationName,
    isLoading,
    isRefreshing,
    error,
    data,
    handleRefresh,
  } = useDashboardData()

  // Build hourly data from forecast
  const hourlyData = data.forecasts.slice(0, 10).map((f, i) => ({
    time: i === 0 ? "Now" : `${12 + i * 2}:00`,
    temperature: Math.round((f.temperature_high + f.temperature_low) / 2),
    condition: mapCondition(f.condition),
    precipitation: f.precipitation_probability,
  }))

  // Build daily forecast data
  const dailyData = data.forecasts.map((f, i) => ({
    day: getDayName(f.forecast_date, i),
    date: formatDate(f.forecast_date),
    high: Math.round(f.temperature_high),
    low: Math.round(f.temperature_low),
    condition: mapCondition(f.condition),
    precipitation: Math.round(f.precipitation_probability),
  }))

  // Current weather
  const currentWeather = data.weather
    ? {
        location: selectedLocationName,
        temperature: Math.round(data.weather.temperature),
        condition: mapCondition(data.weather.condition) as WeatherCondition,
        humidity: data.weather.humidity,
        windSpeed: Math.round(data.weather.wind_speed),
        pressure: data.weather.pressure,
        feelsLike: data.weather.feels_like ? Math.round(data.weather.feels_like) : Math.round(data.weather.temperature),
      }
    : null

  // Generate alerts
  const activeAlerts = []
  if (data.weather) {
    if (data.weather.rainfall > 10) {
      activeAlerts.push({
        id: "rain-alert",
        type: "flood" as const,
        severity: "warning" as const,
        title: "Heavy Rainfall Warning",
        description: `Current rainfall of ${data.weather.rainfall.toFixed(1)}mm may cause localized flooding in low-lying areas.`,
        location: selectedLocationName,
        validUntil: "Next 6 hours",
        timestamp: "Just now",
      })
    }
    if (data.weather.wind_speed > 15) {
      activeAlerts.push({
        id: "wind-alert",
        type: "storm" as const,
        severity: "advisory" as const,
        title: "Strong Wind Advisory",
        description: `Wind speeds of ${Math.round(data.weather.wind_speed)} km/h detected. Secure loose objects and exercise caution.`,
        location: selectedLocationName,
        validUntil: "Ongoing",
        timestamp: "Just now",
      })
    }
    if (data.weather.temperature > 35) {
      activeAlerts.push({
        id: "heat-alert",
        type: "heat" as const,
        severity: "watch" as const,
        title: "Heat Advisory",
        description: `High temperature of ${Math.round(data.weather.temperature)}°C. Stay hydrated and avoid prolonged sun exposure.`,
        location: selectedLocationName,
        validUntil: "Until evening",
        timestamp: "Just now",
      })
    }
  }

  const rainProb = data.prediction?.prediction.rainfall_mm
    ? Math.min(100, Math.round(data.prediction.prediction.rainfall_mm * 5))
    : 0

  const outfit = currentWeather
    ? getOutfitAdvice(currentWeather.temperature, data.weather?.condition || "", rainProb)
    : null
  const activity = currentWeather
    ? getActivityAdvice(currentWeather.temperature, data.weather?.wind_speed || 0, rainProb)
    : null

  if (isLoading && !currentWeather) {
    return (
      <div className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/local.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen"
      style={{
        backgroundImage: "url('/local.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Warm overlay for local theme */}
      <div className="absolute inset-0 bg-amber-950/30" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header - Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-amber-200/30 p-4"
        style={{ backgroundColor: 'rgba(120, 53, 15, 0.6)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30"
            style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
          >
            <Home className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">My Weather</h1>
            <p className="text-amber-100/80">Daily weather updates for your area</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-[180px] bg-white/10 border-amber-200/30 text-white focus:bg-white/15 focus:border-amber-200/50 [&>span]:text-white/80">
              <MapPin className="mr-2 h-4 w-4 text-amber-300" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-amber-900/90 backdrop-blur-xl border-amber-200/30">
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)} className="text-white focus:bg-amber-700/50">
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/10 border-amber-200/30 text-white hover:bg-white/20 hover:border-amber-200/50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Badge className="mt-4 gap-1 bg-amber-500/20 text-amber-200 border-amber-300/30 hover:bg-amber-500/30">
        <CloudSun className="h-3 w-3" />
        Resident View
      </Badge>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/50 p-3 text-sm text-white"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Weather & Advisories */}
        <div className="space-y-6 lg:col-span-1">
          {currentWeather && <WeatherCard {...currentWeather} />}

          {/* Outfit & Activity Advice - Glass Card */}
          {(outfit || activity) && (
            <div className="rounded-2xl border border-amber-200/30 overflow-hidden"
              style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
            >
              <div className="p-4 border-b border-amber-200/20">
                <h3 className="text-base font-semibold text-white">Daily Advice</h3>
              </div>
              <div className="p-4 space-y-4">
                {outfit && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 border border-amber-400/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                      <outfit.icon className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">What to Wear</p>
                      <p className="text-sm text-amber-100/80">{outfit.text}</p>
                    </div>
                  </div>
                )}
                {activity && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 border border-emerald-400/30" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)' }}>
                      <activity.icon className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Activity Tips</p>
                      <p className="text-sm text-amber-100/80">{activity.text}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats - Glass Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-200/30 p-4 flex flex-col items-center"
              style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
            >
              <div className="rounded-full p-2 mb-2 border border-orange-400/30" style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)' }}>
                <ThermometerSun className="h-5 w-5 text-orange-300" />
              </div>
              <span className="text-2xl font-bold text-white">{currentWeather?.temperature ?? "--"}°</span>
              <span className="text-xs text-amber-100/70">Feels Like</span>
            </div>
            <div className="rounded-xl border border-amber-200/30 p-4 flex flex-col items-center"
              style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
            >
              <div className="rounded-full p-2 mb-2 border border-blue-400/30" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                <Droplets className="h-5 w-5 text-blue-300" />
              </div>
              <span className="text-2xl font-bold text-white">{data.weather?.humidity ?? "--"}%</span>
              <span className="text-xs text-amber-100/70">Humidity</span>
            </div>
            <div className="rounded-xl border border-amber-200/30 p-4 flex flex-col items-center"
              style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
            >
              <div className="rounded-full p-2 mb-2 border border-cyan-400/30" style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}>
                <Wind className="h-5 w-5 text-cyan-300" />
              </div>
              <span className="text-2xl font-bold text-white">{currentWeather?.windSpeed ?? "--"}</span>
              <span className="text-xs text-amber-100/70">km/h Wind</span>
            </div>
            <div className="rounded-xl border border-amber-200/30 p-4 flex flex-col items-center"
              style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
            >
              <div className="rounded-full p-2 mb-2 border border-purple-400/30" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
                <Umbrella className="h-5 w-5 text-purple-300" />
              </div>
              <span className="text-2xl font-bold text-white">{rainProb}%</span>
              <span className="text-xs text-amber-100/70">Rain Chance</span>
            </div>
          </div>

          <AlertList alerts={activeAlerts} />
        </div>

        {/* Right Column - Forecasts */}
        <div className="space-y-6 lg:col-span-2">
          {hourlyData.length > 0 && <HourlyForecast data={hourlyData} />}

          {/* 7-Day Forecast - Glass Card */}
          <div className="rounded-2xl border border-amber-200/30 overflow-hidden"
            style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-amber-200/20">
              <h3 className="text-base font-semibold text-white">7-Day Forecast</h3>
            </div>
            <div className="p-4">
              <DailyForecast data={dailyData} />
            </div>
          </div>

          {/* Safety Tips Card - Glass */}
          <div className="rounded-2xl border border-amber-200/30 overflow-hidden"
            style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-amber-200/20">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Sprout className="h-4 w-4 text-emerald-300" />
                Weather Safety Tips
              </h3>
            </div>
            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Stay Informed</h4>
                  <p className="mt-1 text-xs text-amber-100/70">
                    Check weather alerts daily during the rainy season (June-September).
                  </p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Emergency Kit</h4>
                  <p className="mt-1 text-xs text-amber-100/70">
                    Keep flashlights, clean water, and first aid supplies ready.
                  </p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Heat Safety</h4>
                  <p className="mt-1 text-xs text-amber-100/70">
                    Avoid outdoor activities between 11 AM and 3 PM on hot days.
                  </p>
                </div>
                <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-medium text-sm text-white">Flood Awareness</h4>
                  <p className="mt-1 text-xs text-amber-100/70">
                    Know your evacuation route and avoid crossing flooded streams.
                  </p>
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
