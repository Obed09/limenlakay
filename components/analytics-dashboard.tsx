'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Truck,
  AlertTriangle,
  Mail,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Target,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  generateMockAnalytics,
  formatCurrency,
  formatPercentage,
  getGrowthTrend,
  CartAbandonmentData,
  ProductPerformance
} from '../lib/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState(generateMockAnalytics());
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh analytics data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setAnalytics(generateMockAnalytics());
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const sendCartReminder = async (cartId: string) => {
    // In a real app, this would call your email service
    console.log(`Sending cart reminder for cart: ${cartId}`);
    // You could integrate with services like SendGrid, Mailgun, etc.
    
    // Update the cart data to show reminder was sent
    setAnalytics(prev => ({
      ...prev,
      cartAbandonments: prev.cartAbandonments.map(cart => 
        cart.id === cartId 
          ? { ...cart, remindersSent: cart.remindersSent + 1, lastReminderSent: new Date().toISOString() }
          : cart
      )
    }));
  };

  const GrowthIndicator = ({ value, trend }: { value: number; trend: 'up' | 'down' | 'neutral' }) => {
    const Icon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
    const colorClass = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{formatPercentage(Math.abs(value))}</span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights into your business performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.sales.totalRevenue)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <GrowthIndicator 
                value={analytics.sales.revenueGrowth} 
                trend={getGrowthTrend(analytics.sales.revenueGrowth)} 
              />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.sales.totalOrders}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <GrowthIndicator 
                value={analytics.sales.ordersGrowth} 
                trend={getGrowthTrend(analytics.sales.ordersGrowth)} 
              />
            </div>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(analytics.sales.conversionRate)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Target className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary" className="text-xs">
                Industry avg: 2.1%
              </Badge>
            </div>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.sales.averageOrderValue)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">
                +5.2% vs last period
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Marketing & Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {Object.entries(analytics.marketing.trafficSources).map(([source, percentage]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {source}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-8">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Customer Acquisition Cost</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.marketing.customerAcquisitionCost)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Marketing ROI</span>
              <span className="font-bold text-green-600">
                {analytics.marketing.marketingROI.toFixed(1)}x
              </span>
            </div>
          </div>
        </Card>

        {/* Customer Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Insights</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.marketing.newCustomers}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">New Customers</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.marketing.returningCustomers}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Returning</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Customers</h4>
            {analytics.customers.topCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {customer.orderCount} orders
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(customer.totalSpent)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cart Abandonment & Recovery */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cart Abandonment & Recovery
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="text-xs">
              {analytics.cartAbandonments.filter(cart => !cart.recovered).length} Active
            </Badge>
            <Badge variant="default" className="text-xs">
              {formatCurrency(analytics.cartAbandonments.reduce((sum, cart) => sum + cart.cartValue, 0))} Value
            </Badge>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {analytics.cartAbandonments.map((cart) => (
            <div key={cart.id} className={`p-4 rounded-lg border ${cart.recovered ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {cart.customerName || cart.customerEmail}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(cart.abandonedAt).toLocaleDateString()} • {formatCurrency(cart.cartValue)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {cart.recovered ? (
                    <Badge variant="default" className="bg-green-600 text-white">
                      Recovered
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="secondary">
                        {cart.remindersSent} reminders sent
                      </Badge>
                      <Button
                        onClick={() => sendCartReminder(cart.id)}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Items: {cart.cartItems.map(item => `${item.productName} (${item.quantity})`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Performance & Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Performance
          </h3>
          
          <div className="space-y-3">
            {analytics.productPerformance.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}. {product.productName}
                    </span>
                    {product.averageRating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {product.averageRating}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {product.totalSold} sold • {formatPercentage(product.profitMargin)} margin
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.totalRevenue)}
                  </div>
                  {product.stockLevel < 10 && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock: {product.stockLevel}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Operational Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Operations Overview
          </h3>
          
          <div className="space-y-4">
            {/* Order Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {analytics.operational.pendingOrders}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {analytics.operational.shippingOrders}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg Processing Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.operational.averageProcessingTime} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg Shipping Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.operational.averageShippingTime} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Inventory Value</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(analytics.operational.inventoryValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {analytics.operational.lowStockItems > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {analytics.operational.lowStockItems} items low in stock
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}