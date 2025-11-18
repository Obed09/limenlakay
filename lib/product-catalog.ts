// Product data structure with ID system for easy ordering
export interface Product {
  id: string; // Format: LL-CATEGORY-NUMBER (e.g., LL-CON-001)
  name: string;
  category: 'concrete' | 'wood' | 'ceramic' | 'custom';
  description: string;
  price: number;
  images: {
    main: string; // Primary product image
    gallery?: string[]; // Additional images
  };
  dimensions?: {
    height: string;
    diameter: string;
    weight?: string;
  };
  features: string[];
  inStock: boolean;
  popular?: boolean; // Featured product
}

// Sample product data - you'll replace with your actual products
export const productCatalog: Product[] = [
  // CONCRETE COLLECTION
  {
    id: 'LL-CON-001',
    name: 'Urban Concrete Vessel',
    category: 'concrete',
    description: 'Modern minimalist concrete candle in sleek geometric form. Perfect for contemporary spaces.',
    price: 28.99,
    images: {
      main: '/images/products/concrete/LL-CON-001-main.jpg',
      gallery: [
        '/images/products/concrete/LL-CON-001-side.jpg',
        '/images/products/concrete/LL-CON-001-top.jpg'
      ]
    },
    dimensions: {
      height: '4 inches',
      diameter: '3.5 inches',
      weight: '1.2 lbs'
    },
    features: [
      'Industrial concrete finish',
      'Natural soy wax',
      'Cotton wick',
      '40-hour burn time',
      'Reusable vessel'
    ],
    inStock: true,
    popular: true
  },
  {
    id: 'LL-CON-002',
    name: 'Textured Concrete Pillar',
    category: 'concrete',
    description: 'Hand-finished concrete with unique textural patterns. Each piece is one-of-a-kind.',
    price: 32.99,
    images: {
      main: '/images/products/concrete/LL-CON-002-main.jpg'
    },
    dimensions: {
      height: '5 inches',
      diameter: '3 inches'
    },
    features: [
      'Artisan textured finish',
      'Natural soy wax',
      'Wood wick',
      '45-hour burn time'
    ],
    inStock: true
  },
  {
    id: 'LL-CON-003',
    name: 'Minimalist Concrete Bowl',
    category: 'concrete',
    description: 'Wide concrete bowl design perfect for creating ambient lighting in any room.',
    price: 35.99,
    images: {
      main: '/images/products/concrete/LL-CON-003-main.jpg'
    },
    dimensions: {
      height: '2.5 inches',
      diameter: '5 inches'
    },
    features: [
      'Wide bowl design',
      'Multi-wick system',
      'Natural soy wax',
      '50-hour burn time'
    ],
    inStock: true
  },

  // WOOD COLLECTION
  {
    id: 'LL-WOD-001',
    name: 'Rustic Oak Vessel',
    category: 'wood',
    description: 'Handcrafted from reclaimed oak with natural wood grain and rustic charm.',
    price: 24.99,
    images: {
      main: '/images/products/wood/LL-WOD-001-main.jpg'
    },
    dimensions: {
      height: '4 inches',
      diameter: '3.5 inches'
    },
    features: [
      'Reclaimed oak wood',
      'Natural wood finish',
      'Coconut wax blend',
      'Cotton wick',
      '35-hour burn time'
    ],
    inStock: true,
    popular: true
  },
  {
    id: 'LL-WOD-002',
    name: 'Birch Bark Candle',
    category: 'wood',
    description: 'Natural birch bark exterior creates a stunning organic aesthetic.',
    price: 29.99,
    images: {
      main: '/images/products/wood/LL-WOD-002-main.jpg'
    },
    dimensions: {
      height: '4.5 inches',
      diameter: '3 inches'
    },
    features: [
      'Authentic birch bark',
      'Organic shape',
      'Soy wax blend',
      'Wood wick crackling sound'
    ],
    inStock: true
  },
  {
    id: 'LL-WOD-003',
    name: 'Driftwood Coastal Candle',
    category: 'wood',
    description: 'Beach-sourced driftwood vessel brings coastal vibes to your space.',
    price: 27.99,
    images: {
      main: '/images/products/wood/LL-WOD-003-main.jpg'
    },
    dimensions: {
      height: '3.5 inches',
      diameter: '4 inches'
    },
    features: [
      'Natural driftwood',
      'Ocean-weathered finish',
      'Sea salt & sage scent',
      'Cotton wick',
      '38-hour burn time'
    ],
    inStock: false // Example of out of stock
  },

  // CERAMIC COLLECTION
  {
    id: 'LL-CER-001',
    name: 'Glazed Ceramic Vessel',
    category: 'ceramic',
    description: 'Hand-thrown ceramic with beautiful glazed finish in earthy tones.',
    price: 31.99,
    images: {
      main: '/images/products/ceramic/LL-CER-001-main.jpg'
    },
    dimensions: {
      height: '4.5 inches',
      diameter: '3.5 inches'
    },
    features: [
      'Hand-thrown ceramic',
      'Artisan glaze finish',
      'Soy wax blend',
      'Cotton wick',
      '42-hour burn time'
    ],
    inStock: true
  },
  {
    id: 'LL-CER-002',
    name: 'Matte Black Ceramic',
    category: 'ceramic',
    description: 'Sophisticated matte black finish perfect for modern interiors.',
    price: 34.99,
    images: {
      main: '/images/products/ceramic/LL-CER-002-main.jpg'
    },
    dimensions: {
      height: '5 inches',
      diameter: '3.5 inches'
    },
    features: [
      'Matte black glaze',
      'Modern minimalist design',
      'Premium soy wax',
      'Lead-free wick'
    ],
    inStock: true,
    popular: true
  },

  // CUSTOM COLLECTION
  {
    id: 'LL-CUS-001',
    name: 'Custom Mixed Media Vessel',
    category: 'custom',
    description: 'Unique combination of concrete and wood elements. Custom designs available.',
    price: 45.99,
    images: {
      main: '/images/products/custom/LL-CUS-001-main.jpg'
    },
    dimensions: {
      height: 'Variable',
      diameter: 'Variable'
    },
    features: [
      'Mixed materials',
      'Custom design options',
      'Personalization available',
      'Premium wax blend',
      'Extended burn time'
    ],
    inStock: true
  },
  {
    id: 'LL-CUS-002',
    name: 'Personalized Engraved Vessel',
    category: 'custom',
    description: 'Any vessel can be personalized with custom engraving or text.',
    price: 39.99,
    images: {
      main: '/images/products/custom/LL-CUS-002-main.jpg'
    },
    features: [
      'Custom engraving',
      'Personal messages',
      'Choice of vessel type',
      'Perfect for gifts',
      'Various font options'
    ],
    inStock: true
  }
];

// Helper functions for product management
export const getProductById = (id: string): Product | undefined => {
  return productCatalog.find(product => product.id === id);
};

export const getProductsByCategory = (category: Product['category']): Product[] => {
  return productCatalog.filter(product => product.category === category);
};

export const getPopularProducts = (): Product[] => {
  return productCatalog.filter(product => product.popular === true);
};

export const getInStockProducts = (): Product[] => {
  return productCatalog.filter(product => product.inStock === true);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return productCatalog.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
  );
};

// Category information
export const categories = {
  concrete: {
    name: 'Concrete Collection',
    description: 'Modern minimalist vessels with industrial charm',
    icon: '🏗️'
  },
  wood: {
    name: 'Wood Collection', 
    description: 'Natural wooden vessels with rustic warmth',
    icon: '🌳'
  },
  ceramic: {
    name: 'Ceramic Collection',
    description: 'Hand-thrown pottery with artisan glazes',
    icon: '🏺'
  },
  custom: {
    name: 'Custom Collection',
    description: 'Personalized and bespoke candle vessels',
    icon: '✨'
  }
};