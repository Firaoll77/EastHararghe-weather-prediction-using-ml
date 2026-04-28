"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  TemperatureChart,
  RainfallChart,
  HumidityWindChart,
  ModelAccuracyChart,
} from "@/components/forecast-chart"
import { DailyForecast } from "@/components/hourly-forecast"
import {
  Calendar,
  Download,
  Brain,
  TrendingUp,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  Info,
} from "lucide-react"

// Extended forecast data
const extendedForecast = [
  { day: "Today", date: "Apr 19", high: 30, low: 18, condition: "partly-cloudy" as const, precipitation: 30 },
  { day: "Sunday", date: "Apr 20", high: 28, low: 17, condition: "rainy" as const, precipitation: 70 },
  { day: "Monday", date: "Apr 21", high: 26, low: 16, condition: "rainy" as const, precipitation: 85 },
  { day: "Tuesday", date: "Apr 22", high: 27, low: 17, condition: "cloudy" as const, precipitation: 40 },
  { day: "Wednesday", date: "Apr 23", high: 29, low: 18, condition: "partly-cloudy" as const, precipitation: 20 },
  { day: "Thursday", date: "Apr 24", high: 31, low: 19, condition: "sunny" as const, precipitation: 5 },
  { day: "Friday", date: "Apr 25", high: 32, low: 20, condition: "sunny" as const, precipitation: 0 },
]

const temperatureData = [
  { date: "Apr 19", high: 30, low: 18, predicted: 29 },
  { date: "Apr 20", high: 28, low: 17, predicted: 27 },
  { date: "Apr 21", high: 26, low: 16, predicted: 25 },
  { date: "Apr 22", high: 27, low: 17, predicted: 26 },
  { date: "Apr 23", high: 29, low: 18, predicted: 28 },
  { date: "Apr 24", high: 31, low: 19, predicted: 30 },
  { date: "Apr 25", high: 32, low: 20, predicted: 31 },
]

const rainfallData = [
  { date: "Apr 19", rainfall: 8, predicted: 10 },
  { date: "Apr 20", rainfall: 25, predicted: 28 },
  { date: "Apr 21", rainfall: 45, predicted: 42 },
  { date: "Apr 22", rainfall: 15, predicted: 18 },
  { date: "Apr 23", rainfall: 5, predicted: 6 },
  { date: "Apr 24", rainfall: 2, predicted: 2 },
  { date: "Apr 25", rainfall: 0, predicted: 1 },
]

const humidityWindData = [
  { time: "Morning", humidity: 75, windSpeed: 8 },
  { time: "Noon", humidity: 55, windSpeed: 14 },
  { time: "Afternoon", humidity: 60, windSpeed: 12 },
  { time: "Evening", humidity: 70, windSpeed: 10 },
  { time: "Night", humidity: 80, windSpeed: 6 },
]

const modelAccuracy = [
  { model: "Random Forest", accuracy: 94.5, rmse: 1.2 },
  { model: "XGBoost", accuracy: 93.8, rmse: 1.4 },
  { model: "LSTM Neural Net", accuracy: 92.1, rmse: 1.6 },
  { model: "Ensemble", accuracy: 95.2, rmse: 1.1 },
]

const seasonalPredictions = [
  {
    season: "Belg (Spring Rains)",
    months: "March - May",
    prediction: "Above average rainfall expected",
    confidence: 87,
    details: "Increased monsoon activity predicted. Good conditions for early planting.",
  },
  {
    season: "Kiremt (Main Rains)",
    months: "June - September",
    prediction: "Normal to slightly below average",
    confidence: 82,
    details: "Typical seasonal patterns expected with occasional dry spells in August.",
  },
  {
    season: "Bega (Dry Season)",
    months: "October - February",
    prediction: "Drier than usual",
    confidence: 78,
    details: "La Niña conditions may lead to extended dry period. Plan water conservation.",
  },
]

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
}

