"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import type { PredictionResponse } from "@/lib/ml-api"

interface PredictionRequest {
  locationId: string
  temperature?: number
  humidity?: number
  pressure?: number
  wind_speed?: number
}

interface PredictionResult {
  success: boolean
  prediction: PredictionResponse
  location: {
    id: string
    name: string
    lat: number
    lon: number
  }
}

interface PredictionHistoryItem {
  id: string
  user_id: string
  location: string
  rainfall_prediction: number
  confidence_score: number
  input_features: Record<string, unknown>
  created_at: string
}

interface PredictionHistoryResponse {
  success: boolean
  predictions: PredictionHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch")
  }
  return res.json()
}

const postFetcher = async (url: string, { arg }: { arg: PredictionRequest }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch")
  }
  return res.json()
}

/**
 * Hook for making ML predictions
 */
export function usePrediction() {
  const { trigger, data, error, isMutating } = useSWRMutation<
    PredictionResult,
    Error,
    string,
    PredictionRequest
  >("/api/predict", postFetcher)

  return {
    predict: trigger,
    prediction: data,
    error,
    isLoading: isMutating,
  }
}

/**
 * Hook for fetching prediction history
 */
export function usePredictionHistory(page = 1, limit = 10, location?: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (location) params.set("location", location)

  const { data, error, isLoading, mutate } = useSWR<PredictionHistoryResponse>(
    `/api/predictions?${params.toString()}`,
    fetcher
  )

  const deletePrediction = async (predictionId: string) => {
    await fetch("/api/predictions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictionId }),
    })
    mutate()
  }

  return {
    predictions: data?.predictions || [],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh: mutate,
    deletePrediction,
  }
}

/**
 * Hook for fetching forecast data
 */
export function useForecast(locationId: string, days = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    locationId ? `/api/forecast?locationId=${locationId}&days=${days}` : null,
    fetcher
  )

  return {
    forecast: data?.forecast,
    location: data?.location,
    error,
    isLoading,
    refresh: mutate,
  }
}

/**
 * Hook for fetching available locations
 */
export function useLocations() {
  const { data, error, isLoading } = useSWR("/api/locations", fetcher)

  return {
    locations: data?.locations || [],
    error,
    isLoading,
  }
}
