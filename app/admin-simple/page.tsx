'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BulkOrderQuestionnaire from '@/components/bulk-order-questionnaire';
import VesselManager from '@/components/vessel-manager';
import { Package, FileCheck, Settings } from 'lucide-react';

export default function AdminSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              Limen Lakay Admin Dashboard (Simplified)
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              📦 Click "Edit Vessels" tab to manage container options | 📋 Click "Preview" to see client form
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <a 
              href="/client-preview"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                <FileCheck className="h-4 w-4" />
                <span>📤 Share with Client</span>
              </Button>
            </a>
            <a 
              href="/feedback-admin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4" />
                <span>📝 View Feedback</span>
              </Button>
            </a>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="vessels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vessels" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>📦 Edit Vessels</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>📋 Preview Client Form</span>
            </TabsTrigger>
          </TabsList>

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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-800">
                    ✨ <strong>How to use:</strong> Add new vessels, upload images by drag & drop, toggle visibility, and see changes instantly in the preview.
                  </p>
                </div>
              </div>
              <VesselManager />
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="p-6 border-l-4 border-blue-500">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 Client Bulk Order Form Preview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  This is how the bulk order questionnaire appears to clients with your vessel changes.
                  You can also <a href="/bulk-order" target="_blank" className="text-blue-600 hover:underline">open it in a new window</a>.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    🔄 <strong>Live Preview:</strong> Changes you make in the "Edit Vessels" tab will appear here immediately.
                  </p>
                </div>
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
            <p>Limen Lakay Admin System - Vessel Management</p>
            <p className="text-sm mt-1">
              📦 Edit vessels in the first tab, 📋 see changes in the preview tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}