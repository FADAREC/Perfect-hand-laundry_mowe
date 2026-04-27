import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { businessConfig } from "../../../config/business";

export default function FAQ() {
  const { faqs } = businessConfig;
  
  if (!faqs || faqs.length === 0) return null;
  
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="py-20 md:py-28 bg-gray-50" id="faq">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
              FAQ
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600" data-testid="text-faq-description">
              Find answers to common questions about our services
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} data-testid={`accordion-faq-${faq.id}`}>
                  <AccordionTrigger className="text-left hover:text-primary transition-colors" data-testid={`button-faq-question-${faq.id}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed" data-testid={`text-faq-answer-${faq.id}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
          
          <motion.div
            className="text-center mt-12 pt-8 border-t"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-600 mb-4 text-lg">
              Still have questions?
            </p>
            <button 
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300 text-lg"
            >
              Contact us directly
              <span className="text-xl">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
