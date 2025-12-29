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
  // Your actual workshop creations - save these images to public/images/
  { src: "/images/teal-gold-bowl.jpg", alt: "Stunning teal and gold concrete bowl - workshop creation" },
  { src: "/images/white-gold-vessel.jpg", alt: "Elegant white and gold textured vessel with lid" },
  { src: "/images/burgundy-vessel.jpg", alt: "Beautiful burgundy ribbed concrete vessel" },
  { src: "/images/teal-vessel-flowers.jpg", alt: "Teal vessel displayed with sunflower arrangement" },
  { src: "/images/burgundy-vessel-flowers.jpg", alt: "Burgundy vessel with beautiful floral display" },
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
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 dark:from-stone-950 dark:to-stone-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 dark:from-amber-800 dark:to-amber-950 text-white rounded-2xl p-10 shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
          <div className="text-6xl mb-4 animate-bounce">🏺</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Concrete Creations Workshop
          </h1>
          <p className="text-lg md:text-xl mb-4 max-w-3xl mx-auto font-medium">
            ✨ Unleash Your Creativity! Transform ordinary cement into extraordinary art pieces.
          </p>
          <p className="text-base md:text-lg mb-6 max-w-3xl mx-auto opacity-95">
            Discover the magic of working with your hands as you craft stunning, one-of-a-kind candle vessels. 
            Perfect for beginners - no experience needed, just bring your enthusiasm!
          </p>
          <div className="inline-block bg-white/30 backdrop-blur-sm rounded-lg px-6 py-3 border-2 border-white/40 shadow-lg">
            <p className="font-bold text-lg">
              🔥 Next Session: April 15, 2026 | 2-4 PM | Only 12 Spots Available!
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Workshop Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/50 dark:from-stone-900 dark:to-stone-800">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-800 dark:text-amber-300">
                  Workshop Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workshopDetails.map((detail, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <detail.icon className="w-5 h-5 text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-sm">{detail.label}:</span>
                      <p className="text-sm text-muted-foreground">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Image Gallery */}
            <Card className="mt-6 shadow-xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/50 dark:from-stone-900 dark:to-stone-800">
              <CardHeader>
                <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Real Creations from Our Workshop! 🎨
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  These beautiful vessels were handcrafted by participants just like you!
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.map((image, index) => (
                    <div key={index} className={`relative overflow-hidden rounded-lg border-3 border-amber-300 hover:border-orange-400 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl ${index >= 3 ? 'h-40' : 'h-32'} ${index === 4 ? 'col-span-2' : ''}`}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Options */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-2 text-center">
              Reserve Your Spot Now!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Join us for an unforgettable creative experience 🌟
            </p>
            <div className="max-w-md mx-auto">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-amber-300 hover:border-orange-400 transform hover:-translate-y-1"
                >
                  <CardHeader className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 text-white rounded-t-xl">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="text-4xl font-bold my-3">
                      ${pkg.price}
                      <span className="text-base font-normal opacity-90">{pkg.period}</span>
                    </div>
                    <CardDescription className="text-stone-200">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleBooking(pkg)}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      size="lg"
                    >
                      🎨 Book Your Spot Now!
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-amber-800 dark:text-amber-300">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-border last:border-0 pb-4 last:pb-0"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full text-left font-semibold text-lg hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaqIndex === index ? "max-h-96 mt-3" : "max-h-0"
                    }`}
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center bg-gradient-to-br from-stone-700 to-stone-800 text-white rounded-2xl p-8 shadow-lg">
          <p className="mb-4">&copy; 2026 Concrete Creations Workshop. All rights reserved.</p>
          <div className="space-y-2 text-sm opacity-90">
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:info@limenlakay.com" className="text-amber-300 hover:text-amber-200 underline">
                info@limenlakay.com
              </a>
              {" "}or call{" "}
              <a href="tel:+15615930238" className="text-amber-300 hover:text-amber-200 underline">
                (561) 593-0238
              </a>
            </p>
            <p>Visit us at limenlakay.com for more information</p>
          </div>
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
