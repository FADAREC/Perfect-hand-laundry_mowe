import { Card } from "@/components/ui/card";
import { businessConfig } from "../../../config/business";

export default function About() {
  const { about } = businessConfig;
  
  if (!about) return null;
  
  return (
    <section className="py-20 md:py-28 bg-background" id="about">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="text-about-title">
              {about.title}
            </h2>
          </div>
          
          <div className="mb-12">
            <p className="text-xl leading-relaxed text-gray-700 text-center max-w-3xl mx-auto" data-testid="text-about-content">
              {about.content}
            </p>
          </div>
          
          {about.stats && about.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {about.stats.map((stat: { value: string; label: string }, index: number) => (
                <Card 
                  key={index} 
                  className="p-8 text-center border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-500" 
                  data-testid={`card-stat-${index}`}
                >
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3" data-testid={`text-stat-value-${index}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600" data-testid={`text-stat-label-${index}`}>
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
