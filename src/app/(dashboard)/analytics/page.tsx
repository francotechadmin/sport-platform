"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Explosive Output Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85</div>
            <p className="text-sm text-muted-foreground">
              Tracks power & intensity across sessions
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recovery Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72%</div>
            <p className="text-sm text-muted-foreground">
              Measures bounce-back speed post-workout
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full"
                style={{ width: "72%" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Scrolls Overcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14</div>
            <p className="text-sm text-muted-foreground">
              Mental wins logged weekly
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-green-500 h-full"
                style={{ width: "78%" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mantra Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9 times</div>
            <p className="text-sm text-muted-foreground">
              How often they repeat/reflect on their mantra
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-500 h-full"
                style={{ width: "60%" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Focus Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">
              Number of high-focus training or mental sessions
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full"
                style={{ width: "67%" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Movement Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">91%</div>
            <p className="text-sm text-muted-foreground">
              Tracks loop/form technique consistency
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full"
                style={{ width: "91%" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Detailed performance trends and patterns over time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
