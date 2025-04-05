"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <p className="text-sm text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42 min</div>
            <p className="text-sm text-muted-foreground">-5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24,856</div>
            <p className="text-sm text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Workout Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="flex items-end h-48 space-x-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => {
                    const height = Math.floor(Math.random() * 100) + 5;
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div
                          className="bg-primary/80 rounded-t w-10"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs mt-2">{day}</div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-8 border-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="space-y-1 text-center">
                    <div className="text-xl font-semibold">Running</div>
                    <div className="text-sm text-muted-foreground">45%</div>
                  </div>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 left-0 border-8 border-primary rounded-full"
                  style={{
                    clipPath:
                      "polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 30%)",
                  }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Running (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                <span className="text-sm">Other (55%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Placeholder for detailed analytics chart
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
