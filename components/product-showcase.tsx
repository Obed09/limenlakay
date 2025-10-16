import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: 1,
    name: "Concrete Vessel Collection",
    description: "Minimalist candles in handcrafted concrete vessels. Each vessel is unique with natural variations.",
    price: "From $35",
    materials: ["Soy Wax", "Concrete Vessel", "Cotton Wick"],
    scents: ["Vanilla Amber", "Cedar & Sage", "Fresh Linen"],
    category: "Concrete"
  },
  {
    id: 2,
    name: "Artisan Wood Collection",
    description: "Rustic charm meets modern elegance in these wooden vessel candles.",
    price: "From $28",
    materials: ["Beeswax Blend", "Reclaimed Wood", "Hemp Wick"],
    scents: ["Sandalwood", "Pine Forest", "Warm Spice"],
    category: "Wood"
  },
  {
    id: 3,
    name: "Ceramic Studio Collection",
    description: "Hand-thrown ceramic vessels with unique glazes, perfect for gifting or collecting.",
    price: "From $42",
    materials: ["Pure Soy Wax", "Studio Ceramic", "Cotton Wick"],
    scents: ["Lavender Dreams", "Citrus Burst", "Midnight Musk"],
    category: "Ceramic"
  },
  {
    id: 4,
    name: "Custom Creations",
    description: "Work with us to create personalized candles with your choice of vessel, scent, and size.",
    price: "Quote on Request",
    materials: ["Your Choice", "Custom Vessel", "Premium Wick"],
    scents: ["Bespoke Blends", "Personal Favorites", "Signature Scents"],
    category: "Custom"
  }
];

export function ProductShowcase() {
  return (
    <section id="products" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Collections
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our handcrafted candles, each one unique and made with care using premium materials
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300 border-amber-100 dark:border-amber-900">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {product.price}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Materials:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Available Scents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.scents.map((scent, index) => (
                        <Badge key={index} variant="outline" className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300">
                          {scent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All candles are made to order with a 5-7 day turnaround time
          </p>
          <a 
            href="#contact" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
          >
            Place Custom Order
          </a>
        </div>
      </div>
    </section>
  );
}