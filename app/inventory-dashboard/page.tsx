"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalScans: 0,
    totalSales: 0,
    totalRevenue: 0,
    activeRetailers: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase
        .from("tracked_products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Load recent scans
      const { data: scansData } = await supabase
        .from("product_scans")
        .select(`
          *,
          tracked_products(product_name, sku),
          retailers(name)
        `)
        .order("scanned_at", { ascending: false })
        .limit(50);

      // Load retailers
      const { data: retailersData } = await supabase
        .from("retailers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      // Load low stock
      const { data: lowStockData } = await supabase
        .from("tracked_products")
        .select("*")
        .lte("remaining_quantity", 3)
        .eq("is_active", true)
        .order("remaining_quantity", { ascending: true });

      // Calculate stats
      const totalSales = scansData?.filter((s) => s.scan_type === "sale").length || 0;
      const totalRevenue = scansData
        ?.filter((s) => s.scan_type === "sale")
        .reduce((sum, s) => sum + (s.sale_price || 0), 0) || 0;

      setProducts(productsData || []);
      setScans(scansData || []);
      setRetailers(retailersData || []);
      setLowStock(lowStockData || []);
      setStats({
        totalProducts: productsData?.length || 0,
        totalScans: scansData?.length || 0,
        totalSales,
        totalRevenue,
        activeRetailers: retailersData?.length || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getScanTypeEmoji = (type: string) => {
    switch (type) {
      case "sale": return "🛍️";
      case "inventory_check": return "📦";
      case "received": return "📥";
      case "returned": return "↩️";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Inventory Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time tracking and analytics for your products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Products</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Scans</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalScans}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Sales</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalSales}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Revenue</div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Retailers</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.activeRetailers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                ⚠️ Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center bg-white p-3 rounded"
                  >
                    <div>
                      <p className="font-semibold">{product.product_name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold">
                        {product.remaining_quantity} left
                      </p>
                      <p className="text-xs text-gray-600">
                        {product.current_location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="scans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="scans">Recent Activity</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="retailers">Retailers</TabsTrigger>
          </TabsList>

          {/* Recent Scans */}
          <TabsContent value="scans">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scans.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No activity yet. Scans will appear here when retailers use
                      the tracking system.
                    </p>
                  ) : (
                    scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="text-3xl">
                          {getScanTypeEmoji(scan.scan_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold">
                              {scan.tracked_products?.product_name}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatDate(scan.scanned_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {scan.retailers?.name} - {scan.scan_type.replace("_", " ")}
                          </p>
                          {scan.sale_price && (
                            <p className="text-sm font-semibold text-green-600">
                              ${scan.sale_price.toFixed(2)}
                            </p>
                          )}
                          {scan.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              Note: {scan.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {product.product_name}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">SKU: {product.sku}</p>
                        <p className="text-gray-600">
                          Location: {product.current_location}
                        </p>
                        <p className="text-gray-600">
                          Stock: {product.remaining_quantity} units
                        </p>
                        {product.price && (
                          <p className="text-green-600 font-semibold">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Track: {product.tracking_code}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retailers */}
          <TabsContent value="retailers">
            <Card>
              <CardHeader>
                <CardTitle>Active Retailers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {retailers.map((retailer) => (
                    <div
                      key={retailer.id}
                      className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {retailer.name}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {retailer.contact_person && (
                              <p>Contact: {retailer.contact_person}</p>
                            )}
                            {retailer.email && <p>📧 {retailer.email}</p>}
                            {retailer.phone && <p>📞 {retailer.phone}</p>}
                            {retailer.address && (
                              <p>📍 {retailer.address}, {retailer.city}, {retailer.state}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-mono">
                            {retailer.access_code}
                          </div>
                          {retailer.commission_rate && (
                            <p className="text-xs text-gray-600 mt-2">
                              Commission: {retailer.commission_rate}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            className="border-purple-300"
          >
            🔄 Refresh Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
