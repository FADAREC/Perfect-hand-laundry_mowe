import { SectionConfig, SectionType } from "./types";

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
      showPrices: false  // No pricing data yet — upsell later
    }
  },
  {
    id: 'how-it-works',
    type: 'how-it-works',
    enabled: true,
    order: 3
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    enabled: true,
    order: 4,
    settings: {
      layout: 'grid'
    }
  },
  {
    id: 'about',
    type: 'about',
    enabled: true,
    order: 5
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    order: 6,
    settings: {
      defaultOpen: false
    }
  },
  {
    id: 'contact',
    type: 'contact',
    enabled: true,
    order: 7
  },
  {
    id: 'footer',
    type: 'footer',
    enabled: true,
    order: 8
  },

  // Disabled — enable when client is ready to upgrade
  {
    id: 'pricing',
    type: 'pricing',
    enabled: false,
    order: 100
  },
  {
    id: 'team',
    type: 'team',
    enabled: false,
    order: 101
  },
  {
    id: 'gallery',
    type: 'gallery',
    enabled: false,
    order: 102,
    settings: {
      gridColumns: 3
    }
  },
  {
    id: 'promo-banner',
    type: 'promo-banner',
    enabled: false,
    order: 0
  }
];

export function getActiveSections(): SectionConfig[] {
  return sectionsConfig
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);
}

export function isSectionEnabled(type: SectionType): boolean {
  return sectionsConfig.some(section => section.type === type && section.enabled);
}

export function getSectionSettings(type: SectionType): Record<string, any> | undefined {
  return sectionsConfig.find(section => section.type === type)?.settings;
}