import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center text-center">
      <div className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-5xl lg:text-6xl font-bold !leading-tight text-gray-900 dark:text-gray-100">
          Limen Lakay
        </h1>
        <p className="text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-light">
          Handcrafted Candles in Unique Vessels
        </p>
        <p className="text-lg lg:text-xl !leading-relaxed mx-auto max-w-2xl text-gray-700 dark:text-gray-400">
          Each candle is lovingly crafted by hand, featuring natural wax blends in beautiful concrete vessels 
          and artisanal materials. Bring warmth and character to your space with our unique creations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/custom-order" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Create Your Custom Candle
          </Link>
          <Link 
            href="#products" 
            className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Browse Collection
          </Link>
        </div>
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent my-8" />
    </div>
  );
}
