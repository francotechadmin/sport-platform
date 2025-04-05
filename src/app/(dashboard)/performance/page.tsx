"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformancePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Performance Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Training Session #{i + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {Math.floor(Math.random() * 60) + 20} minutes
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Pace</span>
                  <span className="font-semibold">7:30 min/mile</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Heart Rate</span>
                  <span className="font-semibold">155 bpm</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Weekly Progress</span>
                  <span className="font-semibold">82%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "82%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Placeholder for detailed performance chart
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
