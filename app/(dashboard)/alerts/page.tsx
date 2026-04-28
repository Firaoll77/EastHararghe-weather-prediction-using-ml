"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  AlertTriangle,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Settings,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Volume2,
  Mail,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock alerts data
const allAlerts = [
  {
    id: "1",
    type: "flood" as const,
    severity: "warning" as const,
    title: "Flash Flood Warning",
    description: "Heavy rainfall may cause flash flooding in low-lying areas. Avoid streams and drainage areas.",
    location: "Harar City, Fedis",
    validUntil: "Apr 20, 2026 18:00",
    issuedAt: "Apr 19, 2026 10:00",
    status: "active",
  },
  {
    id: "2",
    type: "storm" as const,
    severity: "watch" as const,
    title: "Thunderstorm Watch",
    description: "Conditions favorable for thunderstorms this evening. Lightning and strong winds possible.",
    location: "Eastern Hararge Region",
    validUntil: "Apr 19, 2026 23:00",
    issuedAt: "Apr 19, 2026 08:00",
    status: "active",
  },
  {
    id: "3",
    type: "heat" as const,
    severity: "advisory" as const,
    title: "Heat Advisory",
    description: "High temperatures expected. Stay hydrated and avoid prolonged outdoor activities.",
    location: "Midega Tola, Babile",
    validUntil: "Apr 19, 2026 17:00",
    issuedAt: "Apr 19, 2026 06:00",
    status: "active",
  },
  {
    id: "4",
    type: "flood" as const,
    severity: "warning" as const,
    title: "River Flood Warning",
    description: "Erer River water levels rising. Evacuate flood-prone areas if necessary.",
    location: "Gursum, Chinaksen",
    validUntil: "Apr 21, 2026 12:00",
    issuedAt: "Apr 19, 2026 12:00",
    status: "active",
  },
  {
    id: "5",
    type: "drought" as const,
    severity: "advisory" as const,
    title: "Drought Outlook",
    description: "Below average rainfall expected for the coming month. Implement water conservation measures.",
    location: "Southern Districts",
    validUntil: "May 15, 2026",
    issuedAt: "Apr 15, 2026",
    status: "expired",
  },
]

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

export default function AlertsPage() {
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sound: true,
  })

  const activeAlerts = allAlerts.filter((a) => a.status === "active")
  const expiredAlerts = allAlerts.filter((a) => a.status === "expired")

  const filteredAlerts = activeAlerts.filter((alert) => {
    if (filterType !== "all" && alert.type !== filterType) return false
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Alerts</h1>
          <p className="text-muted-foreground">
            Early warning system for extreme weather conditions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1">
            <Bell className="h-3 w-3" />
            {activeAlerts.length} Active
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active Alerts
            <Badge variant="secondary" className="ml-1">
              {activeAlerts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flood">Flood</SelectItem>
                  <SelectItem value="storm">Storm</SelectItem>
                  <SelectItem value="heat">Heat</SelectItem>
                  <SelectItem value="drought">Drought</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-accent/10 p-4">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Active Alerts</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Weather conditions are currently normal for your selected filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const Icon = alertIcons[alert.type]
                return (
                  <Card
                    key={alert.id}
                    className={cn("border-l-4", severityColors[alert.severity])}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                              alert.severity === "warning"
                                ? "bg-destructive/20"
                                : alert.severity === "watch"
                                ? "bg-warning/20"
                                : "bg-primary/20"
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{alert.title}</h3>
                              <Badge className={severityBadge[alert.severity]}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Valid until: {alert.validUntil}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Past weather alerts and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiredAlerts.map((alert) => {
                  const Icon = alertIcons[alert.type]
                  return (
                    <div
                      key={alert.id}
                      className="flex items-center gap-4 rounded-lg bg-secondary/30 p-4 opacity-70"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.location} - Expired {alert.validUntil}
                        </p>
                      </div>
                      <Badge variant="outline">Expired</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive weather alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Browser push notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Play sound for urgent alerts
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sound}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sound: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>
                  Set custom thresholds for weather alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temp-high">High Temperature Alert (°C)</Label>
                  <Input id="temp-high" type="number" defaultValue="35" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp-low">Low Temperature Alert (°C)</Label>
                  <Input id="temp-low" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rainfall">Heavy Rainfall Alert (mm/day)</Label>
                  <Input id="rainfall" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wind">High Wind Alert (km/h)</Label>
                  <Input id="wind" type="number" defaultValue="60" />
                </div>
                <Button className="mt-4 w-full">Save Thresholds</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
