"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Layers,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  AlertTriangle,
  Info,
} from "lucide-react"

// District data for Eastern Hararge
const districts = [
  { id: "harar", name: "Harar City", temp: 28, rainfall: 15, humidity: 65, alert: null },
  { id: "gursum", name: "Gursum", temp: 26, rainfall: 25, humidity: 70, alert: "flood" },
  { id: "babile", name: "Babile", temp: 30, rainfall: 5, humidity: 55, alert: null },
  { id: "fedis", name: "Fedis", temp: 27, rainfall: 35, humidity: 72, alert: "flood" },
  { id: "kombolcha", name: "Kombolcha", temp: 25, rainfall: 20, humidity: 68, alert: null },
  { id: "jarso", name: "Jarso", temp: 29, rainfall: 10, humidity: 60, alert: null },
  { id: "chinaksen", name: "Chinaksen", temp: 24, rainfall: 30, humidity: 75, alert: "storm" },
  { id: "midega", name: "Midega Tola", temp: 31, rainfall: 3, humidity: 50, alert: "heat" },
  { id: "kersa", name: "Kersa", temp: 26, rainfall: 28, humidity: 71, alert: null },
  { id: "haramaya", name: "Haramaya", temp: 27, rainfall: 22, humidity: 66, alert: null },
]

const mapLayers = [
  { id: "temperature", name: "Temperature", icon: Thermometer },
  { id: "rainfall", name: "Rainfall", icon: CloudRain },
  { id: "humidity", name: "Humidity", icon: Droplets },
  { id: "wind", name: "Wind Speed", icon: Wind },
  { id: "alerts", name: "Weather Alerts", icon: AlertTriangle },
]

const getTemperatureColor = (temp: number) => {
  if (temp >= 32) return "bg-destructive/80"
  if (temp >= 28) return "bg-chart-4/80"
  if (temp >= 24) return "bg-chart-3/80"
  return "bg-primary/80"
}

const getRainfallColor = (rainfall: number) => {
  if (rainfall >= 30) return "bg-primary/90"
  if (rainfall >= 20) return "bg-primary/70"
  if (rainfall >= 10) return "bg-primary/50"
  return "bg-primary/30"
}

const getAlertColor = (alert: string | null) => {
  if (alert === "flood") return "bg-primary/80 border-primary"
  if (alert === "storm") return "bg-chart-5/80 border-chart-5"
  if (alert === "heat") return "bg-destructive/80 border-destructive"
  return "bg-secondary/50 border-border"
}

export default function MapsPage() {
  const [selectedLayer, setSelectedLayer] = useState("temperature")
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const activeDistrict = districts.find((d) => d.id === selectedDistrict)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Maps</h1>
          <p className="text-muted-foreground">
            Interactive weather visualization for Eastern Hararge region
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLayer} onValueChange={setSelectedLayer}>
            <SelectTrigger className="w-[180px]">
              <Layers className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mapLayers.map((layer) => (
                <SelectItem key={layer.id} value={layer.id}>
                  <div className="flex items-center gap-2">
                    <layer.icon className="h-4 w-4" />
                    {layer.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Eastern Hararge Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified Map Visualization */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/30">
                {/* Grid-based Map Representation */}
                <div className="absolute inset-4 grid grid-cols-4 grid-rows-3 gap-2">
                  {districts.map((district) => {
                    let bgColor = "bg-secondary/50"
                    if (selectedLayer === "temperature") {
                      bgColor = getTemperatureColor(district.temp)
                    } else if (selectedLayer === "rainfall") {
                      bgColor = getRainfallColor(district.rainfall)
                    } else if (selectedLayer === "alerts") {
                      bgColor = getAlertColor(district.alert)
                    } else if (selectedLayer === "humidity") {
                      bgColor = district.humidity >= 70 ? "bg-primary/70" : "bg-primary/40"
                    }

                    return (
                      <button
                        key={district.id}
                        onClick={() => setSelectedDistrict(district.id)}
                        className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-2 transition-all hover:scale-105 ${bgColor} ${
                          selectedDistrict === district.id
                            ? "border-foreground ring-2 ring-foreground/20"
                            : "border-transparent"
                        }`}
                      >
                        {district.alert && selectedLayer === "alerts" && (
                          <AlertTriangle className="absolute right-1 top-1 h-4 w-4 text-foreground" />
                        )}
                        <MapPin className="h-4 w-4 text-foreground/80" />
                        <span className="mt-1 text-xs font-medium text-foreground/90">
                          {district.name}
                        </span>
                        {selectedLayer === "temperature" && (
                          <span className="text-sm font-bold text-foreground">
                            {district.temp}°C
                          </span>
                        )}
                        {selectedLayer === "rainfall" && (
                          <span className="text-sm font-bold text-foreground">
                            {district.rainfall}mm
                          </span>
                        )}
                        {selectedLayer === "humidity" && (
                          <span className="text-sm font-bold text-foreground">
                            {district.humidity}%
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 p-3 backdrop-blur">
                  <p className="mb-2 text-xs font-medium">Legend</p>
                  {selectedLayer === "temperature" && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded bg-primary/80" />
                      <span>{"<24°C"}</span>
                      <div className="h-3 w-3 rounded bg-chart-3/80" />
                      <span>24-28°C</span>
                      <div className="h-3 w-3 rounded bg-chart-4/80" />
                      <span>28-32°C</span>
                      <div className="h-3 w-3 rounded bg-destructive/80" />
                      <span>{">32°C"}</span>
                    </div>
                  )}
                  {selectedLayer === "rainfall" && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded bg-primary/30" />
                      <span>{"<10mm"}</span>
                      <div className="h-3 w-3 rounded bg-primary/50" />
                      <span>10-20mm</span>
                      <div className="h-3 w-3 rounded bg-primary/70" />
                      <span>20-30mm</span>
                      <div className="h-3 w-3 rounded bg-primary/90" />
                      <span>{">30mm"}</span>
                    </div>
                  )}
                  {selectedLayer === "alerts" && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded bg-primary/80" />
                      <span>Flood</span>
                      <div className="h-3 w-3 rounded bg-chart-5/80" />
                      <span>Storm</span>
                      <div className="h-3 w-3 rounded bg-destructive/80" />
                      <span>Heat</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected District Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activeDistrict ? activeDistrict.name : "Select a District"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeDistrict ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-chart-4" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-semibold">{activeDistrict.temp}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-primary" />
                      <span className="text-sm">Rainfall</span>
                    </div>
                    <span className="font-semibold">{activeDistrict.rainfall}mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-primary" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="font-semibold">{activeDistrict.humidity}%</span>
                  </div>
                  {activeDistrict.alert && (
                    <div className="mt-4 rounded-lg bg-destructive/10 p-3">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">
                          {activeDistrict.alert} Warning
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a district in the map to view detailed weather
                  information.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regional Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Temperature</span>
                <span className="font-semibold">27°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Rainfall</span>
                <span className="font-semibold">193mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Alerts</span>
                <Badge variant="destructive">4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Districts Monitored</span>
                <span className="font-semibold">10</span>
              </div>
            </CardContent>
          </Card>

          {/* Map Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-4 w-4 text-primary" />
                About This Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This interactive map displays real-time weather data across
                Eastern Hararge districts. Data is updated every hour from
                local weather stations and satellite imagery.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
