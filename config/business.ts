/**
 * Business Configuration Schema
 * 
 * This file contains all business-specific data for the website.
 * To customize for a new business, simply update the values in this file.
 * 
 * Future-proof schema supports:
 * - Multiple locations
 * - Multiple phone numbers and social media
 * - Service categories
 * - Gallery images
 * - Team members
 * - Special offers
 */

export interface BusinessLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hours?: BusinessHours[];
}

export interface BusinessHours {
  days: string;
  hours: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  price?: string;
  category?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  service?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category?: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  code?: string;
  validUntil?: string;
  discount?: string;
}

export interface BusinessConfig {
  // Core Business Info
  name: string;
  tagline?: string;
  description?: string;
  industry: string;
  logo?: string;
  
  // Contact Information
  primaryPhone: string;
  phones?: string[];
  email: string;
  whatsapp?: string;
  
  // Locations
  locations: BusinessLocation[];
  
  // Operating Hours (default for all locations)
  hours: BusinessHours[];
  
  // Social Media
  socialMedia?: SocialMedia[];
  
  // Services
  services: Service[];
  serviceCategories?: string[];
  
  // Pricing
  pricing?: PricingTier[];
  
  // Testimonials
  testimonials?: Testimonial[];
  
  // Team
  team?: TeamMember[];
  
  // FAQ
  faqs?: FAQ[];
  
  // Gallery
  gallery?: GalleryImage[];
  
  // Special Offers
  offers?: SpecialOffer[];
  
  // Primary CTA
  primaryCTA: {
    text: string;
    action: 'form' | 'phone' | 'whatsapp' | 'link';
    value?: string;
  };
  
  // About Section
  about?: {
    title: string;
    content: string;
    image?: string;
    stats?: {
      label: string;
      value: string;
    }[];
  };
  
