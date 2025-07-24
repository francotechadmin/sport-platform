import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

export function FeatureCard({ icon: Icon, title, description, highlight = false }: FeatureCardProps) {
  return (
    <Card className={`transition-all duration-300 hover:shadow-lg active:scale-[0.98] touch-manipulation ${
      highlight ? 'border-primary/50 bg-primary/5' : ''
    }`}>
      <CardHeader>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${
          highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}