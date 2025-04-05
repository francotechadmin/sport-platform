"use client";

import { useState, useRef } from "react";
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
import Link from "next/link";
import { Loader, ArrowUpCircle, User } from "@deemlol/next-icons";
import Markdown from "markdown-to-jsx";
import { Avatar } from "@/components/ui/avatar";
import { useChat } from "@ai-sdk/react";

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize chat with system message
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "system-1",
          role: "system",
          content:
            "You are an AI sports coach helping athletes improve their performance. Be concise and actionable in your advice.",
        },
      ],
      onResponse: (response) => {
        console.log("Chat API response received:", {
          status: response.status,
          statusText: response.statusText,
        });
      },
      onFinish: (message) => {
        console.log("Chat message completed:", {
          id: message.id,
          role: message.role,
        });
      },
      onError: (error) => {
        console.error("Chat API error:", error);
      },
    });

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Get visible messages (non-system) for display
  const visibleMessages = messages.filter((msg) => msg.role !== "system");

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setShowOnboarding(false);
  };

  // Custom form submit handler
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Blur input to dismiss keyboard on mobile
    inputRef.current?.blur();

    // Use the SDK's handleSubmit
    handleSubmit(e);
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

  // Default welcome message if no history
  const defaultWelcomeMessage = {
    id: "welcome-message",
    role: "assistant" as const,
    content:
      "Based on your recent performances, I recommend focusing on:\n- Improving running cadence (currently 162 SPM, target 175-180)\n- Adding one more recovery day to your weekly schedule",
  };

  // If no visible messages, add default welcome
  const displayMessages =
    visibleMessages.length > 0
      ? visibleMessages.slice(-3) // Only show last 3 messages
      : [defaultWelcomeMessage];

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

      {/* Center Section: Chat Module */}
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

            {/* Chat Messages */}
            <div
              ref={messageContainerRef}
              className="bg-background/70 p-4 rounded-md mb-4 overflow-y-auto max-h-[300px]"
            >
              <div className="space-y-4">
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role !== "user" && (
                      <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
                        <div className="bg-primary/90 text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                          AI
                        </div>
                      </Avatar>
                    )}

                    <div
                      className={`p-3 rounded-md max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-muted/80 backdrop-blur-sm"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.parts?.map((part, i) => {
                          if (part.type === "text") {
                            return (
                              <Markdown key={`${message.id}-${i}`}>
                                {part.text}
                              </Markdown>
                            );
                          }
                          return null;
                        }) || <Markdown>{message.content}</Markdown>}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
                        <div className="bg-slate-300/90 dark:bg-slate-700/90 flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
                      <div className="bg-primary/90 text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                        AI
                      </div>
                    </Avatar>
                    <div className="p-3 rounded-md max-w-[80%] bg-muted/80 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="rounded-lg border border-red-200/30 dark:border-red-900/30 bg-red-50/90 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 text-sm shadow-sm backdrop-blur-sm">
                    Error: {error.message || "Something went wrong"}
                  </div>
                )}

                {/* Reference for scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={onSubmit} className="relative mb-4">
              <Input
                ref={inputRef}
                className="pr-24 py-6 text-base"
                placeholder="Ask a question or start a reflection..."
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Button
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                disabled={isLoading || !input.trim()}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/chat">Open Full AI Coach</Link>
              </Button>
            </div>
          </CardContent>
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
