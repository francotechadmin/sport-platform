import { FeatureCard } from './feature-card';
import { User, BarChart3, Clock, Brain } from 'lucide-react';

const features = [
  {
    id: 'personalized-coaching',
    icon: User,
    title: 'Personalized AI Coaching',
    description: 'Get tailored guidance based on your unique goals and progress. Our AI learns your preferences and adapts to your style.',
    highlight: true,
  },
  {
    id: 'real-time-tracking',
    icon: BarChart3,
    title: 'Real-time Progress Tracking',
    description: 'Monitor your journey with detailed analytics and insights. See your improvements and identify areas for growth.',
  },
  {
    id: '24-7-availability',
    icon: Clock,
    title: '24/7 Availability',
    description: 'Your coach is always ready when you need support. Get guidance anytime, anywhere, at your own pace.',
  },
  {
    id: 'adaptive-learning',
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'AI that learns and evolves with your progress. The more you use it, the better it becomes at helping you succeed.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Discover the powerful features that make ProFormAi the perfect companion for your journey
          </p>
        </div>
        
        <div className="mt-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              highlight={feature.highlight}
            />
          ))}
        </div>
      </div>
    </section>
  );
}