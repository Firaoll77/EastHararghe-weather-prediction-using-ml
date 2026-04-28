"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  X,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Bell,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherAlertProps {
  id: string
  type: "flood" | "drought" | "storm" | "heat" | "cold"
  severity: "warning" | "watch" | "advisory"
  title: string
  description: string
  location: string
  validUntil: string
  onDismiss?: (id: string) => void
}

const alertIcons = {
  flood: CloudRain,
  drought: Droplets,
  storm: Wind,
  heat: Thermometer,
  cold: Thermometer,
}

const severityColors = {
  warning: "bg-destructive/10 border-destructive/50 text-destructive",
  watch: "bg-warning/10 border-warning/50 text-warning",
  advisory: "bg-primary/10 border-primary/50 text-primary",
}

const severityBadge = {
  warning: "bg-destructive text-destructive-foreground",
  watch: "bg-warning text-warning-foreground",
  advisory: "bg-primary text-primary-foreground",
}

export function WeatherAlert({
  id,
  type,
  severity,
  title,
  description,
  location,
  validUntil,
  onDismiss,
}: WeatherAlertProps) {
  const Icon = alertIcons[type]

  return (
    <Alert className={cn("relative", severityColors[severity])}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2">
        {title}
        <Badge className={severityBadge[severity]}>{severity}</Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{description}</p>
        <div className="mt-2 flex items-center gap-4 text-xs opacity-80">
          <span>Location: {location}</span>
          <span>Valid until: {validUntil}</span>
        </div>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => onDismiss(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

interface AlertListProps {
  alerts: Array<{
    id: string
    type: "flood" | "drought" | "storm" | "heat" | "cold"
    severity: "warning" | "watch" | "advisory"
    title: string
    description: string
    location: string
    validUntil: string
    timestamp: string
  }>
}

export function AlertList({ alerts }: AlertListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Active Weather Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-accent/10 p-3">
              <Bell className="h-6 w-6 text-accent" />
            </div>
            <p className="mt-3 font-medium">No Active Alerts</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Weather conditions are currently normal for Eastern Hararge
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alertIcons[alert.type]
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    severityColors[alert.severity]
                  )}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{alert.title}</p>
                      <Badge className={cn("text-xs", severityBadge[alert.severity])}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs opacity-70">
                      <span>{alert.location}</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AlertBannerProps {
  alerts: Array<{
    id: string
    type: "flood" | "drought" | "storm" | "heat" | "cold"
    severity: "warning" | "watch" | "advisory"
    title: string
    message: string
  }>
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([])

  const activeAlerts = alerts.filter((a) => !dismissed.includes(a.id))
  const criticalAlert = activeAlerts.find((a) => a.severity === "warning")

  if (!criticalAlert) return null

  const Icon = alertIcons[criticalAlert.type]

  return (
    <div className="bg-destructive/10 border-b border-destructive/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <Icon className="h-5 w-5 text-destructive" />
          <div>
            <span className="font-medium text-destructive">
              {criticalAlert.title}:
            </span>{" "}
            <span className="text-sm text-destructive/90">
              {criticalAlert.message}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/20 hover:text-destructive"
          onClick={() => setDismissed([...dismissed, criticalAlert.id])}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
