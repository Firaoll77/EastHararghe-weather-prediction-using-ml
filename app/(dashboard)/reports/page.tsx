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
import { TemperatureChart, RainfallChart } from "@/components/forecast-chart"
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Table,
  BarChart3,
  Clock,
  MapPin,
  FileDown,
  Printer,
} from "lucide-react"

// Mock historical data
const historicalData = [
  { month: "Jan 2026", avgTemp: 22, totalRain: 15, avgHumidity: 55 },
  { month: "Feb 2026", avgTemp: 24, totalRain: 20, avgHumidity: 52 },
  { month: "Mar 2026", avgTemp: 26, totalRain: 45, avgHumidity: 60 },
  { month: "Apr 2026", avgTemp: 28, totalRain: 85, avgHumidity: 70 },
]

const temperatureChartData = [
  { date: "Week 1", high: 30, low: 18 },
  { date: "Week 2", high: 32, low: 20 },
  { date: "Week 3", high: 28, low: 17 },
  { date: "Week 4", high: 29, low: 19 },
]

const rainfallChartData = [
  { date: "Week 1", rainfall: 25 },
  { date: "Week 2", rainfall: 12 },
  { date: "Week 3", rainfall: 35 },
  { date: "Week 4", rainfall: 18 },
]

const savedReports = [
  {
    id: "1",
    name: "April 2026 Monthly Summary",
    type: "Monthly",
    location: "Harar City",
    createdAt: "Apr 15, 2026",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Q1 2026 Agricultural Report",
    type: "Quarterly",
    location: "Eastern Hararge",
    createdAt: "Apr 01, 2026",
    size: "5.8 MB",
  },
  {
    id: "3",
    name: "March Rainfall Analysis",
    type: "Custom",
    location: "Gursum, Fedis",
    createdAt: "Mar 31, 2026",
    size: "1.2 MB",
  },
]

const locations = [
  "All Districts",
  "Harar City",
  "Gursum",
  "Babile",
  "Fedis",
  "Kombolcha",
  "Jarso",
  "Chinaksen",
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly")
  const [selectedLocation, setSelectedLocation] = useState("All Districts")
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Reports</h1>
          <p className="text-muted-foreground">
            Generate and download weather reports and historical data
          </p>
        </div>
        <Button className="gap-2">
          <FileDown className="h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="mt-6">
        <TabsList>
          <TabsTrigger value="generate" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </TabsTrigger>
          <TabsTrigger value="historical" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Historical Data
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Download className="h-4 w-4" />
            Saved Reports
          </TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Select parameters for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="monthly">Monthly Summary</SelectItem>
                      <SelectItem value="quarterly">Quarterly Report</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reportType === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Include Data</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Temperature</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Rainfall</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Humidity</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Wind Speed</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">ML Predictions</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Generate
                  </Button>
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Preview of your report data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-secondary/30 p-6">
                  <div className="mb-6 border-b border-border pb-4">
                    <h3 className="text-xl font-bold">
                      Weather Report - April 2026
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation} | Monthly Summary
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">28°C</p>
                      <p className="text-sm text-muted-foreground">
                        Avg Temperature
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">90mm</p>
                      <p className="text-sm text-muted-foreground">
                        Total Rainfall
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">68%</p>
                      <p className="text-sm text-muted-foreground">
                        Avg Humidity
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium">Key Findings</h4>
                      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                        <li>Above average rainfall for the season</li>
                        <li>Temperature within normal range</li>
                        <li>4 weather alerts issued during the period</li>
                        <li>ML prediction accuracy: 94.5%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="historical" className="mt-6">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">View:</span>
            </div>
            <Select defaultValue="2026">
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="harar">Harar City</SelectItem>
                <SelectItem value="gursum">Gursum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TemperatureChart data={temperatureChartData} />
            <RainfallChart data={rainfallChartData} />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Monthly Summary Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Month</th>
                      <th className="p-3 text-left font-medium">Avg Temp (°C)</th>
                      <th className="p-3 text-left font-medium">Total Rain (mm)</th>
                      <th className="p-3 text-left font-medium">Avg Humidity (%)</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-border/50 hover:bg-secondary/30"
                      >
                        <td className="p-3">{row.month}</td>
                        <td className="p-3">{row.avgTemp}</td>
                        <td className="p-3">{row.totalRain}</td>
                        <td className="p-3">{row.avgHumidity}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>
                Previously generated reports available for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.createdAt}
                          </span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.type}</Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
