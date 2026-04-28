"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherCardProps {
  location: string
  temperature: number
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy" | "stormy"
  humidity: number
  windSpeed: number
  pressure: number
  feelsLike: number
  className?: string
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
  stormy: CloudRain,
}

const conditionLabels = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  "partly-cloudy": "Partly Cloudy",
  rainy: "Rainy",
  stormy: "Stormy",
}

export function WeatherCard({
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  pressure,
  feelsLike,
  className,
}: WeatherCardProps) {
  const WeatherIcon = weatherIcons[condition]

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{location}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {conditionLabels[condition]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WeatherIcon className="h-16 w-16 text-primary" />
            <div>
              <div className="text-5xl font-bold tracking-tighter">
                {temperature}°
              </div>
              <div className="text-sm text-muted-foreground">
                Feels like {feelsLike}°C
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{windSpeed} km/h</div>
              <div className="text-xs text-muted-foreground">Wind</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{pressure} hPa</div>
              <div className="text-xs text-muted-foreground">Pressure</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface WeatherStatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: "temperature" | "humidity" | "wind" | "pressure" | "rainfall" | "feelsLike"
  trend?: {
    value: number
    direction: "up" | "down"
  }
  className?: string
}

const statIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  wind: Wind,
  pressure: Gauge,
  rainfall: CloudRain,
  feelsLike: Thermometer,
}

export function WeatherStatCard({
  title,
  value,
  unit,
  icon,
  trend,
  className,
}: WeatherStatCardProps) {
  const Icon = statIcons[icon]

  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{value}</span>
              {unit && <span className="text-muted-foreground">{unit}</span>}
            </div>
            {trend && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  trend.direction === "up"
                    ? "text-destructive"
                    : "text-accent"
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.value}% from
                yesterday
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
