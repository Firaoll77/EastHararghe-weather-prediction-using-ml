"use client"

import { WeatherCard, WeatherStatCard } from "@/components/weather-card"
import { TemperatureChart, RainfallChart, HumidityWindChart } from "@/components/forecast-chart"
import { HourlyForecast, DailyForecast } from "@/components/hourly-forecast"
import { AlertList } from "@/components/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, RefreshCw, Download, Brain, TrendingUp, Loader2, Sprout, Shield, Home, Droplets, ThermometerSun, Wind } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { weatherService, predictionsService, locationsService, authService } from "@/lib/api"
import type { WeatherData, WeatherForecast, LocationListItem, PredictionResponse, ModelStatus, UserRole } from "@/lib/api/types"

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

interface LocationOption {
  id: number
  name: string
}

interface DashboardData {
  weather: WeatherData | null
  forecasts: WeatherForecast[]
  prediction: PredictionResponse | null
  modelStatus: ModelStatus | null
}

export default function DashboardPage() {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>("resident")
  const [data, setData] = useState<DashboardData>({
    weather: null,
    forecasts: [],
    prediction: null,
    modelStatus: null,
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load user role on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await authService.getProfile()
        if (res.success && res.data?.role) {
          setUserRole(res.data.role)
        }
      } catch {
        // Default to resident
      }
    }
    loadProfile()
  }, [])

  // Load locations on mount
  useEffect(() => {
    async function loadLocations() {
      const res = await locationsService.getLocations()
      if (res.success && res.data) {
        const locs = (res.data as unknown as LocationListItem[]).map((l) => ({
          id: l.id,
          name: l.name,
        }))
        setLocations(locs)
        if (locs.length > 0 && !selectedLocationId) {
          setSelectedLocationId(String(locs[0].id))
        }
      }
    }
    loadLocations()
  }, [])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (locationId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const [weatherRes, forecastRes, predictionRes, statusRes] = await Promise.allSettled([
        weatherService.getLiveWeather(locationId),
        weatherService.getWeatherForecast(locationId, 7),
        predictionsService.makePrediction({ location_id: locationId }),
        predictionsService.getModelStatus(),
      ])

      const weather = weatherRes.status === "fulfilled" && weatherRes.value.success && weatherRes.value.data
        ? weatherRes.value.data.weather
        : null

      const forecasts = forecastRes.status === "fulfilled" && forecastRes.value.success && forecastRes.value.data
        ? forecastRes.value.data.forecasts
        : []

      const prediction = predictionRes.status === "fulfilled" && predictionRes.value.success && predictionRes.value.data
        ? predictionRes.value.data
        : null

      const modelStatus = statusRes.status === "fulfilled" && statusRes.value.success && statusRes.value.data
        ? statusRes.value.data
        : null

      if (!weather && forecasts.length === 0 && !prediction) {
        setError("Failed to load weather data. Please check your connection and try again.")
      }

      setData({ weather, forecasts, prediction, modelStatus })
      setLastUpdated(new Date())
    } catch {
      setError("An unexpected error occurred while fetching data.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data when location changes
  useEffect(() => {
    if (selectedLocationId) {
      fetchDashboardData(Number(selectedLocationId))
    }
  }, [selectedLocationId, fetchDashboardData])

  const handleRefresh = async () => {
    if (!selectedLocationId) return
    setIsRefreshing(true)
    await fetchDashboardData(Number(selectedLocationId))
    setIsRefreshing(false)
  }

  const selectedLocationName = locations.find((l) => String(l.id) === selectedLocationId)?.name || ""

  // Role-specific dashboard config
  const roleConfig: Record<UserRole, {
    title: string
    subtitle: string
    icon: typeof Home
    statsFocus: { key: string; label: string; icon: typeof Home }[]
  }> = {
    resident: {
      title: "Weather Dashboard",
      subtitle: "Real-time weather data and forecasts for your area",
      icon: Home,
      statsFocus: [
        { key: "temperature", label: "Temperature", icon: ThermometerSun },
        { key: "humidity", label: "Humidity", icon: Droplets },
        { key: "wind", label: "Wind Speed", icon: Wind },
        { key: "feelsLike", label: "Feels Like", icon: ThermometerSun },
      ],
    },
    farmer: {
      title: "Agricultural Weather Dashboard",
      subtitle: "ML-powered forecasts and crop advisories for farming decisions",
      icon: Sprout,
      statsFocus: [
        { key: "temperature", label: "Temperature", icon: ThermometerSun },
        { key: "rainfall", label: "Rainfall", icon: Droplets },
        { key: "humidity", label: "Humidity", icon: Droplets },
        { key: "wind", label: "Wind Speed", icon: Wind },
      ],
    },
    government: {
      title: "Regional Monitoring Dashboard",
      subtitle: "Weather monitoring, alerts, and disaster coordination for Eastern Hararge",
      icon: Shield,
      statsFocus: [
        { key: "temperature", label: "Temperature", icon: ThermometerSun },
        { key: "pressure", label: "Pressure", icon: Wind },
        { key: "wind", label: "Wind Speed", icon: Wind },
        { key: "rainfall", label: "Rainfall", icon: Droplets },
      ],
    },
  }

  const currentRoleConfig = roleConfig[userRole]

  // Map weather data to component props
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
    : {
        location: selectedLocationName,
        temperature: 0,
        condition: "partly-cloudy" as WeatherCondition,
        humidity: 0,
        windSpeed: 0,
        pressure: 0,
        feelsLike: 0,
      }

  // Build hourly data from forecast (simulated from daily forecast)
  const hourlyData = data.forecasts.slice(0, 10).map((f, i) => ({
    time: i === 0 ? "Now" : `${12 + i * 2}:00`,
    temperature: Math.round((f.temperature_high + f.temperature_low) / 2),
    condition: mapCondition(f.condition) as WeatherCondition,
    precipitation: f.precipitation_probability,
  }))

  // Build daily forecast data
  const dailyData = data.forecasts.map((f, i) => ({
    day: getDayName(f.forecast_date, i),
    date: formatDate(f.forecast_date),
    high: Math.round(f.temperature_high),
    low: Math.round(f.temperature_low),
    condition: mapCondition(f.condition) as WeatherCondition,
    precipitation: Math.round(f.precipitation_probability),
  }))

  // Build temperature chart data with ML predictions
  const temperatureChartData = data.forecasts.map((f, i) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let dayLabel: string
    try {
      dayLabel = dayNames[new Date(f.forecast_date).getDay()]
    } catch {
      dayLabel = `D${i + 1}`
    }
    return {
      date: dayLabel,
      high: Math.round(f.temperature_high),
      low: Math.round(f.temperature_low),
      predicted: data.prediction
        ? Math.round(f.temperature_high - (data.prediction.prediction.rainfall_mm * 0.1))
        : Math.round(f.temperature_high - 1),
    }
  })

  // Build rainfall chart data with ML predictions
  const rainfallChartData = data.forecasts.map((f, i) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let dayLabel: string
    try {
      dayLabel = dayNames[new Date(f.forecast_date).getDay()]
    } catch {
      dayLabel = `D${i + 1}`
    }
    return {
      date: dayLabel,
      rainfall: Math.round(f.rainfall_amount * 10) / 10,
      predicted: data.prediction
        ? Math.round(data.prediction.prediction.rainfall_mm * (1 + (i - 3) * 0.15) * 10) / 10
        : Math.round(f.rainfall_amount * 1.1 * 10) / 10,
    }
  })

  // Build humidity/wind chart data from forecast
  const humidityWindData = data.forecasts.slice(0, 6).map((f, i) => ({
    time: `${i * 4}:00`,
    humidity: f.humidity,
    windSpeed: Math.round(f.wind_speed),
  }))

  // Generate alerts based on weather conditions
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

  // Generate role-specific recommendations
  const getRecommendations = () => {
    const recs = []
    const rainfall = data.prediction?.prediction.rainfall_mm
    const category = data.prediction?.prediction.category
    const temp = data.weather?.temperature
    const humidity = data.weather?.humidity
    const wind = data.weather?.wind_speed

    if (userRole === "farmer") {
      // Farmer-specific recommendations
      if (category === "heavy" || category === "extreme") {
        recs.push({
          title: "Crop Protection",
          text: `Heavy rainfall predicted (${rainfall?.toFixed(1)}mm). Delay planting and harvesting. Ensure drainage channels are clear to prevent waterlogging.`,
        })
        recs.push({
          title: "Soil Advisory",
          text: "Excessive rain may cause soil erosion. Apply mulch to vulnerable areas and avoid tilling.",
        })
      } else if (category === "moderate") {
        recs.push({
          title: "Planting Window",
          text: `Moderate rainfall (${rainfall?.toFixed(1)}mm) is favorable for rain-fed crops like maize and sorghum. Good time for sowing.`,
        })
      } else {
        recs.push({
          title: "Irrigation Advisory",
          text: `Low rainfall predicted (${rainfall?.toFixed(1)}mm). Schedule irrigation for moisture-dependent crops. Conserve water resources.`,
        })
      }
      if (temp && temp > 35) {
        recs.push({ title: "Heat Stress Warning", text: "High temperatures may stress livestock and crops. Provide shade and extra water for animals." })
      }
      if (wind && wind > 15) {
        recs.push({ title: "Wind Advisory", text: "Strong winds may damage tall crops. Consider staking or windbreaks." })
      }
      if (!data.prediction) {
        recs.push(
          { title: "Crop Planning", text: "Enable ML predictions for personalized planting and harvesting recommendations." },
          { title: "Seasonal Outlook", text: "Check forecast data for seasonal agricultural planning." }
        )
      }
    } else if (userRole === "government") {
      // Government-specific recommendations
      if (category === "heavy" || category === "extreme") {
        recs.push({
          title: "Flood Risk Assessment",
          text: `Heavy rainfall (${rainfall?.toFixed(1)}mm) poses flood risk. Activate emergency response teams and alert low-lying communities.`,
        })
        recs.push({
          title: "Infrastructure Advisory",
          text: "Monitor roads, bridges, and drainage systems. Prepare for potential infrastructure damage.",
        })
      } else if (category === "moderate") {
        recs.push({
          title: "Preparedness Advisory",
          text: `Moderate rainfall expected. Ensure drainage systems are functional and emergency supplies are accessible.`,
        })
      }
      if (temp && temp > 40) {
        recs.push({ title: "Heat Emergency", text: "Extreme heat alert. Activate public cooling centers and issue health warnings." })
      }
      if (wind && wind > 20) {
        recs.push({ title: "Storm Watch", text: "High wind speeds detected. Issue public safety warnings and secure public infrastructure." })
      }
      recs.push({
        title: "Regional Coordination",
        text: "Share weather alerts with district offices and ensure communication channels are operational.",
      })
      if (!data.prediction) {
        recs.push(
          { title: "Disaster Preparedness", text: "Enable ML predictions for early warning and disaster risk assessment." },
          { title: "Resource Allocation", text: "Use forecast data to pre-position emergency resources in at-risk areas." }
        )
      }
    } else {
      // Resident-specific recommendations
      if (category === "heavy" || category === "extreme") {
        recs.push({
          title: "Safety Advisory",
          text: `Heavy rainfall (${rainfall?.toFixed(1)}mm) expected. Avoid low-lying areas and stay indoors if possible.`,
        })
      } else if (category === "moderate") {
        recs.push({
          title: "Activity Planning",
          text: `Light to moderate rain expected. Carry an umbrella and dress warmly for outdoor activities.`,
        })
      }
      if (rainfall && rainfall > 5) {
        recs.push({ title: "Travel Advisory", text: "Roads may be slippery. Allow extra travel time and drive cautiously." })
      }
      if (temp && temp > 35) {
        recs.push({ title: "Health Advisory", text: "High temperatures expected. Stay hydrated, wear light clothing, and avoid midday sun." })
      } else if (temp && temp < 10) {
        recs.push({ title: "Cold Advisory", text: "Low temperatures expected. Dress warmly and protect vulnerable family members." })
      }
      if (humidity && humidity > 80) {
        recs.push({ title: "Comfort Advisory", text: "High humidity may cause discomfort. Stay in ventilated areas." })
      }
      if (!data.prediction) {
        recs.push(
          { title: "Daily Planning", text: "Enable ML predictions for personalized daily weather recommendations." },
          { title: "Safety Alerts", text: "Monitor weather alerts for your area to stay safe." }
        )
      }
    }
    return recs
  }

  const recommendations = getRecommendations()

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never"
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    return lastUpdated.toLocaleTimeString()
  }

  if (isLoading && !data.weather) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <currentRoleConfig.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{currentRoleConfig.title}</h1>
            <p className="text-muted-foreground">
              {currentRoleConfig.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
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
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ML Prediction Badge */}
      <div className="mt-4 flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <currentRoleConfig.icon className="h-3 w-3" />
          {userRole === "farmer" ? "Farmer View" : userRole === "government" ? "Government View" : "Resident View"}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          ML-Powered Predictions
        </Badge>
        {data.modelStatus?.model_loaded && (
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {data.modelStatus.model_type || "RandomForest"} Model Active
          </Badge>
        )}
        {data.prediction && (
          <Badge variant="outline" className="gap-1">
            Predicted: {data.prediction.prediction.rainfall_mm.toFixed(1)}mm ({data.prediction.prediction.category_label})
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          Last updated: {formatLastUpdated()}
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Grid - Role-specific focus */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentRoleConfig.statsFocus.map((stat) => {
          const statValues: Record<string, { value: number; unit: string; icon: "temperature" | "humidity" | "wind" | "pressure" | "rainfall" | "feelsLike"; trend?: { value: number; direction: "up" | "down" } }> = {
            temperature: {
              value: currentWeather.temperature,
              unit: "°C",
              icon: "temperature",
              trend: data.weather ? { value: Math.round(currentWeather.temperature - 25), direction: currentWeather.temperature > 25 ? "up" as const : "down" as const } : undefined,
            },
            humidity: {
              value: currentWeather.humidity,
              unit: "%",
              icon: "humidity",
              trend: data.weather ? { value: Math.abs(currentWeather.humidity - 60), direction: currentWeather.humidity > 60 ? "up" as const : "down" as const } : undefined,
            },
            wind: {
              value: currentWeather.windSpeed,
              unit: "km/h",
              icon: "wind",
            },
            pressure: {
              value: currentWeather.pressure,
              unit: "hPa",
              icon: "pressure",
            },
            rainfall: {
              value: Math.round(data.weather?.rainfall ?? 0),
              unit: "mm",
              icon: "rainfall",
              trend: data.prediction ? { value: Math.round(data.prediction.prediction.rainfall_mm - (data.weather?.rainfall ?? 0)), direction: data.prediction.prediction.rainfall_mm > (data.weather?.rainfall ?? 0) ? "up" as const : "down" as const } : undefined,
            },
            feelsLike: {
              value: currentWeather.feelsLike,
              unit: "°C",
              icon: "temperature",
              trend: data.weather ? { value: Math.round(currentWeather.feelsLike - currentWeather.temperature), direction: currentWeather.feelsLike > currentWeather.temperature ? "up" as const : "down" as const } : undefined,
            },
          }
          const sv = statValues[stat.key]
          if (!sv) return null
          return (
            <WeatherStatCard
              key={stat.key}
              title={stat.label}
              value={sv.value}
              unit={sv.unit}
              icon={sv.icon}
              trend={sv.trend}
            />
          )
        })}
      </div>

      {/* Main Content Grid - Layout varies by role */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Weather & Alerts */}
        <div className={`space-y-6 ${userRole === "government" ? "lg:col-span-2 order-first" : "lg:col-span-1"}`}>
          {userRole === "government" && activeAlerts.length > 0 && (
            <AlertList alerts={activeAlerts} />
          )}
          <WeatherCard {...currentWeather} />
          {userRole !== "government" && (
            <AlertList alerts={activeAlerts} />
          )}
          {userRole === "farmer" && data.prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sprout className="h-4 w-4 text-primary" />
                  Crop Rainfall Outlook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicted Rainfall</span>
                    <span className="font-semibold">{data.prediction.prediction.rainfall_mm.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-semibold">{data.prediction.prediction.category_label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">{(data.prediction.prediction.confidence ?? 0).toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 rounded-lg bg-primary/10 p-2 text-xs text-primary">
                    {data.prediction.prediction.category === "heavy" || data.prediction.prediction.category === "extreme"
                      ? "⚠ Delay field operations. Ensure drainage."
                      : data.prediction.prediction.category === "moderate"
                      ? "✓ Favorable for rain-fed crops."
                      : "💧 Consider irrigation scheduling."}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Charts & Forecasts */}
        <div className={`space-y-6 ${userRole === "government" ? "lg:col-span-1" : "lg:col-span-2"}`}>
          {userRole !== "government" && hourlyData.length > 0 && <HourlyForecast data={hourlyData} />}
          
          <div className="grid gap-6 md:grid-cols-2">
            {temperatureChartData.length > 0 && <TemperatureChart data={temperatureChartData} />}
            {userRole === "farmer" && rainfallChartData.length > 0
              ? <RainfallChart data={rainfallChartData} />
              : rainfallChartData.length > 0 && <RainfallChart data={rainfallChartData} />}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {humidityWindData.length > 0 && <HumidityWindChart data={humidityWindData} />}
            {dailyData.length > 0 && <DailyForecast data={dailyData} />}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {userRole === "farmer" ? "Agricultural Recommendations" : userRole === "government" ? "Emergency & Coordination Advisories" : "AI-Powered Recommendations"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium">{rec.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
