import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI coaching',
    features: [
      'Unlimited AI coaching conversations',
      'Personalized training insights',
      'Performance analytics and tracking',
      'Chat history and conversation memory',
      'Basic goal setting and progress tracking',
    ],
    popular: false,
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Advanced features for serious athletes',
    features: [
      'Everything in Free Tier',
      'Voice coaching and audio responses',
      'Extended conversation memory',
      'Advanced performance analytics',
      'Custom training plan generation',
      'Priority support',
    ],
    popular: true,
    current: false,
    comingSoon: true,
  },
  {
    id: 'legacy',
    name: 'Legacy',
    price: '$49',
    period: 'per month',
    description: 'Premium experience for elite athletes',
    features: [
      'Everything in Pro',
      'Unlimited conversation history',
      'Advanced biometric integration',
      'Team and coach collaboration',
      'Custom AI model training',
      'White-glove onboarding',
    ],
    popular: false,
    current: false,
    comingSoon: true,
  },
];

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  return (
    <section className="py-16 sm:py-24 px-6 lg:px-8 bg-gradient-to-b from-purple-50/30 to-pink-50/20 dark:from-purple-950/10 dark:to-pink-950/10">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Choose Your Plan</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Start free and upgrade as you grow. All plans include our <span className="text-purple-600 dark:text-purple-400 font-semibold">core AI coaching features</span>.
          </p>
        </div>
        
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-md ${
                plan.popular ? 'border-muted-foreground/20 shadow-sm ring-1 ring-muted-foreground/10' : ''
              } ${plan.current ? 'border-muted-foreground/30 bg-muted/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border">
                    Current Plan
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.comingSoon ? (
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={onGetStarted}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
                
                {plan.comingSoon && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      <strong>Coming Soon:</strong> Advanced features in development
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <p className="text-xs text-muted-foreground">
            Questions about pricing? <Button variant="link" className="p-0 h-auto text-xs">Contact our team</Button>
          </p>
        </div>
      </div>
    </section>
  );
}