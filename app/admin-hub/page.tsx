'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  Zap,
  Megaphone,
  Calendar,
  MessageSquare,
  AlertCircle,
  Grid,
  Palette,
  Volume2,
  Eye,
} from 'lucide-react';

export default function AdminHub() {
  const adminSections = [
    {
      category: 'Products & Inventory',
      icon: Package,
      color: 'blue',
      links: [
        { name: 'Products Manager', href: '/admin-products', desc: 'Add, edit, and manage all products' },
        { name: 'Vessels Manager', href: '/admin-vessels', desc: 'Manage concrete vessel options' },
        { name: 'Scents Library', href: '/admin-scents', desc: 'Manage available scents' },
        { name: 'Inventory Dashboard', href: '/inventory-dashboard', desc: 'Track stock levels' },
        { name: 'Price Calculator', href: '/admin-price-calculator', desc: 'Calculate and set pricing' },
      ],
    },
    {
      category: 'Orders & Sales',
      icon: ShoppingCart,
      color: 'green',
      links: [
        { name: 'Orders', href: '/admin-orders', desc: 'View and manage customer orders' },
        { name: 'Invoices', href: '/admin-invoices', desc: 'Generate and track invoices' },
        { name: 'Barcode System', href: '/barcode-system', desc: 'Generate product barcodes' },
      ],
    },
    {
      category: 'Workshops & Events',
      icon: Calendar,
      color: 'purple',
      links: [
        { name: 'Workshop Bookings', href: '/admin-workshop', desc: 'Manage workshop reservations' },
        { name: 'Workshop Settings', href: '/workshop-settings', desc: 'Configure workshop options' },
      ],
    },
    {
      category: 'Marketing & Content',
      icon: Megaphone,
      color: 'orange',
      links: [
        { name: 'Social Media Manager', href: '/social-media-manager', desc: 'Schedule and post to social media' },
        { name: 'Brand Voice Settings', href: '/admin-brand-voice', desc: 'Configure AI brand personality' },
        { name: 'Questionnaire Manager', href: '/admin-simple', desc: 'Manage custom order questionnaire' },
      ],
    },
    {
      category: 'Customer Support',
      icon: MessageSquare,
      color: 'red',
      links: [
        { name: 'Feedback', href: '/feedback-admin', desc: 'View customer feedback and reviews' },
      ],
    },
    {
      category: 'Analytics & Reports',
      icon: BarChart3,
      color: 'indigo',
      links: [
        { name: 'Analytics Dashboard', href: '/admin?tab=analytics', desc: 'View sales and traffic analytics' },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              ADMIN MODE
            </div>
            <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              Full Access
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Manage all aspects of Limen Lakay from one central hub. Select a section below to access specific admin tools.
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <Card
                key={section.category}
                className={`${colors.bg} border-2 ${colors.border} hover:shadow-lg transition-shadow overflow-hidden`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                        {section.category}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        {link.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {link.desc}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                View in Products Manager
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Track
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                View in Orders Manager
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Workshops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Schedule
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                View in Workshop Manager
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Post
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                View in Social Manager
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            <strong>💡 Tip:</strong> Bookmark this page for quick access to all admin functions. Each section contains all the tools you need for that area of the business.
          </p>
        </div>
      </div>
    </div>
  );
}
