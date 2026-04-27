import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { businessConfig } from "../../../config/business";
import heroImageDesktop from "../../../attached_assets/generated_images/Laundry_facility_hero_image_25c6c2da.webp";
import { 
  ArrowRight, 
  Phone,
  MapPin,
  MessageCircle
} from "lucide-react";

export default function Hero() {
  const { name, tagline, locations, primaryPhone, whatsapp } = businessConfig;
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  };
  
  const handleWhatsApp = () => {
    if (whatsapp) {
      const message = encodeURIComponent("Hi! I'd like to book a laundry service.");
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${whatsapp.replace(/\D/g, '')}&text=${message}`
        : `https://web.whatsapp.com/send?phone=${whatsapp.replace(/\D/g, '')}&text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };
  
  const scrollToBooking = () => {
    document.getElementById('contact')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageDesktop}
            alt="Caperberry Laundry facility"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
            >
              {name}
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-3xl text-white/95 mb-4 font-light"
            >
              {tagline}
            </motion.p>
            
            <motion.p 
              variants={fadeIn}
              className="text-sm md:text-base text-white/80 mb-12 font-medium"
            >
              Serving Lagos for over 13 years
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg"
                onClick={scrollToBooking}
                className="bg-white text-gray-900 hover:bg-white/90 text-lg px-10 h-16 rounded-full shadow-2xl hover:shadow-xl transition-all duration-500 group font-semibold"
              >
                Schedule a Pickup
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={handleWhatsApp}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-10 h-16 rounded-full backdrop-blur-sm transition-all duration-500 group font-semibold"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Us
              </Button>
            </motion.div>
            
          </motion.div>
          
        </div>
        
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div 
            className="flex flex-col items-center gap-2 text-white/60"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs uppercase tracking-wider font-medium">Scroll</span>
            <div className="w-[1px] h-12 bg-white/40" />
          </motion.div>
        </motion.div>
        
      </section>
      
      {/* Locations Bar */}
      <section className="bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          
          <div className="text-center mb-10">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Visit Us
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              Two Convenient Locations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {locations.map((location, idx) => (
              <div key={idx} className="group">
                <div className="border border-gray-200 rounded-xl p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-500 bg-white">
                  
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {location.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {location.address}
                  </p>
                  
                  <a 
                    href={`tel:${location.phone}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
                  >
                    <Phone className="h-4 w-4" />
                    {location.phone}
                  </a>
                  
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500 mb-3">
              We serve
            </p>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Yaba • Akoka • Bariga • Shomolu • Gbagada • Maryland • Ikeja • Lekki • Orchid • Chevron • Ikota • Ajah
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
