"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ActivityChart,
  generateRunningData,
  generateSwimmingData,
  generateCyclingData,
  generateTrainingIntensityData,
  generateCalorieData,
  generateRecoveryData,
} from "@/components/ui/activity-chart";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate sample data for charts
  const runningData = generateRunningData();
  const swimmingData = generateSwimmingData();
  const cyclingData = generateCyclingData();
  const intensityData = generateTrainingIntensityData();
  const calorieData = generateCalorieData();
  const recoveryData = generateRecoveryData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with max-width and centering for large screens */}
      <header className="border-b w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="font-bold text-lg">
            SportAI Chat
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/chat">Chat</Link>
            <Button variant="outline" asChild>
              <Link href="/signin">Sign Out</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </div>

        {/* Mobile navigation dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t max-w-7xl mx-auto w-full">
            <nav className="flex flex-col py-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chat
              </Link>
              <Link
                href="/signin"
                className="px-4 py-2 hover:bg-slate-100 text-red-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Out
              </Link>
            </nav>
          </div>
        )}
      </header>
      {/* Main content with max-width and centering for large screens */}
      <main className="flex-1 py-8 w-full">
        <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Running Performance</CardTitle>
              <CardDescription>
                Weekly distance vs. goal: {runningData.goal}km
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="line"
                title="Weekly Running Distance"
                data={runningData.data}
                goal={runningData.goal}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Swimming Progress</CardTitle>
              <CardDescription>
                Weekly distance vs. goal: {swimmingData.goal}km
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="line"
                title="Weekly Swimming Distance"
                data={swimmingData.data}
                goal={swimmingData.goal}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cycling Stats</CardTitle>
              <CardDescription>
                Weekly distance vs. goal: {cyclingData.goal}km
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="line"
                title="Weekly Cycling Distance"
                data={cyclingData.data}
                goal={cyclingData.goal}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Training Intensity</CardTitle>
              <CardDescription>
                Weekly intensity breakdown (minutes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="bar"
                title="Training Intensity (minutes)"
                data={intensityData.data}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Calorie Expenditure</CardTitle>
              <CardDescription>
                Daily burn vs. goal: {calorieData.goal} calories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="bar"
                title="Daily Calorie Burn"
                data={calorieData.data}
                goal={calorieData.goal}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recovery Metrics</CardTitle>
              <CardDescription>
                Sleep duration vs. goal: {recoveryData.goal} hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="line"
                title="Sleep Duration"
                data={recoveryData.data}
                goal={recoveryData.goal}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
