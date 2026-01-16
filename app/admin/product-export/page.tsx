'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink } from 'lucide-react';

export default function ProductExportPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (platform: string) => {
    setExporting(true);
    try {
      const response = await fetch(`/api/products/export-csv?platform=${platform}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `limen-lakay-products-${platform}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export products');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Export Products</h1>
      <p className="text-muted-foreground mb-6">
        Download your products in CSV format to upload to other platforms
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* TikTok Shop */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📱</span> TikTok Shop
            </CardTitle>
            <CardDescription>
              Export products for TikTok Shop bulk upload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleExport('tiktok')} 
              disabled={exporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download TikTok CSV
            </Button>
            
            <div className="text-sm space-y-2">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Download the CSV file</li>
                <li>Go to <a href="https://seller.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TikTok Shop Seller Center</a></li>
                <li>Navigate to Products → Bulk Upload</li>
                <li>Upload the CSV file</li>
                <li>Upload product images separately</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Etsy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🛍️</span> Etsy
            </CardTitle>
            <CardDescription>
              Export products for Etsy CSV import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleExport('etsy')} 
              disabled={exporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Etsy CSV
            </Button>
            
            <div className="text-sm space-y-2">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Download the CSV file</li>
                <li>Go to <a href="https://www.etsy.com/your/shops/me/tools/listings/csv" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Etsy CSV Import</a></li>
                <li>Upload the CSV file</li>
                <li>Map CSV columns if needed</li>
                <li>Add photos to each listing</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Generic Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Generic CSV
            </CardTitle>
            <CardDescription>
              Export all products in generic format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleExport('generic')} 
              disabled={exporting}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Generic CSV
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Use this format for other platforms or manual import. Includes all product data.
            </div>
          </CardContent>
        </Card>

        {/* API Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚡</span> API Integration
            </CardTitle>
            <CardDescription>
              Automatic syncing (advanced)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-semibold">For automatic syncing:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Apply for TikTok Shop Partner API</li>
                <li>Get Etsy API key from developer portal</li>
                <li>Use webhooks for real-time sync</li>
                <li>Contact me to set this up</li>
              </ul>
            </div>
            
            <Button 
              variant="secondary" 
              className="w-full"
              asChild
            >
              <a href="https://developers.etsy.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Etsy Developer Docs
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📝 Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">Images:</p>
            <p className="text-muted-foreground">
              The CSV contains image URLs from your website. TikTok and Etsy require you to upload images directly to their platforms. Save your product photos locally first.
            </p>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Pricing:</p>
            <p className="text-muted-foreground">
              Review platform fees before setting prices. TikTok and Etsy both charge transaction fees that reduce your profit margin.
            </p>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Inventory Sync:</p>
            <p className="text-muted-foreground">
              CSV export is one-time only. For real-time inventory sync across platforms, you'll need API integration.
            </p>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Product Requirements:</p>
            <p className="text-muted-foreground">
              Each platform has specific requirements for product descriptions, images, and categories. Review their guidelines before uploading.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
