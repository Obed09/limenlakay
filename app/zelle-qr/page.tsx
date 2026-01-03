'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ZelleQRPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const zelleEmail = 'limenlakayllc@gmail.com';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      {/* Non-printable controls */}
      <div className="max-w-2xl mx-auto mb-8 print:hidden">
        <Button 
          onClick={handlePrint}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Print QR Code
        </Button>
      </div>

      {/* Printable content */}
      <div 
        ref={printRef}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-12 text-center print:shadow-none"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32">
            <Image
              src="/images/limen-lakay-logo.png"
              alt="Limen Lakay Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
          Pay with Zelle
        </h1>

        {/* Note */}
        <p className="text-gray-700 mb-8 text-lg">
          Scan this QR code with your phone&apos;s camera<br />
          to pay quickly and securely via Zelle
        </p>

        {/* QR Code - Using bank-provided image */}
        <div className="flex justify-center mb-8">
          <div className="relative w-[350px] h-[350px]">
            <Image
              src="/images/Zelle-QR code 1.png"
              alt="Zelle QR Code"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Email below QR */}
        <div className="space-y-2 text-gray-600">
          <p className="text-xl font-semibold text-gray-800">
            {zelleEmail}
          </p>
          <p className="text-sm">
            Or manually enter this email address in your Zelle app
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            📞 561 593 0238 | 📧 info@limenlakay.com
          </p>
          <p className="text-sm text-gray-600 mt-2">
            🌐 www.limenlakay.com
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}
