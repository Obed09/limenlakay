// Analytics data types and structures for Limen Lakay dashboard

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  periodStart: string;
  periodEnd: string;
}

export interface MarketingMetrics {
  trafficSources: {
    organic: number;
    paid: number;
    social: number;
    direct: number;
    referral: number;
  };
  customerAcquisitionCost: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  marketingROI: number;
}

export interface CartAbandonmentData {
  id: string;
  customerEmail: string;
  customerName?: string;
  cartItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  cartValue: number;
  abandonedAt: string;
  remindersSent: number;
  lastReminderSent?: string;
  recovered: boolean;
  recoveredAt?: string;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  profitMargin: number;
  viewsToSales: number;
  stockLevel: number;
  averageRating?: number;
  returnRate: number;
}

export interface OperationalMetrics {
  pendingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  averageProcessingTime: number;
  averageShippingTime: number;
  inventoryValue: number;
  lowStockItems: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomersToday: number;
  topCustomers: {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }[];
  customerSegmentation: {
    vip: number;
    regular: number;
    newCustomers: number;
  };
}

// Mock data generator for development
export function generateMockAnalytics(): {
  sales: SalesMetrics;
  marketing: MarketingMetrics;
  cartAbandonments: CartAbandonmentData[];
  productPerformance: ProductPerformance[];
  operational: OperationalMetrics;
  customers: CustomerInsights;
} {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    sales: {
      totalRevenue: 15420.85,
      totalOrders: 187,
      conversionRate: 3.2,
      averageOrderValue: 82.46,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      periodStart: thirtyDaysAgo.toISOString(),
      periodEnd: now.toISOString()
    },
    
    marketing: {
      trafficSources: {
        organic: 45,
        paid: 25,
        social: 18,
        direct: 8,
        referral: 4
      },
      customerAcquisitionCost: 24.50,
      newCustomers: 89,
      returningCustomers: 98,
      customerLifetimeValue: 245.80,
      marketingROI: 4.2
    },

    cartAbandonments: [
      {
        id: 'cart-001',
        customerEmail: 'sarah.johnson@email.com',
        customerName: 'Sarah Johnson',
        cartItems: [
          { productId: 'LL-CON-001', productName: 'Urban Concrete Vessel', quantity: 1, price: 28.99 },
          { productId: 'LL-WOD-001', productName: 'Rustic Oak Vessel', quantity: 2, price: 24.99 }
        ],
        cartValue: 78.97,
        abandonedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        remindersSent: 1,
        lastReminderSent: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        recovered: false
      },
      {
        id: 'cart-002',
        customerEmail: 'mike.chen@email.com',
        customerName: 'Mike Chen',
        cartItems: [
          { productId: 'LL-CER-002', productName: 'Matte Black Ceramic', quantity: 1, price: 34.99 }
        ],
        cartValue: 34.99,
        abandonedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        remindersSent: 2,
        lastReminderSent: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        recovered: false
      },
      {
        id: 'cart-003',
        customerEmail: 'emma.davis@email.com',
        customerName: 'Emma Davis',
        cartItems: [
          { productId: 'LL-CUS-001', productName: 'Custom Mixed Media Vessel', quantity: 1, price: 45.99 }
        ],
        cartValue: 45.99,
        abandonedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        remindersSent: 1,
        lastReminderSent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recovered: true,
        recoveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],

    productPerformance: [
      {
        productId: 'LL-CON-001',
        productName: 'Urban Concrete Vessel',
        category: 'concrete',
        totalSold: 45,
        totalRevenue: 1304.55,
        profitMargin: 65.2,
        viewsToSales: 12.3,
        stockLevel: 15,
        averageRating: 4.8,
        returnRate: 2.1
      },
      {
        productId: 'LL-WOD-001',
        productName: 'Rustic Oak Vessel',
        category: 'wood',
        totalSold: 38,
        totalRevenue: 949.62,
        profitMargin: 58.7,
        viewsToSales: 15.2,
        stockLevel: 12,
        averageRating: 4.6,
        returnRate: 1.8
      },
      {
        productId: 'LL-CER-002',
        productName: 'Matte Black Ceramic',
        category: 'ceramic',
        totalSold: 32,
        totalRevenue: 1119.68,
        profitMargin: 62.4,
        viewsToSales: 9.8,
        stockLevel: 8,
        averageRating: 4.9,
        returnRate: 1.2
      },
      {
        productId: 'LL-CUS-001',
        productName: 'Custom Mixed Media Vessel',
        category: 'custom',
        totalSold: 18,
        totalRevenue: 827.82,
        profitMargin: 72.3,
        viewsToSales: 25.6,
        stockLevel: 5,
        averageRating: 5.0,
        returnRate: 0.5
      }
    ],

    operational: {
      pendingOrders: 12,
      shippingOrders: 8,
      deliveredOrders: 156,
      returnedOrders: 3,
      averageProcessingTime: 1.5, // days
      averageShippingTime: 3.2, // days
      inventoryValue: 12450.75,
      lowStockItems: 4
    },

    customers: {
      totalCustomers: 234,
      newCustomersToday: 5,
      topCustomers: [
        { id: 'cust-001', name: 'Amanda Wilson', email: 'amanda.w@email.com', totalSpent: 485.50, orderCount: 8 },
        { id: 'cust-002', name: 'James Rodriguez', email: 'james.r@email.com', totalSpent: 367.25, orderCount: 6 },
        { id: 'cust-003', name: 'Lisa Thompson', email: 'lisa.t@email.com', totalSpent: 298.75, orderCount: 5 },
      ],
      customerSegmentation: {
        vip: 15,
        regular: 89,
        newCustomers: 130
      }
    }
  };
}

// Cart abandonment email templates
export const CART_ABANDONMENT_TEMPLATES = {
  firstReminder: {
    subject: 'You left something beautiful behind...',
    delay: 1, // hours
    template: 'first-reminder'
  },
  secondReminder: {
    subject: 'Still thinking about your Limen Lakay candles?',
    delay: 24, // hours
    template: 'second-reminder'
  },
  finalReminder: {
    subject: 'Last chance - Your cart expires soon',
    delay: 72, // hours
    template: 'final-reminder'
  }
};

// Helper functions for analytics calculations
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getGrowthTrend(growthRate: number): 'up' | 'down' | 'neutral' {
  if (growthRate > 2) return 'up';
  if (growthRate < -2) return 'down';
  return 'neutral';
}