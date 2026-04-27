import { MessageCircle } from "lucide-react";
import { businessConfig } from "../../../config/business";
import { Button } from "@/components/ui/button";

export default function FloatingWhatsApp() {
  const { whatsapp } = businessConfig;
  
  if (!whatsapp) return null;
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'd like to schedule a laundry pickup.");
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 p-0"
        onClick={handleWhatsApp}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>
    </div>
  );
}
