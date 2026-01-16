"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { KringleProductGrid } from "@/components/kringle-product-grid";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  // In a real app, you'd fetch the full product details from your database
  // For now, we'll show a placeholder
  const wishlistProducts = Array.from(wishlist).map((id) => ({
    id,
    name: `Product ${id}`,
    price: 25.99,
    originalPrice: 35.00,
    rating: 4.5,
    reviewCount: 10,
    image: `https://via.placeholder.com/400x400/D97706/FFFFFF?text=Product+${id}`,
    category: "Featured",
    onSale: true,
  }));

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-amber-600 fill-amber-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            My Wishlist
          </h1>
        </div>

        {wishlist.size === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding candles you love to your wishlist
            </p>
            <a
              href="/catalog"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You have {wishlist.size} {wishlist.size === 1 ? "item" : "items"} in your wishlist
            </p>
            <KringleProductGrid
              products={wishlistProducts}
              title=""
              viewAllLink="/catalog"
            />
          </div>
        )}
      </div>
    </main>
  );
}
