"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useWishlist } from "@/lib/wishlist-context";

interface FinishedCandle {
  id: string;
  name: string;
  sku: string;
  scent?: string;
  vessel_name?: string;
  vessel_color?: string;
  type?: 'candle' | 'vessel';
  price?: number;
}

export function KringleHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [finishedCandles, setFinishedCandles] = useState<FinishedCandle[]>([]);
  const [searchResults, setSearchResults] = useState<FinishedCandle[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { wishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch both finished candles and empty vessels
    Promise.all([
      fetch('/api/finished-candles').then(res => res.json()),
      fetch('/api/vessels?available=true').then(res => res.json())
    ])
      .then(([candlesData, vesselsData]) => {
        console.log('Fetched candles data:', candlesData);
        console.log('Fetched vessels data:', vesselsData);
        
        const allProducts: FinishedCandle[] = [];
        
        // Add finished candles
        if (candlesData.candles) {
          const candles = candlesData.candles.map((c: any) => ({
            ...c,
            type: 'candle' as const
          }));
          allProducts.push(...candles);
        }
        
        // Add empty vessels
        if (vesselsData.vessels) {
          const vessels = vesselsData.vessels
            .filter((v: any) => v.allow_empty_vessel)
            .map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.id,
              vessel_name: v.name,
              vessel_color: v.color,
              type: 'vessel' as const,
              price: v.price
            }));
          allProducts.push(...vessels);
        }
        
        console.log('Total products:', allProducts.length);
        console.log('First product:', allProducts[0]);
        setFinishedCandles(allProducts);
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  // Search functionality
  useEffect(() => {
    console.log('Search query:', searchQuery);
    console.log('All candles:', finishedCandles);
    
    if (searchQuery.trim().length > 0) {
      const filtered = finishedCandles.filter(candle => 
        candle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candle.scent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candle.vessel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candle.vessel_color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candle.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Filtered results:', filtered);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, finishedCandles]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm">
      {/* Top Bar - Promotional Banner */}
      <div className="bg-amber-600 text-white py-2 px-4 text-center text-sm font-medium">
        ✨ Handcrafted Concrete Candle Vessels — Each One Uniquely Yours
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <Image
              src="/images/limen-lakay-logo.png"
              alt="Limen Lakay"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 hidden sm:block">
              Limen Lakay
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search candles, scents, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="pl-10 pr-4 w-full border-gray-300 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-500"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.type === 'vessel' ? `/custom-order?vessel=${item.id}` : `/candle/${item.sku}`}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                        {item.type === 'vessel' && (
                          <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Empty Vessel</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.vessel_name && item.vessel_color && (
                          <span>{item.vessel_color} {item.vessel_name}</span>
                        )}
                        {item.scent && (
                          <span> • Scent: {item.scent}</span>
                        )}
                        {item.price && (
                          <span> • ${item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* No Results Message */}
              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
                  <p className="text-gray-500 dark:text-gray-400 text-center">No candles found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden md:flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Login</span>
            </Link>
            
            <Link href="/wishlist" className="relative hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <Heart className="w-6 h-6" />
              {wishlist.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.size}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            <ThemeSwitcher />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-4 border-t border-gray-200 dark:border-gray-800">
          {mounted && (
            <>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-base">
              Candles <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
              {finishedCandles.length > 0 ? (
                finishedCandles.map((candle) => (
                  <DropdownMenuItem key={candle.id} asChild>
                    <Link href={`/candle/${candle.sku}`}>{candle.name}</Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span className="text-gray-500">Loading candles...</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-base">
              Customize <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/bulk-order" className="font-medium">Bulk Order Questionnaire</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/#contact" className="font-medium">Custom Order Inquiry</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/custom-order" className="font-medium">Vessel Selection & Fragrances</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/workshop-subscription" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-base">
            Workshops
          </Link>

          <Link href="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-base">
            About Us
          </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search candles, scents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-3">
              <Link href="/catalog?category=candles" className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium">
                Candles
              </Link>
              <Link href="/catalog?category=fragrances" className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium">
                Fragrances
              </Link>
              <div className="py-2 px-4 font-semibold text-gray-900 dark:text-gray-100">CUSTOMIZE</div>
              <Link href="/bulk-order" className="py-2 px-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                Bulk Order Questionnaire
              </Link>
              <Link href="/#contact" className="py-2 px-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                Custom Order Inquiry
              </Link>
              <Link href="/custom-order" className="py-2 px-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                Vessel Selection & Fragrances
              </Link>
              <Link href="/workshop-subscription" className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium">
                Workshops
              </Link>
              <Link href="/about" className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium">
                About Us
              </Link>
              <Link href="/auth/login" className="py-2 px-4 bg-amber-600 text-white rounded-md font-medium text-center hover:bg-amber-700">
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
