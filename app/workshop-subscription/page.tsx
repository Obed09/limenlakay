"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  MapPin, 
  Users, 
  Package, 
  GraduationCap, 
  ShieldCheck, 
  Gift,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";

interface WorkshopPackage {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  popular?: boolean;
}

const packages: WorkshopPackage[] = [
  {
    id: "single",
    name: "Single Workshop",
    price: 65,
    period: "/session",
    description: "🎨 Create your masterpiece in one amazing session!",
    features: [
      { text: "One 2.5-hour hands-on workshop", included: true },
      { text: "All materials included - we've got you covered!", included: true },
      { text: "Take home your beautiful custom vessel", included: true },
      { text: "Step-by-step digital guide for future projects", included: true },
      { text: "Expert hands-on instruction throughout", included: true },
      { text: "All tools and safety gear provided", included: true },
    ],
  },
];

const workshopDetails = [
  { icon: Clock, label: "Duration", value: "2.5 hours" },
  { icon: MapPin, label: "Location", value: "Our Studio & Online Materials" },
  { icon: Users, label: "Group Size", value: "Small groups (max 12) for personalized attention" },
  { icon: Package, label: "Included", value: "All materials, tools, and your finished vessel to take home" },
  { icon: GraduationCap, label: "Skill Level", value: "Complete beginners welcome!" },
  { icon: ShieldCheck, label: "Safety", value: "Protective gear provided" },
  { icon: Gift, label: "Bonus", value: "Digital guide with tips & future project ideas" },
];



const faqs = [
  {
    question: "What if I've never worked with cement before?",
    answer: "Perfect! This workshop is designed for complete beginners. We start with the basics and guide you through every step. All techniques are easy to learn with our hands-on approach.",
  },
  {
    question: "What should I wear to the workshop?",
    answer: "Wear comfortable clothes that you don't mind getting a little dusty. Closed-toe shoes are required. We provide aprons and all protective gear (gloves, safety glasses).",
  },
  {
    question: "Can I take my vessel home the same day?",
    answer: "Yes! Your vessel will be ready to take home at the end of the workshop. We'll give you instructions for the final curing process (24-48 hours at home) before using it with candles.",
  },
  {
    question: "What's your cancellation policy?",
    answer: "You can cancel up to 48 hours before the workshop for a full refund. For subscriptions, you can cancel anytime after the first month with no additional charges.",
  },
];

const galleryImages = [
  { src: "/images/vessel-100.png", alt: "Beautiful handcrafted concrete vessel" },
  { src: "/images/vessel-101.png", alt: "Elegant concrete vessel design" },
  { src: "/images/vessel-102.png", alt: "Stunning concrete creation" },
  { src: "/images/vessel-103.png", alt: "Workshop participant creation" },
  { src: "/images/vessel-104.png", alt: "Artistic concrete vessel" },
  { src: "/images/vessel-105.png", alt: "Custom concrete candle holder" },
];

