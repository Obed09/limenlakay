"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Barcode from "react-barcode";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BarcodeSystemPage() {
  const [productName, setProductName] = useState("Lavender Bliss Candle");
  const [sku, setSku] = useState("LAV-001");
  const [warningText, setWarningText] = useState(
    "Burn within sight. Keep away from flammable objects. Keep away from children and pets."
  );
  const [burningInstructions, setBurningInstructions] = useState(
    'Trim wick to 1/4" before lighting. Keep candle free of any foreign materials including matches and wick trimmings. Only burn the candle on a level, fire resistant surface. Do not burn candle for more than four hours at a time. Stop use when only 1/4" of wax remains.'
  );
  
  const phone = "561 593 0238";
  const email = "info@limenlakay.com";
  const website = "www.limenlakay.com";

  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    sku: string;
    trackingCode: string;
  }>>([]);

  const labelRef = useRef<HTMLDivElement>(null);

  // Generate unique tracking code
  const generateTrackingCode = (sku: string) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `TRK-${sku}-${timestamp}-${random}`.toUpperCase();
  };

  const handleAddProduct = () => {
    if (productName && sku) {
      const trackingCode = generateTrackingCode(sku);
      const newProduct = {
        id: Date.now().toString(),
        name: productName,
        sku: sku,
        trackingCode: trackingCode,
      };
      setProducts([...products, newProduct]);
    }
  };

  const handlePrint = () => {
    if (labelRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Label</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${labelRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  // Generate tracking URL for QR code
  const trackingCode = generateTrackingCode(sku);
  const trackingUrl = `https://www.limenlakay.com/track/${trackingCode}`;
  const qrCodeData = trackingUrl

  const qrCodeData = `Product: ${productName}\nSKU: ${sku}\nPhone: ${phone}\nEmail: ${email}\nWebsite: ${website}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="text-purple-600">|||</span>
              Barcode & QR Code System
            </h1>
            <p className="text-gray-600">
              Generate and manage product barcodes and QR codes
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddProduct}
              className="bg-purple-600 hover:bg-purple-700"
            >
              ✚ Add Product
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-300"
            >
              🖨 Print Label
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {products.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {products.length}
                  </div>
                  <div className="text-sm text-gray-600">Barcodes Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {products.length}
                  </div>
                  <div className="text-sm text-gray-600">QR Codes Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Vanilla Dream Candle"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  placeholder="e.g., VAN-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warning">Warning Text</Label>
                <Textarea
                  id="warning"
                  placeholder="Enter warning text"
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Burning Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Enter burning instructions"
                  value={burningInstructions}
                  onChange={(e) => setBurningInstructions(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>📞 Phone: {phone}</p>
                  <p>✉️ Email: {email}</p>
                  <p>🌐 Website: {website}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Label Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Label Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={labelRef}
                className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg"
                style={{ maxWidth: "400px", margin: "0 auto" }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <Image
                      src="/images/limen-lakay-logo.png"
                      alt="Limen Lakay Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Warning Icons and Title */}
                <div className="text-center mb-4">
                  <div className="flex justify-center gap-3 mb-2">
                    <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
                      <span className="text-xl">🔥</span>
                    </div>
                    <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
                      <span className="text-xl">🕯️</span>
                    </div>
                    <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
                      <span className="text-xl">👶</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                    <span>⚠️</span> WARNING
                  </h2>
                  <p className="text-xs leading-tight">{warningText}</p>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-black my-4"></div>

                {/* Burning Instructions */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-center">
                    BURNING INSTRUCTIONS
                  </h3>
                  <p className="text-xs leading-tight text-center">
                    {burningInstructions}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 border border-gray-300">
                    <QRCodeCanvas value={qrCodeData} size={120} />
                  </div>
                </div>

                {/* Barcode */}
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-50 p-3 rounded">
                    <Barcode
                      value={sku}
                      width={1.5}
                      height={50}
                      fontSize={12}
                      margin={5}
                    />
                  </div>
                </div>

                {/* Product Name - Eye-catching */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 p-[2px] rounded-lg">
                    <div className="bg-white px-4 py-3 rounded-[6px]">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
                        {productName}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-center text-xs space-y-1 bg-gray-50 p-3 rounded">
                  <p>📞 {phone}</p>
                  <p>✉️ {email}</p>
                  <p>🌐 {website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Added Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      SKU: {product.sku}
                    </p>
                    <p className="text-xs text-purple-600 mb-3 font-mono break-all">
                      Track: {product.trackingCode}
                    </p>
                    <div className="flex justify-center mb-2">
                      <Barcode
                        value={product.sku}
                        width={1}
                        height={30}
                        fontSize={10}
                      />
                    </div>
                    <div className="flex justify-center mb-2">
                      <QRCodeCanvas
                        value={`https://www.limenlakay.com/track/${product.trackingCode}`}
                        size={80}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Scan to track
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
