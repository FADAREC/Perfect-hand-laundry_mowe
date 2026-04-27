import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { businessConfig } from "../../../config/business";
import { 
  Sparkles, 
  Shirt, 
  Zap, 
  Droplet, 
  Package, 
  Scissors,
  WashingMachine
} from "lucide-react";

const iconMap: Record<string, any> = {
  'washing-machine': WashingMachine,
  'shirt': Shirt,
  'iron': Package,
  'droplet': Droplet,
  'zap': Zap,
  'scissors': Scissors,
  'sparkles': Sparkles,
};

export default function Services() {
  const { services } = businessConfig;
  
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Sparkles;
    return <IconComponent className="w-14 h-14 text-primary" />;
  };
  
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleExpressInquiry = () => {
    const whatsapp = businessConfig.whatsapp;
    if (whatsapp) {
      const message = encodeURIComponent("Hi! I'd like to inquire about Express Service (24hrs) pricing and availability.");
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
    } else {
      scrollToContact();
    }
  };
  
  return (
    <section className="py-20 md:py-28 bg-gray-50" id="services">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Our Services
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything Your Fabrics Need
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            From everyday laundry to special garments, we handle it all with premium care
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const isExpress = service.id === 'express';
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="group h-full bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-500"
                >
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-500">
                      {getIcon(service.icon)}
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {service.name}
                    </CardTitle>
                    
                    {!isExpress && service.price && (
                      <CardDescription className="text-primary font-semibold text-base">
                        {service.price}
                      </CardDescription>
                    )}
                    
                    {isExpress && (
                      <CardDescription className="text-gray-500 font-medium text-sm">
                        Available on request
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                    
                    {isExpress && (
                      <button
                        onClick={handleExpressInquiry}
                        className="w-full py-2 px-4 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-all duration-300"
                      >
                        Contact for Pricing
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-600 mb-4 text-lg">
            Not sure which service you need?
          </p>
          <button 
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300 text-lg"
          >
            Talk to our team
            <span className="text-xl">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
