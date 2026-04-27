import { ThemeConfig } from "./types";

// Perfect Hand Laundry Theme
// Going with a clean navy blue + crisp white
// Feels: trustworthy, professional, clean — right for a laundry brand in Mowe

export const themeConfig: ThemeConfig = {
  colors: {
    // Deep navy blue — trust, professionalism, cleanliness
    primary: "220 60% 35%",
    primaryForeground: "0 0% 100%",

    // Warm off-white accent — clean, fresh
    accent: "210 20% 96%",
    accentForeground: "220 60% 25%",
  },

  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "Menlo, Monaco, monospace"
  },

  spacing: {
    section: {
      mobile: "py-14",
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