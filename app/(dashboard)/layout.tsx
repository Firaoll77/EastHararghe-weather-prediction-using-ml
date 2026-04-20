import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AlertBanner } from "@/components/alert-banner"
import { createClient } from "@/lib/supabase/server"

// Mock alerts for demo - these would come from a database or API in production
const mockAlerts = [
  {
    id: "1",
    type: "flood" as const,
    severity: "warning" as const,
    title: "Flood Warning",
    message: "Heavy rainfall expected in low-lying areas of Harar. Take precautionary measures.",
  },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Redirect to login if not authenticated
  if (error || !user) {
    redirect("/auth/login")
  }
  
  // Fetch user profile from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  const userData = {
    name: profile?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    role: (profile?.role as "resident" | "farmer" | "official" | "admin") || "resident",
  }

  return (
    <div className="min-h-screen bg-background">
      <AlertBanner alerts={mockAlerts} />
      <Navigation user={userData} />
      <main>{children}</main>
    </div>
  )
}
