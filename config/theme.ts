/**
 * Theme Configuration - Caperberry Laundry
 * 
 * Brand colors extracted from logo:
 * - Sage Green: Fresh, clean, natural, premium
 * - Charcoal Black: Sophisticated, professional
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
  };
  
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  
  spacing: {
    section: {
      mobile: string;
      desktop: string;
    };
    container: string;
    cardPadding: string;
  };
  
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  
  animations: {
    duration: string;
    easing: string;
  };
}

export const themeConfig: ThemeConfig = {
  colors: {
    // Sage/Mint Green - Primary brand color from logo
    primary: "145 20% 75%",           // Lighter sage for better contrast
    primaryForeground: "145 100% 5%", // Very dark text on sage
    
    // Charcoal Black - Secondary/accent from logo
    accent: "0 0% 11%",               // Almost black (#1A1D1F)
    accentForeground: "145 20% 85%",  // Light sage text on dark bg
  },
  
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "Menlo, Monaco, monospace"
  },
  
  spacing: {
    section: {
      mobile: "py-16",
      desktop: "md:py-20 lg:py-24"
    },
    container: "max-w-7xl mx-auto px-4 md:px-6",
    cardPadding: "p-6 md:p-8"
  },
  
  borderRadius: {
    small: "rounded-md",
    medium: "rounded-lg",
    large: "rounded-xl"
  },
  
  animations: {
    duration: "duration-300",
    easing: "ease-in-out"
  }
};

