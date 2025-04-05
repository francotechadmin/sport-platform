"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ActivityChart,
  generateRunningData,
  generateTrainingIntensityData,
} from "@/components/ui/activity-chart";
import { OnboardingModal } from "@/components/ui/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [value, setValue] = useState(60);

  useEffect(() => {
    // Check if the user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(
      "hasCompletedOnboarding"
    );
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }

    // Simulate progress animation
    const interval = setInterval(() => {
      setValue((v) => (v >= 100 ? 100 : v + 1));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setShowOnboarding(false);
  };

  // Generate sample data for charts
  const runningData = generateRunningData();
  const intensityData = generateTrainingIntensityData();

  // Mock data for stats
  const stats = {
    streak: 7,
    performanceImprovement: 12,
    lastSession: "Yesterday",
    totalSessions: 124,
  };

  // Mock data for recent logs
  const recentLogs = [
    {
      id: 1,
      type: "Run",
      date: "Today",
      duration: "45 min",
      distance: "5.2 km",
      intensity: "High",
    },
    {
      id: 2,
      type: "Swim",
      date: "Yesterday",
      duration: "30 min",
      distance: "1.5 km",
      intensity: "Medium",
    },
    {
      id: 3,
      type: "Strength",
      date: "2 days ago",
      duration: "60 min",
      sets: "12",
      intensity: "High",
    },
  ];

  // Mock data for goals
  const goals = [
    {
      id: 1,
      title: "Weekly Running Distance",
      current: 24,
      target: 30,
      unit: "km",
    },
    {
      id: 2,
      title: "Strength Sessions",
      current: 2,
      target: 3,
      unit: "sessions",
    },
    { id: 3, title: "Active Recovery", current: 1, target: 2, unit: "days" },
  ];

  // Mock data for reflection highlights
  const reflections = [
    {
      id: 1,
      date: "Yesterday",
      insight: "Noticed increased endurance after changing breathing pattern",
      sentiment: "positive",
    },
    {
      id: 2,
      date: "3 days ago",
      insight: "Struggled with motivation. Need to vary workout routine.",
      sentiment: "neutral",
    },
  ];

  return (
    <div className="px-4 py-6 w-full">
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Top Section: Stats Summary and Graph Module */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Welcome back, Athlete</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Stats summary cards */}
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-sm text-muted-foreground">
                Training Streak
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.streak}</span>
                <span className="ml-1 text-sm">days</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-full bg-muted h-1 rounded-full">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{ width: `${(stats.streak / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-sm text-muted-foreground">
                Performance Improvement
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">
                  +{stats.performanceImprovement}%
                </span>
              </div>
              <div className="text-xs text-emerald-500 mt-2">
                ↑ 4% from last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-sm text-muted-foreground">Last Session</div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.lastSession}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                45 min high intensity run
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-sm text-muted-foreground">
                Total Sessions
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">
                  {stats.totalSessions}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Since you started
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graph module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="line"
                title="Weekly Performance"
                data={runningData.data}
                goal={runningData.goal}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Areas to Improve</CardTitle>
              <CardDescription>Focus on these metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart
                type="bar"
                title="Training Intensity (minutes)"
                data={intensityData.data}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Center Section: GPT Chat Input */}
      <div className="mb-8">
        <Card className="bg-muted/30 relative overflow-hidden border-primary/20">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <h3 className="font-semibold text-primary">AI Coach</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask me anything about your training or reflect on your
                performance
              </p>
            </div>

            <div className="relative mb-4">
              <Input
                className="pr-24 py-6 text-base"
                placeholder="Ask a question or start a reflection..."
              />
              <Button className="absolute right-1 top-1/2 transform -translate-y-1/2">
                Ask AI
              </Button>
            </div>

            <div className="bg-background/70 p-4 rounded-md mb-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  AI
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Based on your recent performances, I recommend focusing on:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>
                        Improving running cadence (currently 162 SPM, target
                        175-180)
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>
                        Adding one more recovery day to your weekly schedule
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/chat">Open Full AI Coach</Link>
              </Button>
            </div>
          </CardContent>

          <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Logs, Goals, Reflections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Logs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activities</span>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/performance">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[260px] overflow-y-auto">
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{log.type}</div>
                    <Badge variant="outline" className="text-xs">
                      {log.date}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>{log.duration}</span>
                    <span>{log.distance}</span>
                    <span>Intensity: {log.intensity}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Goals</span>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/settings">Edit Goals</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">{goal.title}</div>
                    <div className="text-sm">
                      {goal.current}/{goal.target} {goal.unit}
                    </div>
                  </div>
                  <Progress
                    value={(goal.current / goal.target) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-center w-full text-muted-foreground">
              You&apos;re on track to meet 2 of 3 weekly goals!
            </div>
          </CardFooter>
        </Card>

        {/* Reflection Highlights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Reflection Highlights</span>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/chat">New Reflection</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reflections.map((reflection) => (
                <div key={reflection.id} className="bg-muted/20 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {reflection.date}
                    </Badge>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        reflection.sentiment === "positive"
                          ? "bg-emerald-500"
                          : reflection.sentiment === "negative"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    ></div>
                  </div>
                  <p className="text-sm">{reflection.insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full"
              asChild
            >
              <Link href="/chat">View All Reflections</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
