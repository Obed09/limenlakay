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
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8 text-center print:shadow-none print:p-6"
      >
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-24 h-24">
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
        <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent print:text-xl">
          Pay with Zelle
        </h1>

        {/* Note */}
        <p className="text-gray-700 mb-4 text-base print:text-sm">
          Scan this QR code with your phone&apos;s camera<br />
          to pay quickly and securely via Zelle
        </p>

        {/* QR Code - Using bank-provided image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-[300px] h-[300px] print:w-[280px] print:h-[280px]">
            <Image
              src="/images/Zelle-QR code 1.png"
              alt="Zelle QR Code"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Email and Phone below QR */}
        <div className="space-y-1 text-gray-600">
          <p className="text-lg font-semibold text-gray-800 print:text-base">
            {zelleEmail}
          </p>
          <p className="text-base font-semibold text-gray-800 print:text-sm">
            561 727 7992
          </p>
          <p className="text-xs print:text-[10px]">
            Or manually enter this email address in your Zelle app
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 print:mt-4 print:pt-3">
          <p className="text-xs text-gray-600 print:text-[10px]">
            📞 561 593 0238 | 📧 info@limenlakay.com
          </p>
          <p className="text-xs text-gray-600 mt-1 print:text-[10px] print:mt-0.5">
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
