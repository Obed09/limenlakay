'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductDataExtractor from '@/components/product-data-extractor';
import BulkImport from '@/components/bulk-import';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import BulkOrderQuestionnaire from '@/components/bulk-order-questionnaire';
import VesselManager from '@/components/vessel-manager';
// import QuestionnaireManager from '@/components/questionnaire-manager'; // Temporarily disabled for build
import { FileText, Database, Users, Upload, BarChart3, FileCheck, Package, Settings } from 'lucide-react';

export default function AdminPage() {
  const [importedProductsCount, setImportedProductsCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(12); // Current catalog count

  const handleImportComplete = (products: any[]) => {
    setImportedProductsCount(prev => prev + products.length);
    setTotalProducts(prev => prev + products.length);
    // You could also show a success notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                ADMIN MODE
              </div>
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                Full Edit Access
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Limen Lakay Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              📝 Click "Content" tab to edit questionnaire text | 📦 Click "Vessels" tab to manage container options
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <a 
              href="/bulk-order"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4" />
                <span>Client Order Form</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProducts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Products
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {importedProductsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Imported Today
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  4
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Categories
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((totalProducts / 50) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Catalog Progress
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="questionnaire" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Bulk Import</span>
            </TabsTrigger>
            <TabsTrigger value="manual-entry" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
            <TabsTrigger value="vessels" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>📦 Edit Vessels</span>
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>📝 Edit Questionnaire</span>
            </TabsTrigger>
            <TabsTrigger value="client-form" className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="bulk-import" className="space-y-6">
            <BulkImport onImportComplete={handleImportComplete} />
          </TabsContent>

          <TabsContent value="manual-entry" className="space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manual Product Entry
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Extract and enter product information manually from PDFs or other sources
                </p>
              </div>
              <ProductDataExtractor />
            </Card>
          </TabsContent>

          <TabsContent value="vessels" className="space-y-6">
            <Card className="p-6 border-l-4 border-green-500">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span>📦 Vessel/Container Manager</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <strong>ADMIN ONLY:</strong> Add, edit, or remove vessel options in Section 3 of the questionnaire. Upload images and control visibility.
                </p>
              </div>
              <VesselManager />
            </Card>
          </TabsContent>

          <TabsContent value="questionnaire" className="space-y-6">
            <Card className="p-6 border-l-4 border-blue-500">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>📝 Questionnaire Content Editor</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <strong>ADMIN ONLY:</strong> Edit all text content in the bulk order questionnaire. Changes are saved automatically and will appear for all clients.
                </p>
              </div>
              <div className="text-center py-8">
                <div className="text-yellow-600 text-4xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Content Editor Temporarily Disabled</h3>
                <p className="text-gray-600">
                  The content editor is being updated. Use the vessel manager and preview for now.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="client-form" className="space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Client Bulk Order Form Preview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  This is how the bulk order questionnaire appears to clients. 
                  You can also <a href="/bulk-order" target="_blank" className="text-blue-600 hover:underline">open it in a new window</a>.
                </p>
              </div>
              <div className="max-h-[800px] overflow-y-auto border rounded-lg">
                <BulkOrderQuestionnaire adminMode={true} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Limen Lakay Product Management System</p>
            <p className="text-sm mt-1">
              Need help? Check our documentation or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}