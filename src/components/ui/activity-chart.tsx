"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

// Types for our chart props
interface LineChartProps {
  type: "line";
  title: string;
  data: ChartData<"line">;
  goal?: number;
  height?: number;
}

interface BarChartProps {
  type: "bar";
  title: string;
  data: ChartData<"bar">;
  goal?: number;
  height?: number;
}

type ActivityChartProps = LineChartProps | BarChartProps;

export function ActivityChart(props: ActivityChartProps) {
  const { type, title, data, goal, height = 200 } = props;

  // Common chart options
  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          footer: (tooltipItems) => {
            if (goal) {
              const dataPoint = tooltipItems[0].parsed.y;
              const percentOfGoal = Math.round((dataPoint / goal) * 100);
              return `${percentOfGoal}% of goal (${goal})`;
            }
            return "";
          },
        },
      },
    },
  };

  // If we have a goal, add a horizontal line annotation
  if (goal) {
    // @ts-expect-error - the annotation plugin types are not fully compatible
    options.plugins.annotation = {
      annotations: {
        line1: {
          type: "line",
          yMin: goal,
          yMax: goal,
          borderColor: "rgba(255, 99, 132, 0.5)",
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: `Goal: ${goal}`,
            position: "end",
          },
        },
      },
    };
  }

  return (
    <div style={{ height }}>
      {type === "line" ? (
        <Line
          options={options as ChartOptions<"line">}
          data={data as ChartData<"line">}
        />
      ) : (
        <Bar
          options={options as ChartOptions<"bar">}
          data={data as ChartData<"bar">}
        />
      )}
    </div>
  );
}

// Sample data generators for different activity types
export const generateRunningData = (
  days = 7,
  goalDistance = 30,
): { data: ChartData<"line">; goal: number } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate realistic running data
  const distances = labels.map(() => Math.floor(Math.random() * 8) + 2); // 2-10km per day

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Distance (km)",
          data: distances,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.3,
        },
      ],
    },
    goal: goalDistance, // Weekly goal
  };
};

export const generateSwimmingData = (
  days = 7,
  goalDistance = 10,
): { data: ChartData<"line">; goal: number } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate realistic swimming data
  const distances = labels.map(() => Math.random() * 2.5 + 0.5); // 0.5-3km per day

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Distance (km)",
          data: distances,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.3,
        },
      ],
    },
    goal: goalDistance, // Weekly goal
  };
};

export const generateCyclingData = (
  days = 7,
  goalDistance = 150,
): { data: ChartData<"line">; goal: number } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate realistic cycling data
  const distances = labels.map(() => Math.floor(Math.random() * 30) + 10); // 10-40km per day

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Distance (km)",
          data: distances,
          borderColor: "rgb(255, 159, 64)",
          backgroundColor: "rgba(255, 159, 64, 0.5)",
          tension: 0.3,
        },
      ],
    },
    goal: goalDistance, // Weekly goal
  };
};

export const generateTrainingIntensityData = (
  days = 7,
): { data: ChartData<"bar">; goal: null } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate training intensity data (low, medium, high)
  const lowIntensity = labels.map(() => Math.floor(Math.random() * 60) + 20);
  const mediumIntensity = labels.map(() => Math.floor(Math.random() * 50) + 10);
  const highIntensity = labels.map(() => Math.floor(Math.random() * 30) + 5);

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Low Intensity (min)",
          data: lowIntensity,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          label: "Medium Intensity (min)",
          data: mediumIntensity,
          backgroundColor: "rgba(255, 205, 86, 0.5)",
        },
        {
          label: "High Intensity (min)",
          data: highIntensity,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    },
    goal: null, // No specific goal for this chart
  };
};

export const generateCalorieData = (
  days = 7,
  goalCalories = 2500,
): { data: ChartData<"bar">; goal: number } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate calorie data
  const calories = labels.map(() => Math.floor(Math.random() * 1000) + 1800); // 1800-2800 calories

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Calories Burned",
          data: calories,
          backgroundColor: "rgba(153, 102, 255, 0.5)",
        },
      ],
    },
    goal: goalCalories, // Daily calorie goal
  };
};

export const generateRecoveryData = (
  days = 7,
  goalSleep = 8,
): { data: ChartData<"line">; goal: number } => {
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate sleep data
  const sleepHours = labels.map(() => Math.random() * 4 + 5); // 5-9 hours of sleep

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Sleep Duration (hours)",
          data: sleepHours,
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          tension: 0.3,
        },
      ],
    },
    goal: goalSleep, // Sleep goal
  };
};
