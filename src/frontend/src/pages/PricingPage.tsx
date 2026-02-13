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
        'High-quality audio downloads',
        'Ad-free listening',
        'Access to full music library',
      ],
    },
    {
      name: 'Monthly',
      price: '$2.99',
      period: 'per month',
      discount: '75% discount',
      originalPrice: '$11.96',
      popular: true,
      features: [
        'Unlimited streaming',
        'High-quality audio downloads',
        'Ad-free listening',
        'Access to full music library',
        'Best value for regular listeners',
      ],
    },
    {
      name: 'Yearly',
      price: '$10.99',
      period: 'per year',
      discount: '97% discount',
      originalPrice: '$104.00',
      features: [
        'Unlimited streaming',
        'High-quality audio downloads',
        'Ad-free listening',
        'Access to full music library',
        'Maximum savings',
        'Lock in your rate for a full year',
      ],
    },
  ];

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Start with 1-Day Free Trial
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience premium music streaming with Fourleaf. Start with a free trial, then choose
            the plan that fits your lifestyle. All plans include unlimited streaming and downloads.
          </p>
        </div>

        {/* Free Trial Card */}
        <Card className="mb-8 border-primary/50 shadow-glow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              1-Day Free Trial
            </CardTitle>
            <CardDescription>
              Try Fourleaf risk-free for 24 hours. Full access to all features, no credit card
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full sm:w-auto">Start Free Trial</Button>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-glow-md scale-105 md:scale-110'
                  : 'border-border/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {plan.discount}
                    </Badge>
                    <span className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Justification Section */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Why Fourleaf Premium is Worth It</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">🎵 Unlimited High-Quality Downloads</h3>
              <p className="text-sm text-muted-foreground">
                Take your music offline and listen anywhere, anytime. Perfect for commutes, flights,
                or areas with poor connectivity. Your music, your way.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🚀 Ad-Free Experience</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy uninterrupted music streaming without any ads. Immerse yourself in your
                favorite tracks without distractions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💎 Premium Audio Quality</h3>
              <p className="text-sm text-muted-foreground">
                Experience crystal-clear sound with high-bitrate audio streaming and downloads. Hear
                every note as the artist intended.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💰 Incredible Value</h3>
              <p className="text-sm text-muted-foreground">
                With discounts up to 97% off regular pricing, you're getting premium music access at
                a fraction of the cost. Compare that to other streaming services charging $10-15 per
                month!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🌱 Support Independent Music</h3>
              <p className="text-sm text-muted-foreground">
                Your subscription helps support artists and keeps Fourleaf growing. Be part of a
                community that values quality music and fair compensation for creators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
