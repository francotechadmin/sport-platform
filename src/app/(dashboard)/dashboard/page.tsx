"use client";

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
  // Generate sample data for charts
  const runningData = generateRunningData();
  const swimmingData = generateSwimmingData();
  const cyclingData = generateCyclingData();
  const intensityData = generateTrainingIntensityData();
  const calorieData = generateCalorieData();
  const recoveryData = generateRecoveryData();

  return (
    <div className="w-full">

      {/* Weekly Overview message from ai */} 
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
          <h2 className="text-lg font-semibold">Weekly Overview</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;ve been working hard this week! Keep up the good work and you&apos;ll see even better results.
          </p>
        </div>
      </div>

  
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
    </div>
  );
}
