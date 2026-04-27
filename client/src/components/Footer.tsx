import { businessConfig } from "../../../config/business";
import { Facebook, Instagram, Twitter } from "lucide-react";
import ShareButtons from "./ShareButtons";

const socialIconMap: Record<string, any> = {
  'facebook': Facebook,
  'instagram': Instagram,
  'twitter': Twitter,
};

export default function Footer() {
  const { name, services, locations, phones, email, socialMedia } = businessConfig;
  const currentYear = new Date().getFullYear();
  
  const getSocialIcon = (iconName: string) => {
    const IconComponent = socialIconMap[iconName.toLowerCase()] || Facebook;
    return IconComponent;
  };
  
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900" data-testid="text-footer-brand">
              {name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Professional laundry and dry cleaning services in Lagos.
            </p>
            
            {/* Share Button */}
            <div className="mb-4">
              <ShareButtons />
            </div>
            
            {socialMedia && socialMedia.length > 0 && (
              <div className="flex gap-3">
                {socialMedia.map((social) => {
                  const Icon = getSocialIcon(social.icon);
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all duration-300"
                      aria-label={social.platform}
                      data-testid={`link-social-${social.platform.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4 text-gray-700" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="link-services">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="link-pricing">
                  About Us
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="link-about">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="link-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Our Services</h4>
            <ul className="space-y-2 text-sm">
              {services.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <span className="text-gray-600" data-testid={`text-footer-service-${service.id}`}>
                    {service.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${phones}`} className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="text-footer-phone">
                  {phones}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-gray-600 hover:text-primary transition-colors duration-300" data-testid="text-footer-email">
                  {email}
                </a>
              </li>
              {locations[0] && (
                <li className="text-gray-600" data-testid="text-footer-address">
                  {locations[0].address}<br />
                  {locations[0].city}, {locations[0].state}
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p data-testid="text-copyright">
            © {currentYear} {name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-primary transition-colors duration-300" data-testid="link-terms">
              Terms & Conditions
            </a>
            <a href="/admin" className="hover:text-primary transition-colors duration-300" data-testid="link-admin">
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
