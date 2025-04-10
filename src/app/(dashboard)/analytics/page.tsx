"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ActivityChart,
  generateTrainingIntensityData,
  generateRecoveryData,
  generateRunningData,
} from "@/components/ui/activity-chart";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      className="w-5 h-5 text-blue-500"
    >
      <path d="m22 12-4-4-8 8-4-4-4 4" />
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
      className="w-5 h-5 text-purple-500"
    >
      <path d="M12 2a5 5 0 0 0-5 5v14a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
      <path d="M9 21h6" />
      <path d="M12 7v5" />
    </svg>
  ),
  Technical: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-green-500"
    >
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="m12 2 4 4" />
      <path d="m12 2-4 4" />
      <path d="m12 22 4-4" />
      <path d="m12 22-4-4" />
      <path d="m2 12 4 4" />
      <path d="m2 12 4-4" />
      <path d="m22 12-4 4" />
      <path d="m22 12-4-4" />
    </svg>
  ),
  Training: () => (
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
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
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
      className="w-5 h-5 text-amber-500"
    >
      <path d="M12 2v8" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m16 6-4 4-4-4" />
      <path d="M16 18a4 4 0 0 0-8 0" />
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
      className="w-5 h-5 text-indigo-500"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
  Progression: () => (
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
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 4v16" />
    </svg>
  ),
};

// Color themes for different metric types
const colorThemes = {
  performance: {
    primary: "blue",
    gradient: "from-blue-500/10",
    accent: "bg-blue-500",
  },
  mental: {
    primary: "purple",
    gradient: "from-purple-500/10",
    accent: "bg-purple-500",
  },
  technical: {
    primary: "emerald",
    gradient: "from-emerald-500/10",
    accent: "bg-emerald-500",
  },
  training: {
    primary: "orange",
    gradient: "from-orange-500/10",
    accent: "bg-orange-500",
  },
  recovery: {
    primary: "amber",
    gradient: "from-amber-500/10",
    accent: "bg-amber-500",
  },
  focus: {
    primary: "indigo",
    gradient: "from-indigo-500/10",
    accent: "bg-indigo-500",
  },
  goals: {
    primary: "rose",
    gradient: "from-rose-500/10",
    accent: "bg-rose-500",
  },
};

// Baseline information for tooltips
const baselineInfo = {
  performance:
    "Professional athletes maintain scores above 90 through consistent training and recovery",
  mental:
    "Elite performers achieve 85%+ through dedicated mental conditioning and stress management",
  technical:
    "Pro level requires 90%+ mastery through thousands of deliberate practice hours",
  training:
    "The 80-15-5 split optimizes adaptation while minimizing injury risk",
  recovery: "8-10 hours of quality sleep is crucial for elite performance",
  focus:
    "Top athletes maintain 9.5+ through meditation and concentration exercises",
  goals: "Consistent progress of 3-5% monthly leads to long-term success",
};

interface MetricCardProps {
  title: string;
  value: string | number;
  target: string | number;
  description: string;
  type: keyof typeof colorThemes;
  icon: React.ReactNode;
  gap?: string | number;
  gapText?: string;
}

