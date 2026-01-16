"use client";

import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/limen-lakay-logo.png"
              alt="Limen Lakay"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold text-orange-600">
              Limen Lakay
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
