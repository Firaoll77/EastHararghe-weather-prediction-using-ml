"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"

interface Profile {
  id: string
  full_name: string | null
  email: string
  role: "resident" | "farmer" | "official"
  location: string | null
  created_at: string
  updated_at: string
}

interface ProfileResponse {
  success: boolean
  profile: Profile
}

interface UpdateProfileRequest {
  full_name?: string
  role?: "resident" | "farmer" | "official"
  location?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch")
  }
  return res.json()
}

const patchFetcher = async (url: string, { arg }: { arg: UpdateProfileRequest }) => {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to update")
  }
  return res.json()
}

/**
 * Hook for fetching and updating user profile
 */
export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher
  )

  const { trigger: updateProfile, isMutating: isUpdating } = useSWRMutation<
    ProfileResponse,
    Error,
    string,
    UpdateProfileRequest
  >("/api/profile", patchFetcher, {
    onSuccess: () => mutate(),
  })

  return {
    profile: data?.profile,
    error,
    isLoading,
    updateProfile,
    isUpdating,
    refresh: mutate,
  }
}
