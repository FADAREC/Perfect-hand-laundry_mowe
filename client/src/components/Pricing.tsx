import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { businessConfig } from "../../../config/business";
import { Check } from "lucide-react";

export default function Pricing() {
  const { pricing } = businessConfig;

  if (!pricing || pricing.length === 0) return null;

  const handleCTA = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background" id="pricing">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-description">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {pricing.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative flex flex-col ${tier.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
              data-testid={`card-pricing-${tier.id}`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2" data-testid={`text-pricing-name-${tier.id}`}>
                  {tier.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold" data-testid={`text-pricing-price-${tier.id}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <CardDescription data-testid={`text-pricing-description-${tier.id}`}>
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2" data-testid={`text-pricing-feature-${tier.id}-${index}`}>
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                  onClick={handleCTA}
                  data-testid={`button-pricing-cta-${tier.id}`}
                >
                  {tier.ctaText || 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
