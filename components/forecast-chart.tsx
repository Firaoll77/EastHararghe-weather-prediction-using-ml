"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts"

interface TemperatureChartProps {
  data: Array<{
    date: string
    high: number
    low: number
    predicted?: number
  }>
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="highTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.2 30)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.2 30)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="lowTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.7 0.15 220)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.7 0.15 220)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 250)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.015 250)",
                  border: "1px solid oklch(0.28 0.02 250)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
                labelStyle={{ color: "oklch(0.65 0.02 250)" }}
              />
              <Area
                type="monotone"
                dataKey="high"
                stroke="oklch(0.65 0.2 30)"
                fill="url(#highTemp)"
                strokeWidth={2}
                name="High"
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="oklch(0.7 0.15 220)"
                fill="url(#lowTemp)"
                strokeWidth={2}
                name="Low"
              />
              {data[0]?.predicted !== undefined && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="oklch(0.75 0.18 150)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="ML Predicted"
                />
              )}
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface RainfallChartProps {
  data: Array<{
    date: string
    rainfall: number
    predicted?: number
  }>
}

export function RainfallChart({ data }: RainfallChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rainfall Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 250)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}mm`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.015 250)",
                  border: "1px solid oklch(0.28 0.02 250)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
                labelStyle={{ color: "oklch(0.65 0.02 250)" }}
              />
              <Bar
                dataKey="rainfall"
                fill="oklch(0.7 0.15 220)"
                radius={[4, 4, 0, 0]}
                name="Actual"
              />
              {data[0]?.predicted !== undefined && (
                <Bar
                  dataKey="predicted"
                  fill="oklch(0.75 0.18 150)"
                  radius={[4, 4, 0, 0]}
                  name="Predicted"
                />
              )}
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface HumidityWindChartProps {
  data: Array<{
    time: string
    humidity: number
    windSpeed: number
  }>
}

export function HumidityWindChart({ data }: HumidityWindChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Humidity & Wind Speed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 250)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}km/h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.015 250)",
                  border: "1px solid oklch(0.28 0.02 250)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
                labelStyle={{ color: "oklch(0.65 0.02 250)" }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                stroke="oklch(0.7 0.15 220)"
                strokeWidth={2}
                dot={false}
                name="Humidity %"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="windSpeed"
                stroke="oklch(0.75 0.18 150)"
                strokeWidth={2}
                dot={false}
                name="Wind km/h"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface ModelAccuracyChartProps {
  data: Array<{
    model: string
    accuracy: number
    rmse: number
  }>
}

export function ModelAccuracyChart({ data }: ModelAccuracyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ML Model Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.02 250)"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="model"
                stroke="oklch(0.65 0.02 250)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.015 250)",
                  border: "1px solid oklch(0.28 0.02 250)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
                labelStyle={{ color: "oklch(0.65 0.02 250)" }}
              />
              <Bar
                dataKey="accuracy"
                fill="oklch(0.7 0.15 220)"
                radius={[0, 4, 4, 0]}
                name="Accuracy"
              />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
