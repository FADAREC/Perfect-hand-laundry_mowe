import { useState } from "react";
import { Button } from "@/components/ui/button";
import { businessConfig } from "../../../config/business";
import { Menu, X, Phone } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { name, primaryPhone } = businessConfig;
  
  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  
  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/2d.png" 
              alt={`${businessConfig.name} Logo`}
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">{businessConfig.name}</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-300"
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href={`tel:${primaryPhone}`} 
              className="text-sm text-gray-600 hover:text-primary transition-colors duration-300 flex items-center gap-2" 
              data-testid="link-header-phone"
            >
              <Phone className="w-4 h-4" />
              {primaryPhone}
            </a>
            <Button 
              onClick={() => handleNavClick('#contact')} 
              data-testid="button-header-cta"
              className="h-10 px-6 font-semibold"
            >
              Schedule Pickup
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-300 text-left"
                  data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={() => handleNavClick('#contact')} 
                  data-testid="button-mobile-cta"
                >
                  Schedule Pickup
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
