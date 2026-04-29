"use client"

import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import ResidentDashboard from "@/components/dashboards/resident-dashboard"
import FarmerDashboard from "@/components/dashboards/farmer-dashboard"
import GovernmentDashboard from "@/components/dashboards/government-dashboard"
import type { UserRole } from "@/lib/api/types"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const userRole = (user?.user_metadata?.role as UserRole) || "resident"

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  switch (userRole) {
    case "farmer":
      return <FarmerDashboard />
    case "government":
      return <GovernmentDashboard />
    default:
      return <ResidentDashboard />
  }
}
