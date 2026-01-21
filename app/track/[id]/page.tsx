"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { SiteFooter } from '@/components/site-footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function TrackProductPage() {
  const params = useParams();
  const trackingId = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [actionType, setActionType] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [retailerName, setRetailerName] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadProduct();
  }, [trackingId]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("tracked_products")
        .select("*")
        .eq("tracking_code", trackingId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Verify retailer access code
      const { data: retailer } = await supabase
        .from("retailers")
        .select("*")
        .eq("access_code", accessCode)
        .single();

      if (!retailer) {
        alert("Invalid access code. Please check and try again.");
        setSubmitting(false);
        return;
      }

      setRetailerName(retailer.name);

      // Get user info
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();

      // Record the scan
      const { error: scanError } = await supabase
        .from("product_scans")
        .insert({
          product_id: product.id,
          retailer_id: retailer.id,
          scan_type: actionType,
          location: retailer.name,
          scanned_by: retailer.name,
          quantity: parseInt(quantity),
          sale_price: salePrice ? parseFloat(salePrice) : null,
          notes: notes,
          ip_address: ipData.ip,
          user_agent: userAgent,
        });

      if (scanError) throw scanError;

      // Send notification email
      await fetch("/api/tracking/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product,
          retailer: retailer,
          actionType: actionType,
          quantity: parseInt(quantity),
          salePrice: salePrice,
          notes: notes,
        }),
      });

      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setActionType("");
        setNotes("");
        setSalePrice("");
        loadProduct(); // Refresh product data
      }, 3000);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error recording action. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">
              This tracking code is invalid or the product has been removed.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="max-w-md w-full border-green-200 shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2 text-green-700">Success!</h2>
            <p className="text-gray-700 mb-4">
              {actionType === "sale" && "Sale recorded successfully!"}
              {actionType === "inventory_check" && "Inventory check completed!"}
              {actionType === "received" && "Product receipt confirmed!"}
              {actionType === "returned" && "Return recorded!"}
            </p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">Store: {retailerName}</p>
              <p className="text-sm text-gray-600">Product: {product.product_name}</p>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            </div>
            <p className="text-sm text-gray-500">
              Limen Lakay has been notified.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src="/images/limen-lakay-logo.png"
                alt="Limen Lakay"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Tracking
          </h1>
          <p className="text-gray-600">Record sales and inventory actions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 p-[2px] rounded-lg mb-4">
                  <div className="bg-white px-4 py-3 rounded-[6px]">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
                      {product.product_name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-semibold">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold capitalize">{product.product_type || "N/A"}</span>
                </div>
                {product.fragrance && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fragrance:</span>
                    <span className="font-semibold">{product.fragrance}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Retail Price:</span>
                  <span className="font-semibold text-green-600">
                    ${product.price?.toFixed(2) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Location:</span>
                  <span className="font-semibold">{product.current_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Quantity:</span>
                  <span className="font-semibold text-purple-600">
                    {product.remaining_quantity} units
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-xs text-gray-600 text-center">
                  Tracking Code: {product.tracking_code}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Form */}
          <Card>
            <CardHeader>
              <CardTitle>Record Action</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type *</Label>
                  <Select value={actionType} onValueChange={setActionType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">🛍️ Record Sale</SelectItem>
                      <SelectItem value="inventory_check">📦 Inventory Check</SelectItem>
                      <SelectItem value="received">📥 Received Inventory</SelectItem>
                      <SelectItem value="returned">↩️ Return Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessCode">Store Access Code *</Label>
                  <Input
                    id="accessCode"
                    placeholder="e.g., BL-2025-001"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter your unique store code
                  </p>
                </div>

                {(actionType === "sale" || actionType === "returned") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>

                    {actionType === "sale" && (
                      <div className="space-y-2">
                        <Label htmlFor="salePrice">Sale Price</Label>
                        <Input
                          id="salePrice"
                          type="number"
                          step="0.01"
                          placeholder={product.price?.toFixed(2) || "0.00"}
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!actionType || !accessCode || submitting}
                >
                  {submitting ? "Processing..." : "Submit"}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Limen Lakay will receive an instant
                    notification when you submit this action.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Need help? Contact Limen Lakay:
              </p>
              <p>📞 561 593 0238 | ✉️ info@limenlakay.com | 🌐 www.limenlakay.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
}
