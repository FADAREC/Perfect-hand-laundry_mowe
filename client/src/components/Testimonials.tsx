import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { businessConfig } from "../../../config/business";
import { Star } from "lucide-react";

export default function Testimonials() {
  const { testimonials } = businessConfig;
  
  if (!testimonials || testimonials.length === 0) return null;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="text-testimonials-title">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="text-testimonials-description">
            Real experiences from real customers
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="h-full bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-500" 
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <CardContent className="pt-8 pb-6 px-6">
                  
                  <div className="flex gap-1 mb-6" data-testid={`rating-${testimonial.id}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg" data-testid={`text-testimonial-content-${testimonial.id}`}>
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-gray-900" data-testid={`text-testimonial-name-${testimonial.id}`}>
                        {testimonial.name}
                      </div>
                      {testimonial.role && (
                        <div className="text-sm text-gray-500" data-testid={`text-testimonial-role-${testimonial.id}`}>
                          {testimonial.role}
                        </div>
                      )}
                      {testimonial.service && (
                        <div className="text-xs text-primary font-medium mt-1" data-testid={`text-testimonial-service-${testimonial.id}`}>
                          {testimonial.service}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
