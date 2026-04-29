"use client"

import { useState, useEffect, useCallback } from "react"
import { weatherService, predictionsService, locationsService } from "@/lib/api"
import type {
  WeatherData,
  WeatherForecast,
  LocationListItem,
  PredictionResponse,
  ModelStatus,
} from "@/lib/api/types"

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

export function useDashboardData() {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>({
    weather: null,
    forecasts: [],
    prediction: null,
    modelStatus: null,
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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

  return {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    selectedLocationName,
    isLoading,
    isRefreshing,
    error,
    data,
    lastUpdated,
    handleRefresh,
  }
}

export type { DashboardData, LocationOption }
