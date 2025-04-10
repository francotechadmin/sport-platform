"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons for different performance aspects
const Icons = {
  Physical: () => (
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
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  Mental: () => (
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
      <path d="M12 2a5 5 0 0 0-5 5v14a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
      <path d="M9 21h6" />
      <path d="M12 7v5" />
    </svg>
  ),
  Reflection: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-amber-500"
    >
      <path d="M12 2v8" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m16 6-4 4-4-4" />
    </svg>
  ),
  Sleep: () => (
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
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Goals: () => (
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
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Notes: () => (
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

// Professional baselines for tooltips
const proBaselines = {
  physical:
    "Elite athletes log 3-5 significant performance breakthroughs per month",
  mental: "Top performers overcome 2-3 major mental barriers weekly",
  reflection:
    "Daily reflection is key - champions spend 15-20 minutes on mindful analysis",
  sleep: "8-10 hours of quality sleep is crucial for elite performance",
  mood: "Maintaining 80%+ positive mood correlates with peak performance",
  goals: "Focus on 2-3 specific, measurable goals in 4-6 week cycles",
};

export default function PerformancePage() {
  return (
    <div className="p-6 bg-gradient-to-br from-background to-background/95">
      <div className="flex items-center gap-3 mb-8">
        <Icons.Physical />
        <h1 className="text-3xl font-bold">Performance Logs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Physical />
                <span>Top Physical Highlight</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-emerald-500/10">
                      Pro: 3-5/month
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.physical}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-md">
                <h3 className="font-medium mb-2">
                  Best athletic moment this week
                </h3>
                <p className="text-sm">
                  Set a personal record on back squat - 315 lbs for 5 reps with
                  perfect form.
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    Monday, 4:30 PM
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">
                    High Point
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-emerald-500/10"
              >
                Add New Highlight
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Mental />
                <span>Mental Breakthrough</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-indigo-500/10">
                      Target: 2-3/week
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.mental}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-md">
                <h3 className="font-medium mb-2">
                  Mental/emotional breakthrough
                </h3>
                <p className="text-sm">
                  Pushed through intense anxiety before competition and still
                  performed at 90% capacity.
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    Wednesday, 11:15 AM
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-500 text-xs px-2 py-1 rounded-full">
                    Breakthrough
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-indigo-500/10"
              >
                Log New Breakthrough
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Reflection />
                <span>Daily Reflection</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-amber-500/10">
                      15-20 min/day
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.reflection}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-md">
                <h3 className="font-medium mb-2">
                  Most meaningful insight today
                </h3>
                <p className="text-sm">
                  Realized that my fear of failure is holding me back more than
                  my physical limitations.
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    Friday, 9:00 PM
                  </span>
                  <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full">
                    Deep Reflection
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-amber-500/10"
              >
                Add New Reflection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Sleep />
                <span>Recovery Metrics</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-blue-500/10">
                      Target: 8-10hrs
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.sleep}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Mood</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-500 font-medium">87%</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{proBaselines.mood}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  defaultValue={[87]}
                  max={100}
                  step={1}
                  className="accent-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Sleep Quality</h3>
                  <span className="text-blue-500 font-medium">74%</span>
                </div>
                <Slider
                  defaultValue={[74]}
                  max={100}
                  step={1}
                  className="accent-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Sleep Duration</h3>
                  <span className="text-blue-500 font-medium">7.5 hrs</span>
                </div>
                <Slider
                  defaultValue={[75]}
                  max={100}
                  step={1}
                  className="accent-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{"<6h"}</span>
                  <span>7-8h</span>
                  <span>9h+</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Goals />
                <span>Mental Focus</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-rose-500/10">
                      2-3 Goals/Cycle
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{proBaselines.goals}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Daily Mantra</h3>
                <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-md text-center mb-2">
                  <blockquote className="text-lg font-medium italic">
                    &quot;I embrace the process and trust my training.&quot;
                  </blockquote>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full hover:bg-rose-500/10"
                >
                  Update Mantra
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-2">Current Goals</h3>
                <div className="space-y-2 mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-rose-500/20 rounded-full mr-2"></div>
                    <span>Hit 85% consistency in form technique</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-rose-500/20 rounded-full mr-2"></div>
                    <span>Complete 4 mental training sessions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-rose-500/20 rounded-full mr-2"></div>
                    <span>Reduce pre-competition anxiety by 30%</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full hover:bg-rose-500/10"
                >
                  Manage Goals
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-2">Focus Target</h3>
                <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-md mb-2">
                  <p className="text-sm">
                    Maintaining technique during the final set when fatigue
                    starts
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full hover:bg-rose-500/10"
                >
                  Update Focus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Notes />
            <span>Notes & Reflections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your notes here or click the microphone to use voice-to-text..."
              className="min-h-[120px] border-purple-500/20 focus:border-purple-500/40 bg-purple-500/5"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-purple-500/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-purple-500/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </Button>
              </div>
              <Button className="bg-purple-500 hover:bg-purple-600">
                Save Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