const MetricCard = ({
  title,
  value,
  target,
  description,
  type,
  icon,
  gap,
  gapText,
}: MetricCardProps) => {
  const theme = colorThemes[type];
  const percentage =
    typeof value === "number" ? value : parseFloat(value.replace("%", ""));

  return (
    <Card
      className={`bg-gradient-to-br ${theme.gradient} to-transparent hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`ml-2 ${theme.gradient.replace("from-", "bg-")}`}
                >
                  Target: {target}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{baselineInfo[type]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className={`${theme.accent} h-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
          <div
            className="absolute w-px h-2 bg-yellow-500"
            style={{
              left: typeof target === "number" ? `${target}%` : "90%",
              top: 0,
            }}
          ></div>
        </div>
        {gap && (
          <div className="text-xs text-muted-foreground mt-1">
            {gapText || `${gap}% from target`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ChartCardProps {
  title: string;
  description: string;
  type: keyof typeof colorThemes;
  icon: React.ReactNode;
  target: string;
  chart: React.ReactNode;
  info: string;
}

const ChartCard = ({
  title,
  description,
  type,
  icon,
  target,
  chart,
  info,
}: ChartCardProps) => {
  const theme = colorThemes[type];

  return (
    <Card
      className={`bg-gradient-to-br ${theme.gradient} to-transparent hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${theme.gradient.replace("from-", "bg-")}`}
                >
                  {target}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{baselineInfo[type]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chart}
        <div className="text-xs text-muted-foreground mt-3">{info}</div>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsPage() {
  const intensityData = generateTrainingIntensityData();
  const recoveryData = generateRecoveryData(7, 8);
  const performanceData = generateRunningData(7, 30);

  return (
    <div className="mt-16 p-6 bg-gradient-to-br from-background to-background/95">
      <div className="flex items-center gap-3 mb-8">
        <Icons.Performance />
        <h1 className="text-2xl md:text-3xl font-bold">
          Performance Analytics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Performance Score"
          value={85}
          target={92}
          description="Overall athletic performance rating"
          type="performance"
          icon={<Icons.Performance />}
          gap={7}
          gapText="7% below professional average"
        />
        <MetricCard
          title="Mental Resilience"
          value="72%"
          target="85%"
          description="Ability to handle pressure and setbacks"
          type="mental"
          icon={<Icons.Mental />}
          gap={13}
          gapText="13% gap to elite performance"
        />
        <MetricCard
          title="Technical Mastery"
          value="78%"
          target="90%"
          description="Form and technique proficiency"
          type="technical"
          icon={<Icons.Technical />}
          gap={12}
          gapText="12% below professional standard"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Training Intensity Distribution"
          description="Balance of workout intensities vs. elite distribution"
          type="training"
          icon={<Icons.Training />}
          target="Pro Split: 80-15-5"
          chart={
            <ActivityChart
              type="bar"
              title="Weekly Training Load"
              data={intensityData.data}
              height={250}
            />
          }
          info="Pro athletes typically maintain 80% low intensity, 15% medium, 5% high intensity"
        />
        <ChartCard
          title="Recovery Metrics"
          description="Sleep quality and recovery vs. professional baseline"
          type="recovery"
          icon={<Icons.Recovery />}
          target="Target: 8hrs Sleep"
          chart={
            <ActivityChart
              type="line"
              title="Recovery Trends"
              data={recoveryData.data}
              goal={recoveryData.goal}
              height={250}
            />
          }
          info="Elite athletes average 8-10 hours of quality sleep per night"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Mental Focus Score"
          value={9.2}
          target={9.5}
          description="Concentration and mindfulness rating"
          type="focus"
          icon={<Icons.Focus />}
          gap={0.3}
          gapText="Close to elite level (0.3 points gap)"
        />
        <MetricCard
          title="Recovery Rate"
          value="85%"
          target="95%"
          description="Post-training recovery efficiency"
          type="recovery"
          icon={<Icons.Recovery />}
          gap={10}
          gapText="10% below professional recovery rate"
        />
        <MetricCard
          title="Goal Progress"
          value="91%"
          target="100%"
          description="Progress towards set objectives"
          type="goals"
          icon={<Icons.Goals />}
          gap={9}
          gapText="9% remaining to reach target"
        />
      </div>

      <ChartCard
        title="Performance Progression"
        description="Weekly performance trends vs. professional development curve"
        type="performance"
        icon={<Icons.Progression />}
        target="Growth: 3-5% monthly"
        chart={
          <ActivityChart
            type="line"
            title="Weekly Performance"
            data={performanceData.data}
            goal={performanceData.goal}
            height={300}
          />
        }
        info="Professional athletes typically show 3-5% performance improvement month-over-month"
      />
    </div>
  );
}
