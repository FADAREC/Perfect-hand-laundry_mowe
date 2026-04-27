import { motion } from "framer-motion";
import { businessConfig } from "../../../config/business";
import { Calendar, Package, Sparkles, Truck } from "lucide-react";

const iconMap: Record<string, any> = {
  'calendar': Calendar,
  'package': Package,
  'sparkles': Sparkles,
  'truck': Truck,
};

export default function HowItWorks() {
  const steps = businessConfig.howItWorks || [];
  
  if (steps.length === 0) return null;
  
  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Package;
  };
  
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-xl text-gray-600" data-testid="text-how-it-works-description">
            Four easy steps to fresh, clean clothes
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2" />
            
            <div className="space-y-12 md:space-y-20">
              {steps.map((step, index) => {
                const Icon = getIcon(step.icon);
                const isEven = index % 2 === 0;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative"
                    data-testid={`step-${step.id}`}
                  >
                    <div className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      
                      <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} text-center`}>
                        <div className="inline-block">
                          <div className={`inline-flex items-center gap-3 mb-3 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                            <span className="text-5xl font-bold text-gray-200" data-testid={`text-step-number-${step.id}`}>
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900" data-testid={`text-step-title-${step.id}`}>
                              {step.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 text-lg leading-relaxed" data-testid={`text-step-description-${step.id}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                          <Icon className="h-9 w-9 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 hidden md:block" />
                      
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        
        <motion.div
          className="text-center mt-16 pt-8 border-t max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-600 text-lg">
            <strong className="text-gray-900">Standard turnaround:</strong> 4 working days<br />
            <strong className="text-gray-900">Express service:</strong> 24 hours (contact for pricing)
          </p>
        </motion.div>
      </div>
    </section>
  );
}
