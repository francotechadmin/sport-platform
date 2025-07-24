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
    <Card className={`transition-all duration-300 hover:shadow-md active:scale-[0.98] touch-manipulation ${highlight ? 'border-muted-foreground/20 bg-muted/10' : ''
      }`}>
      <CardHeader>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${highlight ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' : 'bg-muted text-muted-foreground'
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