import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const plans = [
    {
      name: 'Weekly',
      price: '$1.00',
      period: 'per week',
      discount: '50% discount',
      originalPrice: '$2.00',
      features: [
        'Unlimited streaming',
        'High-quality audio',
        'Download tracks',
        'Ad-free experience',
        'Cancel anytime',
      ],
    },
    {
      name: 'Monthly',
      price: '$3.00',
      period: 'per month',
      discount: '25% discount',
      originalPrice: '$4.00',
      features: [
        'Unlimited streaming',
        'High-quality audio',
        'Download tracks',
        'Ad-free experience',
        'Priority support',
        'Cancel anytime',
      ],
      popular: true,
    },
    {
      name: 'Yearly',
      price: '$30.00',
      period: 'per year',
      discount: 'Best value',
      originalPrice: '$48.00',
      features: [
        'Unlimited streaming',
        'High-quality audio',
        'Download tracks',
        'Ad-free experience',
        'Priority support',
        'Exclusive content',
        'Cancel anytime',
      ],
    },
  ];

  return (
    <div className="container py-12 max-w-screen-xl px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4 text-primary">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock unlimited streaming and downloads with a Fourleaf subscription. Start your free trial today.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular ? 'border-primary shadow-glow-sm' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">{plan.discount}</Badge>
                    <span className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full mb-6"
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                Start Free Trial
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Why Subscribe to Fourleaf?</CardTitle>
          <CardDescription className="text-base">
            Experience music the way it was meant to be heard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Unlimited Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Stream and download as many tracks as you want, whenever you want. No limits, no restrictions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Premium Quality
              </h3>
              <p className="text-sm text-muted-foreground">
                Enjoy crystal-clear audio with high-quality streaming and downloads for the best listening experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Ad-Free Listening
              </h3>
              <p className="text-sm text-muted-foreground">
                Immerse yourself in music without interruptions. No ads, just pure audio bliss.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Flexible Plans
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose the plan that fits your lifestyle. Cancel anytime with no hidden fees or commitments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>
    </div>
  );
}
