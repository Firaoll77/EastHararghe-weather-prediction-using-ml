"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Droplets,
} from "lucide-react"

interface HourlyForecastProps {
  data: Array<{
    time: string
    temperature: number
    condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy"
    precipitation: number
  }>
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>24-Hour Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {data.map((hour, index) => {
              const Icon = weatherIcons[hour.condition]
              return (
                <div
                  key={index}
                  className="flex min-w-[80px] flex-col items-center gap-2 rounded-lg bg-secondary/50 p-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {hour.time}
                  </span>
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-lg font-semibold">
                    {hour.temperature}°
                  </span>
                  {hour.precipitation > 0 && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Droplets className="h-3 w-3" />
                      {hour.precipitation}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface DailyForecastProps {
  data: Array<{
    day: string
    date: string
    high: number
    low: number
    condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy"
    precipitation: number
  }>
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((day, index) => {
            const Icon = weatherIcons[day.condition]
            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
              >
                <div className="w-24">
                  <div className="font-medium">{day.day}</div>
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                </div>
                <Icon className="h-8 w-8 text-primary" />
                <div className="flex items-center gap-2">
                  {day.precipitation > 0 && (
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Droplets className="h-4 w-4" />
                      {day.precipitation}%
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="font-semibold">{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
