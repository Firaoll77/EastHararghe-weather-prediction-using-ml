"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ModelAccuracyChart } from "@/components/forecast-chart"
import {
  Users,
  Database,
  Brain,
  Settings,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  Trash2,
  Edit,
  UserPlus,
  Shield,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock users data
const users = [
  {
    id: "1",
    name: "Abebe Bekele",
    email: "abebe@example.com",
    role: "farmer",
    location: "Harar City",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Fatima Ahmed",
    email: "fatima@gov.et",
    role: "official",
    location: "Eastern Hararge",
    status: "active",
    lastActive: "5 minutes ago",
  },
  {
    id: "3",
    name: "Yohannes Tadesse",
    email: "yohannes@example.com",
    role: "resident",
    location: "Gursum",
    status: "inactive",
    lastActive: "3 days ago",
  },
  {
    id: "4",
    name: "Dr. Solomon Haile",
    email: "solomon@met.gov.et",
    role: "engineer",
    location: "Harar City",
    status: "active",
    lastActive: "1 hour ago",
  },
]

const datasets = [
  {
    id: "1",
    name: "Temperature Data 2020-2025",
    records: 1825000,
    size: "245 MB",
    lastUpdated: "Apr 19, 2026",
    status: "active",
  },
  {
    id: "2",
    name: "Rainfall Data 2020-2025",
    records: 912000,
    size: "128 MB",
    lastUpdated: "Apr 19, 2026",
    status: "active",
  },
  {
    id: "3",
    name: "Humidity Data 2020-2025",
    records: 876000,
    size: "98 MB",
    lastUpdated: "Apr 18, 2026",
    status: "processing",
  },
  {
    id: "4",
    name: "Historical Alerts",
    records: 2450,
    size: "12 MB",
    lastUpdated: "Apr 15, 2026",
    status: "active",
  },
]

const modelPerformance = [
  { model: "Random Forest", accuracy: 94.5, rmse: 1.2 },
  { model: "XGBoost", accuracy: 93.8, rmse: 1.4 },
  { model: "LSTM Neural Net", accuracy: 92.1, rmse: 1.6 },
  { model: "Ensemble", accuracy: 95.2, rmse: 1.1 },
]

const systemStats = {
  uptime: "99.9%",
  apiRequests: "45,230",
  activeUsers: "1,245",
  predictions: "12,890",
  dataProcessed: "2.5 TB",
  avgResponseTime: "120ms",
}

const roleBadges = {
  farmer: "bg-accent/20 text-accent",
  official: "bg-chart-5/20 text-chart-5",
  resident: "bg-primary/20 text-primary",
  engineer: "bg-chart-4/20 text-chart-4",
  admin: "bg-destructive/20 text-destructive",
}

export default function AdminPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, datasets, and system settings
          </p>
        </div>
        <Badge variant="outline" className="gap-1 w-fit">
          <Shield className="h-3 w-3" />
          Administrator Access
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-accent/10 p-3">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.uptime}</p>
              <p className="text-sm text-muted-foreground">System Uptime</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-4/10 p-3">
              <Brain className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.predictions}</p>
              <p className="text-sm text-muted-foreground">Predictions Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-chart-1/10 p-3">
              <Server className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.avgResponseTime}</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="datasets" className="gap-2">
            <Database className="h-4 w-4" />
            Datasets
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Brain className="h-4 w-4" />
            ML Models
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage registered users and their permissions
                </CardDescription>
              </div>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">User</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Location</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Last Active</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border/50 hover:bg-secondary/30"
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={cn(
                              "capitalize",
                              roleBadges[user.role as keyof typeof roleBadges]
                            )}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3">{user.location}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                            className={
                              user.status === "active"
                                ? "bg-accent/20 text-accent"
                                : ""
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {user.lastActive}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weather Datasets</CardTitle>
                <CardDescription>
                  Manage weather data used for ML training
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dataset.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{dataset.records.toLocaleString()} records</span>
                          <span>{dataset.size}</span>
                          <span>Updated: {dataset.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          dataset.status === "active"
                            ? "bg-accent/20 text-accent"
                            : "bg-warning/20 text-warning"
                        }
                      >
                        {dataset.status === "active" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {dataset.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Models Tab */}
        <TabsContent value="models" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ModelAccuracyChart data={modelPerformance} />

            <Card>
              <CardHeader>
                <CardTitle>Model Management</CardTitle>
                <CardDescription>
                  Train, evaluate, and deploy ML models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-accent/10 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Ensemble Model</p>
                      <p className="text-sm text-muted-foreground">
                        Currently deployed
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">Active</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Model Actions</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retrain Model
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Evaluate Performance
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-medium">Last Training</h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>Apr 15, 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>2h 45m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Points:</span>
                      <span>2.5M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Current system resource usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>CPU Usage</span>
                    </div>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: "42%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>Memory Usage</span>
                    </div>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-warning"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span>Storage Usage</span>
                    </div>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: "35%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>
                  Configure weather alert parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flood-threshold">
                    Flood Warning (mm rainfall/day)
                  </Label>
                  <Input id="flood-threshold" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heat-threshold">
                    Heat Warning (°C)
                  </Label>
                  <Input id="heat-threshold" type="number" defaultValue="38" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wind-threshold">
                    Storm Warning (km/h wind)
                  </Label>
                  <Input id="wind-threshold" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drought-threshold">
                    Drought Warning (days without rain)
                  </Label>
                  <Input id="drought-threshold" type="number" defaultValue="14" />
                </div>
                <Button className="mt-4 w-full">Save Configuration</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