export default function WorkshopSubscriptionPage() {
  const [selectedPackage, setSelectedPackage] = useState<WorkshopPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workshopDate: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleBooking = (pkg: WorkshopPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPackage) return;
    
    setIsSubmitting(true);

    try {
      // In production, first process payment through Stripe/PayPal
      // const paymentResult = await processStripePayment(formData, selectedPackage);
      
      // Then save booking to database
      const response = await fetch("/api/workshop-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          workshopDate: formData.workshopDate,
          packageType: selectedPackage.id,
          packagePrice: selectedPackage.price,
          cardNumber: formData.cardNumber.slice(-4), // Only store last 4 digits
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Success!
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        workshopDate: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
      });
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:to-stone-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        
        {/* Hero Header with Image Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Hero Content */}
          <div className="flex flex-col justify-center">
            <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 text-white rounded-3xl p-10 shadow-2xl">
              <div className="text-7xl mb-6 animate-bounce">🏺</div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
                Concrete Creations Workshop
              </h1>
              <p className="text-xl mb-4 font-medium leading-relaxed">
                ✨ Unleash Your Creativity!
              </p>
              <p className="text-lg mb-6 opacity-95 leading-relaxed">
                Transform ordinary cement into extraordinary art pieces. Create stunning, one-of-a-kind candle vessels with your own hands!
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border-2 border-white/40 mb-6">
                <p className="font-bold text-xl mb-2">🔥 Next Workshop</p>
                <p className="text-lg">April 15, 2026 | 2-4 PM</p>
                <p className="text-lg font-semibold">Only 12 Spots Available!</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-5xl font-bold">$65</div>
                <div className="text-lg opacity-90">per session<br/>All materials included!</div>
              </div>
            </div>
          </div>

          {/* Right: Image Gallery Grid */}
          <div className="grid grid-cols-2 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                  index === 0 || index === 5 ? 'row-span-2' : ''
                }`}
                style={{ 
                  minHeight: index === 0 || index === 5 ? '400px' : '190px'
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Package Card - Centered & Prominent */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-3 text-center">
            Reserve Your Creative Experience! 🎨
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Join us for an unforgettable hands-on workshop
          </p>
          
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="shadow-2xl border-4 border-orange-400 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 text-white p-8 text-center">
                <h3 className="text-3xl font-bold mb-3">{pkg.name}</h3>
                <div className="text-6xl font-bold my-4">
                  ${pkg.price}
                </div>
                <p className="text-xl opacity-95 mb-2">{pkg.description}</p>
                <Badge className="bg-white/30 text-white border-2 border-white/50 text-base px-4 py-1">
                  Everything Included!
                </Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 bg-amber-50 dark:bg-stone-800 p-4 rounded-lg">
                      <Check className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleBooking(pkg)}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-2xl py-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  🎨 Book Your Spot Now!
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workshop Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {workshopDetails.map((detail, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/30 dark:from-stone-900 dark:to-stone-800"
            >
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <detail.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-300 mb-2">{detail.label}</h3>
                <p className="text-sm text-muted-foreground">{detail.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="shadow-xl border-2 border-amber-200 mb-12">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-stone-800 dark:to-stone-700">
            <CardTitle className="text-3xl text-center text-amber-800 dark:text-amber-300">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-amber-200 last:border-0 pb-6 last:pb-0"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full text-left font-bold text-xl hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-stone-700 flex items-center justify-center flex-shrink-0 ml-4">
                      {openFaqIndex === index ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaqIndex === index ? "max-h-96 mt-4" : "max-h-0"
                    }`}
                  >
                    <p className="text-muted-foreground text-lg leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center bg-gradient-to-br from-stone-700 to-stone-800 text-white rounded-3xl p-10 shadow-2xl">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Creative? 🎨</h3>
          <p className="text-lg mb-6 opacity-90">Questions? We're here to help!</p>
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-6">
            <a 
              href="mailto:info@limenlakay.com" 
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-4 rounded-xl transition-all duration-200 text-lg font-medium"
            >
              📧 info@limenlakay.com
            </a>
            <a 
              href="tel:+15615930238" 
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-4 rounded-xl transition-all duration-200 text-lg font-medium"
            >
              📞 (561) 593-0238
            </a>
          </div>
          <p className="text-sm opacity-75">&copy; 2026 Concrete Creations Workshop. All rights reserved.</p>
        </footer>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPaymentModal(false);
          }}
        >
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-amber-800 dark:text-amber-300">
                    Complete Your Booking
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedPackage.name} - ${selectedPackage.price}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPaymentModal(false)}
                  className="hover:bg-destructive/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="workshopDate">Preferred Workshop Date</Label>
                  <select
                    id="workshopDate"
                    value={formData.workshopDate}
                    onChange={(e) => setFormData({ ...formData, workshopDate: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select a date</option>
                    <option value="april15">April 15, 2026 (2-4 PM)</option>
                    <option value="april22">April 22, 2026 (2-4 PM)</option>
                    <option value="april29">April 29, 2026 (2-4 PM)</option>
                    <option value="may6">May 6, 2026 (2-4 PM)</option>
                  </select>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <div className="flex gap-2 mt-2">
                    {["Visa", "MC", "Amex", "PayPal"].map((method) => (
                      <div
                        key={method}
                        className="px-3 py-1 bg-secondary rounded text-xs font-medium"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Complete Payment & Book Workshop"}
                </Button>

                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Your payment is secure and encrypted
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12 px-6">
              <div className="text-6xl mb-6 text-green-600 dark:text-green-400">✓</div>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4">
                Booking Confirmed!
              </h3>
              <p className="text-muted-foreground mb-4">
                Thank you for signing up for our workshop. We&apos;ve sent a confirmation email with all the details.
              </p>
              <div className="bg-amber-50 dark:bg-stone-800 p-4 rounded-lg mb-6">
                <p className="font-semibold mb-2">What&apos;s next?</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive a reminder email 3 days before the workshop with the exact address and what to bring.
                </p>
              </div>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                size="lg"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
