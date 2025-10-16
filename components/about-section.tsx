export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-amber-50/30 dark:bg-amber-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
              The Art of Limen Lakay
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Limen Lakay means light of the home in Haitian Creole, and that is exactly what we create - 
              candles that bring warmth, comfort, and beauty to your living space.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Every candle begins as an idea, transforms through careful craftsmanship, and becomes a 
              unique piece that tells its own story. We believe in the power of handmade objects to 
              connect us to something deeper and more meaningful.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Handcrafted Quality</h3>
                  <p className="text-gray-600 dark:text-gray-400">Each candle is individually hand-poured and finished with attention to every detail.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Natural Materials</h3>
                  <p className="text-gray-600 dark:text-gray-400">We use only premium soy and beeswax blends with cotton and hemp wicks for clean burning.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Unique Vessels</h3>
                  <p className="text-gray-600 dark:text-gray-400">From concrete to reclaimed wood to studio ceramics, every vessel is chosen or crafted for character.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Process</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center font-bold">1</div>
                  <span className="text-gray-700 dark:text-gray-300">Select or craft the perfect vessel</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center font-bold">2</div>
                  <span className="text-gray-700 dark:text-gray-300">Blend premium wax with signature scents</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center font-bold">3</div>
                  <span className="text-gray-700 dark:text-gray-300">Hand-pour and center the wick</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center font-bold">4</div>
                  <span className="text-gray-700 dark:text-gray-300">Cure and finish each candle by hand</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-lg">
              <p className="text-amber-800 dark:text-amber-200 font-medium text-center">
                "Every candle we create carries the intention of bringing light and warmth to your home."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}