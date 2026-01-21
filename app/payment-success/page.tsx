'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Mail, Home } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Thank you for your purchase from Limen Lakay
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Confirmation Email Sent
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a confirmation email with your order details and receipt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Order Processing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your candle is being carefully prepared. We'll send you tracking information once it ships.
                </p>
              </div>
            </div>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
              Order ID: {sessionId}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#contact" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions about your order? Email us at{' '}
            <a href="mailto:info@limenlakay.com" className="text-amber-600 hover:text-amber-700 font-medium">
              info@limenlakay.com
            </a>
          </p>
        </CardContent>
      </Card>
      <SiteFooter />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
