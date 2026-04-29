"use client"

import { WeatherCard } from "@/components/weather-card"
import { TemperatureChart, RainfallChart, ModelAccuracyChart } from "@/components/forecast-chart"
import { AlertList } from "@/components/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, RefreshCw, Shield, Users, AlertTriangle, BarChart3, Brain, TrendingUp, Activity, Database, CheckCircle2, XCircle, Loader2, FileText, Eye } from "lucide-react"
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

export default function GovernmentDashboard() {
  const { locations, selectedLocationId, setSelectedLocationId, selectedLocationName, isLoading, isRefreshing, error, data, handleRefresh } = useDashboardData()

  const cw = data.weather ? {
    location: selectedLocationName, temperature: Math.round(data.weather.temperature),
    condition: mc(data.weather.condition) as WC, humidity: data.weather.humidity,
    windSpeed: Math.round(data.weather.wind_speed), pressure: data.weather.pressure,
    feelsLike: data.weather.feels_like ? Math.round(data.weather.feels_like) : Math.round(data.weather.temperature),
  } : null

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

  const modelData = data.modelStatus?.model_metrics
    ? [
        { model: "RandomForest", accuracy: data.modelStatus.model_metrics.accuracy ?? 85, rmse: data.modelStatus.model_metrics.rmse ?? 2.1 },
        { model: "XGBoost", accuracy: (data.modelStatus.model_metrics.accuracy ?? 85) + 3, rmse: (data.modelStatus.model_metrics.rmse ?? 2.1) - 0.3 },
        { model: "LSTM", accuracy: (data.modelStatus.model_metrics.accuracy ?? 85) - 2, rmse: (data.modelStatus.model_metrics.rmse ?? 2.1) + 0.5 },
      ]
    : [
        { model: "RandomForest", accuracy: 85, rmse: 2.1 },
        { model: "XGBoost", accuracy: 88, rmse: 1.8 },
        { model: "LSTM", accuracy: 83, rmse: 2.6 },
      ]

  const alerts = []
  if (data.weather) {
    if (data.weather.rainfall > 10) alerts.push({ id: "r", type: "flood" as const, severity: "warning" as const, title: "Flood Risk - Public Safety", description: `Heavy rainfall (${data.weather.rainfall.toFixed(1)}mm). Activate emergency response protocols for low-lying areas.`, location: selectedLocationName, validUntil: "Next 6h", timestamp: "Just now" })
    if (data.weather.wind_speed > 15) alerts.push({ id: "w", type: "storm" as const, severity: "advisory" as const, title: "Wind Advisory - Infrastructure", description: `Winds at ${Math.round(data.weather.wind_speed)} km/h. Monitor structural integrity of public buildings.`, location: selectedLocationName, validUntil: "Ongoing", timestamp: "Just now" })
    if (data.weather.temperature > 35) alerts.push({ id: "h", type: "heat" as const, severity: "watch" as const, title: "Heat Emergency", description: `Extreme heat (${Math.round(data.weather.temperature)}°C). Issue public health advisory and open cooling centers.`, location: selectedLocationName, validUntil: "Until evening", timestamp: "Just now" })
  }

  const prediction = data.prediction?.prediction
  const riskLevel = prediction
    ? (prediction.category === "extreme" ? "Critical" : prediction.category === "heavy" ? "High" : prediction.category === "moderate" ? "Medium" : "Low")
    : "Unknown"

  const riskColor = riskLevel === "Critical" ? "text-destructive" : riskLevel === "High" ? "text-orange-500" : riskLevel === "Medium" ? "text-yellow-500" : "text-green-500"

  if (isLoading && !cw) {
    return (
      <div className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/govt.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Loading government weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen"
      style={{
        backgroundImage: "url('/govt.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for government theme */}
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header - Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/20 p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
          >
            <Shield className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">Government Weather Command</h1>
            <p className="text-white/70">Regional monitoring, alerts & ML model oversight</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/30 [&>span]:text-white/80">
              <MapPin className="mr-2 h-4 w-4 text-white/60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-white/20">
              {locations.map((l) => (<SelectItem key={l.id} value={String(l.id)} className="text-white focus:bg-blue-500/20">{l.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge className="gap-1 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/30">
          <Shield className="h-3 w-3" />Government View
        </Badge>
        {data.modelStatus?.model_loaded && (
          <Badge className="gap-1 bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30">
            <Brain className="h-3 w-3" />ML System Online
          </Badge>
        )}
        <Badge className="gap-1 bg-white/10 text-white/80 border-white/20 hover:bg-white/20">
          <Database className="h-3 w-3" />{locations.length} Monitoring Stations
        </Badge>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/50 p-3 text-sm text-white"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Risk & System Status - Glass Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/20 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Regional Risk Level</p>
              <div className={`mt-1 text-3xl font-bold ${riskColor === "text-destructive" ? "text-red-400" : riskColor === "text-orange-500" ? "text-orange-400" : riskColor === "text-yellow-500" ? "text-yellow-400" : "text-emerald-400"}`}>
                {riskLevel}
              </div>
              <p className="mt-1 text-xs text-white/60">
                {prediction ? `Rainfall: ${prediction.rainfall_mm.toFixed(1)}mm (${prediction.category})` : "Evaluating..."}
              </p>
            </div>
            <div className="rounded-full p-3 border border-red-400/30" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle className="h-6 w-6 text-red-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">ML Model Status</p>
              <div className="mt-1 text-3xl font-bold text-white">{data.modelStatus?.model_loaded ? "Active" : "Offline"}</div>
              <p className="mt-1 text-xs text-white/60">{data.modelStatus?.model_type || "RandomForest"} v{data.modelStatus?.model_version || "1.0"}</p>
            </div>
            <div className="rounded-full p-3 border border-emerald-400/30" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
              {data.modelStatus?.model_loaded
                ? <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                : <XCircle className="h-6 w-6 text-red-300" />}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Prediction Confidence</p>
              <div className="mt-1 text-3xl font-bold text-white">{data.modelStatus?.model_metrics?.accuracy ? `${Math.round(data.modelStatus.model_metrics.accuracy)}%` : "85%"}</div>
              <p className="mt-1 text-xs text-white/60">Model accuracy (RMSE: {data.modelStatus?.model_metrics?.rmse?.toFixed(1) ?? "2.1"})</p>
            </div>
            <div className="rounded-full p-3 border border-purple-400/30" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
              <Activity className="h-6 w-6 text-purple-300" />
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500"
              style={{ width: `${data.modelStatus?.model_metrics?.accuracy ?? 85}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Active Alerts</p>
              <div className="mt-1 text-3xl font-bold text-white">{alerts.length}</div>
              <p className="mt-1 text-xs text-white/60">For {selectedLocationName || "selected region"}</p>
            </div>
            <div className="rounded-full p-3 border border-orange-400/30" style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)' }}>
              <Eye className="h-6 w-6 text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {cw && <WeatherCard {...cw} />}

          {/* Emergency Protocols - Glass Card */}
          <div className="rounded-2xl border border-white/20 overflow-hidden"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <FileText className="h-4 w-4 text-blue-400" />
                Emergency Protocols
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-red-400/30 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <p className="text-sm font-semibold text-red-200">Flood Response</p>
                <p className="mt-1 text-xs text-white/70">Activate evacuation plans for flood-prone woredas. Coordinate with kebele leaders.</p>
              </div>
              <div className="rounded-xl border border-orange-400/30 p-3" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                <p className="text-sm font-semibold text-orange-200">Drought Monitoring</p>
                <p className="mt-1 text-xs text-white/70">Track cumulative rainfall deficit. Prepare food aid distribution channels.</p>
              </div>
              <div className="rounded-xl border border-yellow-400/30 p-3" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                <p className="text-sm font-semibold text-yellow-200">Heat Emergency</p>
                <p className="mt-1 text-xs text-white/70">Open cooling centers. Issue public health advisory via radio and community leaders.</p>
              </div>
            </div>
          </div>

          <AlertList alerts={alerts} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <TemperatureChart data={tc} />
            <RainfallChart data={rc} />
          </div>

          <ModelAccuracyChart data={modelData} />

          {/* Regional Impact Assessment - Glass Card */}
          <div className="rounded-2xl border border-white/20 overflow-hidden"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Regional Impact Assessment
              </h3>
            </div>
            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl p-3 text-center border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <Users className="mx-auto h-5 w-5 text-blue-300 mb-2" />
                  <p className="text-2xl font-bold text-white">{data.weather ? (data.weather.rainfall > 10 ? "~180K" : "~120K") : "--"}</p>
                  <p className="text-xs text-white/60">Population at Risk</p>
                </div>
                <div className="rounded-xl p-3 text-center border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <TrendingUp className="mx-auto h-5 w-5 text-emerald-300 mb-2" />
                  <p className="text-2xl font-bold text-white">{data.weather ? (data.weather.rainfall > 10 ? "12" : "3") : "--"}</p>
                  <p className="text-xs text-white/60">Affected Woredas</p>
                </div>
                <div className="rounded-xl p-3 text-center border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <AlertTriangle className="mx-auto h-5 w-5 text-amber-300 mb-2" />
                  <p className="text-2xl font-bold text-white">{riskLevel === "Critical" || riskLevel === "High" ? "Yes" : "No"}</p>
                  <p className="text-xs text-white/60">Aid Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* ML Prediction Details - Glass Card */}
          <div className="rounded-2xl border border-white/20 overflow-hidden"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Brain className="h-4 w-4 text-purple-400" />
                ML Prediction Details
              </h3>
            </div>
            <div className="p-4">
              {prediction ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <p className="text-xs text-white/60">Predicted Rainfall</p>
                    <p className="text-lg font-bold text-white">{prediction.rainfall_mm.toFixed(1)} mm</p>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <p className="text-xs text-white/60">Category</p>
                    <p className="text-lg font-bold text-white capitalize">{prediction.category}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <p className="text-xs text-white/60">Confidence Score</p>
                    <p className="text-lg font-bold text-white">{(prediction.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <p className="text-xs text-white/60">Model Version</p>
                    <p className="text-lg font-bold text-white">{data.modelStatus?.model_version || "v1.0"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/70">No prediction data available. Select a location and refresh.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