export default function ForecastPage() {
  const [forecastRange, setForecastRange] = useState("7-day")
  const [selectedParameter, setSelectedParameter] = useState("temperature")

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Forecast</h1>
          <p className="text-muted-foreground">
            Detailed ML-powered weather predictions for Eastern Hararge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={forecastRange} onValueChange={setForecastRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-day">3 Day</SelectItem>
              <SelectItem value="7-day">7 Day</SelectItem>
              <SelectItem value="14-day">14 Day</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ML Info Badge */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          Ensemble Model Prediction
        </Badge>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          95.2% Accuracy
        </Badge>
        <Badge variant="outline" className="gap-1">
          RMSE: 1.1°C
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="daily" className="mt-6">
        <TabsList>
          <TabsTrigger value="daily">Daily Forecast</TabsTrigger>
          <TabsTrigger value="charts">Detailed Charts</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Outlook</TabsTrigger>
          <TabsTrigger value="accuracy">Model Performance</TabsTrigger>
        </TabsList>

        {/* Daily Forecast Tab */}
        <TabsContent value="daily" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Extended Forecast</CardTitle>
                  <CardDescription>
                    Machine learning predicted weather conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {extendedForecast.map((day, index) => {
                      const Icon = weatherIcons[day.condition]
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24">
                              <div className="font-medium">{day.day}</div>
                              <div className="text-sm text-muted-foreground">
                                {day.date}
                              </div>
                            </div>
                            <Icon className="h-10 w-10 text-primary" />
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-chart-4" />
                              <span className="font-semibold">{day.high}°</span>
                              <span className="text-muted-foreground">
                                / {day.low}°
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-primary" />
                              <span>{day.precipitation}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-accent" />
                              <span>12 km/h</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forecast Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg High</span>
                    <span className="font-semibold">29°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Low</span>
                    <span className="font-semibold">18°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Rain</span>
                    <span className="font-semibold">100mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rainy Days</span>
                    <span className="font-semibold">3 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agricultural Advisory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg bg-warning/10 p-3 text-warning">
                      <p className="font-medium">Rain Alert</p>
                      <p className="mt-1 text-xs opacity-80">
                        Heavy rain expected Sun-Mon. Delay planting and harvest
                        activities.
                      </p>
                    </div>
                    <div className="rounded-lg bg-accent/10 p-3 text-accent">
                      <p className="font-medium">Optimal Conditions</p>
                      <p className="mt-1 text-xs opacity-80">
                        Thu-Fri ideal for field work with sunny conditions and
                        moderate temperatures.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Detailed Charts Tab */}
        <TabsContent value="charts" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Select Parameter:
            </span>
            <Select
              value={selectedParameter}
              onValueChange={setSelectedParameter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="rainfall">Rainfall</SelectItem>
                <SelectItem value="humidity">Humidity & Wind</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TemperatureChart data={temperatureData} />
            <RainfallChart data={rainfallData} />
          </div>
          <HumidityWindChart data={humidityWindData} />
        </TabsContent>

        {/* Seasonal Outlook Tab */}
        <TabsContent value="seasonal" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {seasonalPredictions.map((season, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{season.season}</CardTitle>
                    <Badge variant="outline">{season.confidence}% conf.</Badge>
                  </div>
                  <CardDescription>{season.months}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-primary">{season.prediction}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {season.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                About Seasonal Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our seasonal predictions use a combination of historical climate
                data, global climate indices (ENSO, IOD), and machine learning
                models to forecast weather patterns 1-3 months in advance. These
                predictions are updated monthly and should be used for long-term
                planning purposes. For specific dates, refer to the daily
                forecast.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Performance Tab */}
        <TabsContent value="accuracy" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ModelAccuracyChart data={modelAccuracy} />

            <Card>
              <CardHeader>
                <CardTitle>Model Details</CardTitle>
                <CardDescription>
                  Performance metrics for our prediction models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelAccuracy.map((model, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <div>
                        <p className="font-medium">{model.model}</p>
                        <p className="text-sm text-muted-foreground">
                          RMSE: {model.rmse}°C
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {model.accuracy}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Accuracy
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Training Data & Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Training Data</p>
                  <p className="mt-1 text-2xl font-bold text-primary">15 Years</p>
                  <p className="text-xs text-muted-foreground">
                    Historical weather records (2010-2025)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data Points</p>
                  <p className="mt-1 text-2xl font-bold text-primary">2.5M+</p>
                  <p className="text-xs text-muted-foreground">
                    Observations across Eastern Hararge
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Update Frequency</p>
                  <p className="mt-1 text-2xl font-bold text-primary">Hourly</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time data integration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
