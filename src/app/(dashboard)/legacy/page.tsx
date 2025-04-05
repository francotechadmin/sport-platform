"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegacyPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Legacy Systems</h1>
        <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
          Coming Soon
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Legacy Dashboard Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Legacy System Integration
            </h2>
            <p className="text-muted-foreground mb-4">
              We&apos;re working on integrating your legacy fitness tracking
              data. This feature will be available soon.
            </p>
            <div className="w-full bg-muted h-2 rounded-full mt-4">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>Progress</span>
              <span>45%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Past Training Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 opacity-60">
              {[
                "Marathon Training 2022",
                "Sprint Technique 2021",
                "Triathlon Basics 2020",
                "Swim Fundamentals 2019",
                "Run Endurance 2018",
              ].map((program, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <span className="font-medium">{program}</span>
                  <button
                    className="text-xs bg-muted px-2 py-1 rounded"
                    disabled
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historical Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <p className="font-medium">Locked Feature</p>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center border border-dashed rounded-lg p-4">
                <p className="text-muted-foreground">
                  Historical results will appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
