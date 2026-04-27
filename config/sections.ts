/**
 * Sections Configuration - Content Blocks System
 * 
 * This file controls which sections appear on the website and in what order.
 * Add, remove, or reorder sections to customize the layout for different businesses.
 * 
 * This is the key to making the template modular and reusable.
 * Think of it as a mini-CMS for your landing page.
 */

export type SectionType =
  | 'hero'
  | 'services'
  | 'how-it-works'
  | 'pricing'
  | 'testimonials'
  | 'about'
  | 'team'
  | 'gallery'
  | 'faq'
  | 'promo-banner'
  | 'contact'
  | 'footer';

export interface SectionConfig {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  
  // Optional section-specific settings
  settings?: {
    // Hero settings
    height?: string;
    overlay?: boolean;
    
    // Services settings
    columns?: number;
    showPrices?: boolean;
    
    // Testimonials settings
    layout?: 'grid' | 'carousel';
    
    // Gallery settings
    gridColumns?: number;
    
    // FAQ settings
    defaultOpen?: boolean;
    
    // Any other custom settings
    [key: string]: any;
  };
}

/**
 * Active Sections Configuration
 * 
 * Customize the order and visibility of sections here.
 * Lower order numbers appear first on the page.
 */
export const sectionsConfig: SectionConfig[] = [
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    order: 1,
    settings: {
      height: '85vh',
      overlay: true
    }
  },
  {
    id: 'services',
    type: 'services',
    enabled: true,
    order: 2,
    settings: {
      columns: 3,
      showPrices: true
    }
  },
  {
    id: 'how-it-works',
    type: 'how-it-works',
    enabled: true,
    order: 3
  },
  {
    id: 'pricing',
    type: 'pricing',
    enabled: true,
    order: 4
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    enabled: false,
    order: 5,
    settings: {
      layout: 'grid'
    }
  },
  {
    id: 'about',
    type: 'about',
    enabled: true,
    order: 6
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    order: 7,
    settings: {
      defaultOpen: false
    }
  },
  {
    id: 'contact',
    type: 'contact',
    enabled: true,
    order: 8
  },
  {
    id: 'footer',
    type: 'footer',
    enabled: true,
    order: 9
  },
  
  // Disabled sections (can be enabled as needed)
  {
    id: 'team',
    type: 'team',
    enabled: false,
    order: 100
  },
  {
    id: 'gallery',
    type: 'gallery',
    enabled: false,
    order: 101,
    settings: {
      gridColumns: 3
    }
  },
  {
    id: 'promo-banner',
    type: 'promo-banner',
    enabled: false,
    order: 0 // Top of page
  }
];

/**
 * Helper function to get enabled sections in order
 */
export function getActiveSections(): SectionConfig[] {
  return sectionsConfig
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Helper function to check if a section is enabled
 */
export function isSectionEnabled(type: SectionType): boolean {
  return sectionsConfig.some(section => section.type === type && section.enabled);
}

/**
 * Helper function to get section settings
 */
export function getSectionSettings(type: SectionType): Record<string, any> | undefined {
  return sectionsConfig.find(section => section.type === type)?.settings;
}

/**
 * CUSTOMIZATION GUIDE
 * 
 * To customize sections for a new business:
 * 
 * 1. ENABLE/DISABLE SECTIONS
 *    Set enabled: true/false for each section
 * 
 * 2. REORDER SECTIONS
 *    Change the order number (lower = appears first)
 * 
 * 3. ADD NEW SECTIONS
 *    Add a new entry to the array with a unique type
 *    Create the corresponding component
 *    Update the SectionType union
 * 
 * 4. CONFIGURE SETTINGS
 *    Add section-specific settings in the settings object
 *    Use these settings in your component
 * 
 * Examples:
 * 
 * Restaurant Website:
 * - Enable: hero, services (menu), gallery, testimonials, contact
 * - Disable: pricing, team, how-it-works
 * 
 * Professional Services (Law, Consulting):
 * - Enable: hero, services, team, about, testimonials, faq, contact
 * - Disable: pricing, gallery, how-it-works
 * 
 * E-commerce/Retail:
 * - Enable: promo-banner, hero, services (products), gallery, testimonials, faq
 * - Disable: team, how-it-works, about
 */
