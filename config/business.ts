import { BusinessConfig } from "./types";

export const businessConfig: BusinessConfig = {
  name: "Perfect Hand Laundry and Dry Cleaning Services",
  tagline: "Your Clothes, Handled with Care",
  description: "Mowe's trusted laundry and dry cleaning service. Two convenient locations, professional handling, and a keen eye for stains — because your clothes deserve the best.",
  industry: "Laundry & Dry Cleaning Services",

  primaryPhone: "+234 706 688 9341",
  phones: ["+234 706 688 9341"],
  email: "perfecthandlaundry@gmail.com",
  whatsapp: "+2347066889341",

  locations: [
    {
      name: "Ifokabale Branch",
      address: "144 Mowe-Ofada Road, Ifokabale Hotel",
      city: "Mowe",
      state: "Ogun State",
      country: "Nigeria",
      phone: "+234 706 688 9341"
    },
    {
      name: "Thuraya Branch",
      address: "Higher Ground Road, Thuraya",
      city: "Mowe",
      state: "Ogun State",
      country: "Nigeria",
      phone: "+234 706 688 9341"
    }
  ],

  hours: [
    {
      days: "Monday - Saturday",
      hours: "8:00 AM - 7:00 PM"
    },
    {
      days: "Sunday",
      hours: "10:00 AM - 4:00 PM"
    }
  ],

  socialMedia: [
    {
      platform: "WhatsApp",
      url: "https://wa.me/2347066889341",
      icon: "message-circle"
    }
  ],

  services: [
    {
      id: "wash-fold",
      name: "Wash & Fold",
      description: "Professional machine washing and neat folding for your everyday wear. Fresh, clean, and ready to wear.",
      icon: "washing-machine",
      category: "Standard"
    },
    {
      id: "dry-cleaning",
      name: "Dry Cleaning",
      description: "Expert dry cleaning for delicate fabrics, suits, gowns, and special garments that need extra care.",
      icon: "shirt",
      category: "Premium"
    },
    {
      id: "ironing",
      name: "Ironing & Pressing",
      description: "Crisp, wrinkle-free ironing that gives your clothes that sharp, polished finish.",
      icon: "iron",
      category: "Standard"
    },
    {
      id: "stain-removal",
      name: "Stain Treatment",
      description: "Targeted stain treatment using professional techniques. Please point out stained areas when dropping off.",
      icon: "droplet",
      category: "Premium"
    },
    {
      id: "express",
      name: "Express Service",
      description: "Need it urgently? We offer fast-turnaround cleaning when you're in a hurry. Ask us about availability.",
      icon: "zap",
      category: "Express"
    }
  ],

  testimonials: [
    {
      id: "1",
      name: "Bola A.",
      content: "Best laundry service in Mowe. My clothes always come back smelling fresh and neatly folded. I won't go anywhere else.",
      rating: 5,
      service: "Wash & Fold"
    },
    {
      id: "2",
      name: "Emeka O.",
      content: "They handled my agbada with so much care. The ironing was perfect. Highly recommend their dry cleaning service.",
      rating: 5,
      service: "Dry Cleaning"
    },
    {
      id: "3",
      name: "Funmi S.",
      content: "I had a stubborn stain I thought was gone forever. They treated it and returned the dress looking brand new. Very impressed!",
      rating: 5,
      service: "Stain Treatment"
    }
  ],

  faqs: [
    {
      id: "1",
      question: "Where are your locations?",
      answer: "We have two branches in Mowe, Ogun State:\n1. 144 Mowe-Ofada Road, Ifokabale Hotel\n2. Higher Ground Road, Thuraya, Mowe\n\nBoth branches are open Monday to Saturday, 8am – 7pm.",
      category: "Locations"
    },
    {
      id: "2",
      question: "What is your turnaround time?",
      answer: "Standard orders are ready within 2–4 working days depending on volume. We also offer express service for urgent needs — ask us when you drop off.",
      category: "Service"
    },
    {
      id: "3",
      question: "Do you handle delicate fabrics like lace, ankara, or suits?",
      answer: "Yes! We handle all fabric types including lace, ankara, suits, agbada, gowns, and other delicate materials. Just let us know when dropping off so we treat them with the appropriate care.",
      category: "Service"
    },
    {
      id: "4",
      question: "Can you remove all stains?",
      answer: "We do our very best on every stain. However, some stains — especially old or set-in ones — may not be fully removable. We'll always let you know if a stain is challenging before we proceed.",
      category: "Service"
    },
    {
      id: "5",
      question: "How do I contact you or place an order?",
      answer: "The easiest way is to WhatsApp us on 07066889341 or walk into either of our branches. We're happy to answer questions and get your order started.",
      category: "Contact"
    },
    {
      id: "6",
      question: "What if my item is damaged?",
      answer: "We handle every garment with the utmost care. In the rare event of damage, please notify us within 24 hours of pickup and we will work with you to resolve it fairly.",
      category: "Policy"
    }
  ],

  howItWorks: [
    {
      id: "1",
      title: "Drop Off Your Items",
      description: "Bring your clothes to either of our two Mowe branches. Point out any stains or special instructions.",
      icon: "package"
    },
    {
      id: "2",
      title: "We Get to Work",
      description: "Your items are sorted, treated, and cleaned with professional care and the right products.",
      icon: "sparkles"
    },
    {
      id: "3",
      title: "Pick Up Fresh & Clean",
      description: "Ready in 2–4 days. Collect your neatly folded, crisp, and fresh-smelling clothes.",
      icon: "check-circle"
    }
  ],

  about: {
    title: "About Perfect Hand Laundry",
    content: "Perfect Hand Laundry and Dry Cleaning Services has been serving the Mowe community with dedication and professionalism. With two convenient locations on Mowe-Ofada Road and Higher Ground Road, we make quality fabric care accessible to everyone in the area. From everyday wash and fold to delicate dry cleaning, we treat every item as if it were our own.",
    stats: [
      {
        label: "Locations in Mowe",
        value: "2"
      },
      {
        label: "Services Offered",
        value: "5+"
      },
      {
        label: "Happy Customers",
        value: "500+"
      },
      {
        label: "Days a Week",
        value: "6"
      }
    ]
  },

  primaryCTA: {
    text: "WhatsApp Us Now",
    action: "whatsapp",
    value: "https://wa.me/2347066889341"
  }
};