  // How It Works Steps
  howItWorks?: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

/**
 * Caperberry Laundry - Business Configuration
 * Complete data from client + T&Cs + Express Pricing
 */

import { BusinessConfig } from "./types";

export const businessConfig: BusinessConfig = {
  name: "Caperberry Laundry",
  tagline: "Premium Care, Proper Laundry",
  description: "Lagos' trusted laundry service for over 13 years. Special attention to stains, gentle handling, and crisp ironing—because your clothes deserve it.",
  industry: "Laundry & Fabric Care Services",
  
  primaryPhone: "+234 802 834 7146",
  phones: ["+234 802 834 7146", "+234 813 654 5705"],
  email: "info@caperberrylaundry.com", // Update when domain is ready
  whatsapp: "+2348028347146",
  
  locations: [
    {
      name: "Yaba",
      address: "Suite 3, Wisdom Cafe, 2001 Cafeteria, Newhall, Unilag, Akoka-Yaba",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      phone: "+234 802 834 7146"
    },
    {
      name: "Lekki",
      address: "Grande Mall, Shop 2A, Second Floor, Orchid Road, Lekki",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      phone: "+234 813 654 5705"
    }
  ],
  
  // Service Coverage Areas
  serviceAreas: [
    "Yaba", "Bariga", "Akoka", "Shomolu", "Gbagada", 
    "Maryland", "Ikeja", "Orchid", "Lekki", "Chevron", 
    "Ikota", "Ajah"
  ],
  
  hours: [
    {
      days: "Monday - Saturday",
      hours: "8:00 AM - 7:00 PM"
    }
  ],
  
  socialMedia: [
    {
      platform: "Facebook",
      url: "https://facebook.com/caperberrylaundry", // Update with real link
      icon: "facebook"
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/caperberrylaundry", // Update with real link
      icon: "instagram"
    },
    {
      platform: "WhatsApp",
      url: "https://wa.me/2348028347146",
      icon: "message-circle"
    }
  ],
  
  services: [
    {
      id: "laundry",
      name: "Wash & Fold",
      description: "Professional washing and folding service. Note: No special stain treatment included in standard wash & fold.",
      icon: "washing-machine",
      category: "Standard"
    },
    {
      id: "dry-cleaning",
      name: "Dry Cleaning",
      description: "Expert dry cleaning for delicate fabrics and special garments. Includes stain attention and gentle handling.",
      icon: "shirt",
      category: "Premium"
    },
    {
      id: "stain-removal",
      name: "Stain Treatment",
      description: "We do our best to remove stains, though not all stains can be guaranteed. Please highlight stained garments for proper treatment.",
      icon: "droplet",
      category: "Premium"
    },
    {
      id: "ironing",
      name: "Ironing",
      description: "Crisp, professional ironing for a polished look.",
      icon: "iron",
      category: "Standard"
    },
    {
      id: "express",
      name: "Express Service (24hrs)",
      description: "Need it fast? We're happy to help with 24-hour express service. Pricing varies by location.",
      icon: "zap",
      category: "Express"
    }
  ],
  
  // Express Pricing Policy
  expressPricing: {
    unilagStudents: {
      multiplier: 2,
      description: "2x Standard rate"
    },
    islandClients: {
      multiplier: 4,
      description: "4x standard rate"
    },
    default: {
      multiplier: 4,
      description: "4x standard rate for express service"
    }
  },
  
  // Pricing will be per-item based on garment type
  // Client will provide full price list
  pricingModel: "per-item", // Not per-kg
  
  testimonials: [
    {
      id: "1",
      name: "Satisfied Customer",
      content: "Excellent service and attention to detail. My clothes always come back perfect!",
      rating: 5,
      service: "Dry Cleaning"
    },
    {
      id: "2",
      name: "Regular Client",
      content: "Been using Caperberry for years. Reliable, professional, and affordable.",
      rating: 5,
      service: "Wash & Fold"
    },
    {
      id: "3",
      name: "Business Client",
      content: "The express service saved me before an important meeting. Highly recommended!",
      rating: 5,
      service: "Express Service"
    }
  ],
  
  faqs: [
    {
      id: "1",
      question: "Where are you located?",
      answer: "We have two locations: 1) Yaba Branch at Suit 3, Wisdom Cafe, Newhall, Unilag (08028347146), and 2) Lekki Branch at Grande Mall, Shop 2A, Orchid Road (08136545705).",
      category: "Locations"
    },
    {
      id: "1b",
      question: "What areas do you cover for pickup?",
      answer: "We serve Yaba, Bariga, Akoka, Shomolu, Gbagada, Maryland, Ikeja, Orchid, Lekki, Chevron, Ikota, and Ajah with free pickup and delivery.",
      category: "Service Area"
    },
    {
      id: "2",
      question: "What is your turnaround time?",
      answer: "Standard laundry is ready in 4 working days. We also offer express service with 24-hour turnaround.",
      category: "Delivery"
    },
    {
      id: "3",
      question: "How much is express service?",
      answer: "Express service (24 hours) costs 2x standard rate for UNILAG students, and 4x standard rate for Island clients and others due to transportation costs.",
      category: "Pricing"
    },
    {
      id: "4",
      question: "What payment methods do you accept?",
      answer: "We operate a 100% prepayment policy for all orders. Payment can be made via bank transfer to:\n\nYABA BRANCH:\nAccount: 5799599578 (Moniepoint)\nName: CAPERBERRY FABRIC CARE\n\nORCHID BRANCH (LEKKI):\nAccount: 5195709104 (Moniepoint)\nName: CAPERBERRY FABRIC CARE - ORCHID\n\nPayment is required at drop-off or before pickup is scheduled. You can also pay in cash at our physical locations.",
      category: "Payment"
    },
    {
      id: "5",
      question: "What if my clothes are damaged?",
      answer: "In the rare event of damage during cleaning, we will reimburse you up to 5 times the laundry charge for that item. Please notify us within 24 hours of delivery.",
      category: "Policy"
    },
    {
      id: "6",
      question: "Do you guarantee stain removal?",
      answer: "We do our best to remove all stains safely. However, not all stains can be removed. If stain removal would be unsafe or compromise the fabric, we'll inform you and won't charge for that item.",
      category: "Services"
    },
    {
      id: "7",
      question: "What happens to unclaimed items?",
      answer: "Items not picked up 1 month after completion (and notification) may be given out. Please collect your items promptly.",
      category: "Policy"
    },
    {
      id: "8",
      question: "Should I check my pockets?",
      answer: "Yes! Please check all pockets for money, jewelry, or valuables. Caperberry is not liable for lost items left in garments.",
      category: "Policy"
    }
  ],
  
  howItWorks: [
    {
      id: "1",
      title: "Drop Off or Schedule Pickup",
      description: "Bring your items to us or schedule a pickup at your convenience",
      icon: "calendar"
    },
    {
      id: "2",
      title: "We Count & Invoice",
      description: "We log all items and generate an invoice. Payment required upfront.",
      icon: "package"
    },
    {
      id: "3",
      title: "We Clean with Care",
      description: "Premium cleaning with attention to stains and gentle handling",
      icon: "sparkles"
    },
    {
      id: "4",
      title: "Ready in 4 Days",
      description: "Collect your fresh, clean clothes (or 24hrs for express)",
      icon: "truck"
    }
  ],
  
  about: {
    title: "About Caperberry Laundry",
    content: "Established over 13 years ago, Caperberry Laundry has been Lagos' trusted fabric care partner. We combine traditional expertise with modern techniques to deliver exceptional results. Our commitment to premium care means every garment receives special attention to stains, gentle handling, and crisp ironing. We follow strict quality standards and treat your clothes with the care they deserve.",
    stats: [
      {
        label: "Years of Service",
        value: "13+"
      },
      {
        label: "Service Areas",
        value: "12+"
      },
      {
        label: "Happy Customers",
        value: "1000+"
      },
      {
        label: "Rating",
        value: "4.8/5"
      }
    ]
  },
  
  policies: {
    payment: "100% prepayment required at drop-off",
    turnaround: "4 working days standard, 24 hours express",
    expressCharge: "2x for UNILAG students, 4x for Island/Others",
    damageCompensation: "Up to 5x cleaning charge",
    reportWindow: "24 hours after delivery",
    unclaimedItems: "Items may be given out after 1 month"
  },
  
  bankDetails: {
    bank: "Moniepoint",
    accountNumber: "5799599578",
    accountName: "Caperberry Fabric Care"
  },
  
  primaryCTA: {
    text: "Schedule Pickup",
    action: "form"
  }
};
