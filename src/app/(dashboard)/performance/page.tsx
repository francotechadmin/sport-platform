"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function PerformancePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Performance Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Physical Highlight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-md">
                <h3 className="font-medium mb-2">Best athletic moment this week</h3>
                <p className="text-sm">Set a personal record on back squat - 315 lbs for 5 reps with perfect form.</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">Monday, 4:30 PM</span>
                  <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full">High Point</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Add New Highlight
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biggest Scroll Overcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-md">
                <h3 className="font-medium mb-2">Mental/emotional breakthrough</h3>
                <p className="text-sm">Pushed through intense anxiety before competition and still performed at 90% capacity.</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">Wednesday, 11:15 AM</span>
                  <span className="bg-indigo-500/10 text-indigo-500 text-xs px-2 py-1 rounded-full">Breakthrough</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Log New Scroll Overcome
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reflection of the Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-md">
                <h3 className="font-medium mb-2">Most meaningful journal entry logged</h3>
                <p className="text-sm">Realized that my fear of failure is holding me back more than my physical limitations.</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">Friday, 9:00 PM</span>
                  <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full">Deep Reflection</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Add New Reflection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Mood & Sleep Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Mood</h3>
                  <span className="text-primary font-medium">87%</span>
                </div>
                <Slider defaultValue={[87]} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Sleep Quality</h3>
                  <span className="text-primary font-medium">74%</span>
                </div>
                <Slider defaultValue={[74]} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Sleep Duration</h3>
                  <span className="text-primary font-medium">7.5 hrs</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{"<6h"}</span>
                  <span>7-8h</span>
                  <span>9h+</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mental Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Mantra</h3>
                <div className="p-4 border border-dashed rounded-md bg-primary/5 text-center mb-2">
                  <blockquote className="text-lg font-medium italic">
                  &quot;I embrace the process and trust my training.&quot;
                  </blockquote>
                </div>
                <Button size="sm" variant="outline" className="w-full">Update Mantra</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Goals</h3>
                <div className="space-y-2 mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary/20 rounded-full mr-2"></div>
                    <span>Hit 85% consistency in form technique</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary/20 rounded-full mr-2"></div>
                    <span>Complete 4 mental training sessions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary/20 rounded-full mr-2"></div>
                    <span>Reduce pre-competition anxiety by 30%</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">Manage Goals</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Focus Target</h3>
                <div className="p-4 bg-primary/5 rounded-md mb-2">
                  <p className="text-sm">Maintaining technique during the final set when fatigue starts</p>
                </div>
                <Button size="sm" variant="outline" className="w-full">Update Focus</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes & Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your notes here or click the microphone to use voice-to-text..."
              className="min-h-[120px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
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
                <Button variant="outline" size="icon">
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
              <Button>Save Note</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
