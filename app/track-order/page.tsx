"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, MapPin, Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const response = await fetch(`/api/ups/tracking?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.found) {
        setError("Tracking number not found. Please check and try again.");
        return;
      }

      setTrackingData(data);
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Failed to fetch tracking information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              Limen Lakay
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Track Your Order
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your UPS tracking number to see real-time shipping updates
          </p>
        </div>

        {/* Tracking Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-600" />
              Enter Tracking Number
            </CardTitle>
            <CardDescription>
              You can find your tracking number in your order confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="tracking" className="sr-only">
                  Tracking Number
                </Label>
                <Input
                  id="tracking"
                  placeholder="e.g., 1Z999AA10123456784"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>
              <Button
                onClick={handleTrack}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-amber-600" />
                  Shipment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tracking Number
                    </p>
                    <p className="font-semibold text-lg">{trackingData.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Current Status
                    </p>
                    <p className="font-semibold text-lg text-amber-700 dark:text-amber-400">
                      {trackingData.status}
                    </p>
                  </div>
                  {trackingData.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {trackingData.estimatedDelivery}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Service
                    </p>
                    <p className="font-semibold">
                      {trackingData.shipment.service}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Tracking History
                </CardTitle>
                <CardDescription>
                  Most recent updates appear first
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.events.map((event: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex-shrink-0">
                        {index === 0 ? (
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-amber-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {event.status}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.location}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Need help with your order?
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="mailto:info@limenlakay.com">
                      <Button variant="outline" size="sm">
                        Contact Us
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" size="sm">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions (shown when no tracking data) */}
        {!trackingData && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>How to Track Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Find Your Tracking Number</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your order confirmation email for the UPS tracking number
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Enter the Number Above</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type or paste your tracking number in the input field
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">View Real-Time Updates</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See the current location and status of your shipment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
