"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingModal } from "@/components/ui/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "@deemlol/next-icons";
import Markdown from "markdown-to-jsx";
import { useChat } from "@ai-sdk/react";
import Link from "next/link";

// Icons for different metrics
const Icons = {
  Performance: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-emerald-500"
    >
      <path d="m22 12-4-4-8 8-4-4-4 4" />
    </svg>
  ),
  Analytics: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-blue-500"
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 4v16" />
    </svg>
  ),
  Coach: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-purple-500"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Streak: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-orange-500"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Recovery: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-teal-500"
    >
      <path d="M18.364 5.636a9 9 0 0 1 0 12.728" />
      <path d="M15.536 8.464a5 5 0 0 1 0 7.072" />
      <path d="M13 12h.01" />
    </svg>
  ),
  Focus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-rose-500"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Session: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-indigo-500"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// Professional baselines for tooltips
const proBaselines = {
  performance:
    "Elite athletes maintain scores above 90 through consistent training and recovery",
  analytics: "Top performers track 5-7 key metrics daily for optimal progress",
  coach: "Professional athletes receive daily guidance and feedback",
  streak: "Elite athletes maintain 90%+ adherence to training schedules",
  recovery: "Professional athletes achieve 95%+ recovery scores consistently",
  focus: "Top performers maintain 9.5+ focus scores during training",
  session: "Elite athletes complete 5-6 quality sessions per week",
};

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize chat with system message
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
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
    inputRef.current?.blur();
    handleSubmit(e);
  };

  // Default welcome message if no history
  const defaultWelcomeMessage = {
    id: "welcome-message",
    role: "assistant" as const,
    content:
      "Welcome to your personalized dashboard! Here's your daily brief:\n\n- Your performance is trending upward (+4% this week)\n- Next scheduled session: High-intensity interval training\n- Focus area: Maintain 175-180 SPM running cadence",
  };

  // If no visible messages, add default welcome
  const displayMessages =
    visibleMessages.length > 0
      ? visibleMessages.slice(-3)
      : [defaultWelcomeMessage];

  return (
    <div className="mt-16 p-6 bg-gradient-to-br from-background to-background/95">
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="flex items-center gap-3 mb-8">
        <Icons.Performance />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icons.Streak />
                <span className="text-sm text-muted-foreground">
                  Training Streak
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-orange-500/10">
                      Target: 90%+
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.streak}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">7</span>
              <span className="ml-1 text-sm text-muted-foreground">days</span>
            </div>
            <div className="mt-2 text-xs text-orange-500">
              ↑ 2 days from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icons.Recovery />
                <span className="text-sm text-muted-foreground">
                  Recovery Score
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-teal-500/10">
                      Elite: 95%+
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.recovery}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">87%</span>
            </div>
            <div className="mt-2 text-xs text-teal-500">↑ 5% this week</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icons.Focus />
                <span className="text-sm text-muted-foreground">
                  Focus Score
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-rose-500/10">
                      Pro: 9.5+
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.focus}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">9.2</span>
              <span className="ml-1 text-sm text-muted-foreground">/ 10</span>
            </div>
            <div className="mt-2 text-xs text-rose-500">
              ↑ 0.3 from last session
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icons.Session />
                <span className="text-sm text-muted-foreground">
                  Weekly Sessions
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-indigo-500/10">
                      Goal: 5-6
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.session}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">4</span>
              <span className="ml-1 text-sm text-muted-foreground">/ 6</span>
            </div>
            <div className="mt-2 text-xs text-indigo-500">
              2 sessions remaining
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link to detailed analytics */}
      <div className="w-full mb-8 flex items-center justify-center">
        <Link
          href="/analytics"
          className="text-sm text-blue-500 hover:underline flex items-center gap-2"
        >
          <Icons.Analytics />
          View Detailed Analytics
        </Link>
      </div>

      {/* AI Coach Section - Centerpiece */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent hover:shadow-lg transition-all duration-300 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.Coach />
              <span>AI Performance Coach</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-purple-500/10">
                    Daily Guidance
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{proBaselines.coach}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Get personalized advice and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={messageContainerRef}
            className="space-y-4 mb-4"
            style={{ minHeight: "200px" }}
          >
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg p-4 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-purple-500/5 border border-purple-500/20"
                  }`}
                >
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask your AI coach for guidance..."
              className="flex-1 border-purple-500/20 focus:border-purple-500/40 bg-purple-500/5"
            />
            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Send"}
            </Button>
          </form>
        </CardContent>
        {/* link */}
        <div className="w-full mt-4 flex items-center justify-center">
          <Link
            href="/chat"
            className="text-sm text-blue-500 hover:underline flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Go to full chat experience
          </Link>
        </div>
      </Card>

      {/* Social Feed Section */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-blue-500"
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Athlete Community</span>
            </div>
            <Link
              href="/locker-room"
              className="text-sm text-blue-500 hover:underline"
            >
              View All
            </Link>
          </CardTitle>
          <CardDescription>
            Recent highlights from fellow athletes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Featured Post */}
          <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-start space-x-4 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-lg font-bold">
                SJ
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Sarah Johnson</h3>
                  <Badge variant="outline" className="text-xs">
                    Marathon Runner
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Just hit a new PR in my 20-mile training run! The mental game
                  was tough but pushed through. 💪
                </p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
                  <span>Distance: 20 miles</span>
                  <span>Pace: 7:45 min/mile</span>
                </div>
              </div>
            </div>
            <div className="pl-14">
              <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <span className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 text-emerald-500"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
                <span className="text-emerald-500">Performance Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-1"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Comment
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-1"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="text-2xl font-bold text-blue-500">24</div>
              <div className="text-xs text-muted-foreground">
                Active Athletes
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="text-2xl font-bold text-emerald-500">12</div>
              <div className="text-xs text-muted-foreground">New PRs Today</div>
            </div>
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="text-2xl font-bold text-purple-500">5</div>
              <div className="text-xs text-muted-foreground">
                Training Groups
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
