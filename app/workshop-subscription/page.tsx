"use client";
// Created from design slides - December 29, 2025

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Users, 
  Calendar,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Phone,
  Mail
} from "lucide-react";

export default function WorkshopSubscriptionPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workshopDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/workshop-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          packageType: "single",
          packagePrice: 100,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      alert("Booking confirmed! Check your email for details.");
      setShowBookingModal(false);
      setFormData({ name: "", email: "", phone: "", workshopDate: "" });
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a47]">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/workshop scene.png"
            alt="Concrete vessels"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Concrete Creations Workshop
            </h1>
            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              Learn the art of crafting beautiful cement candle vessels in our hands-on beginner workshop. 
              Transform raw materials into stunning home décor pieces you'll treasure.
            </p>
            <p className="text-2xl text-white font-semibold mb-8">
              Next Session: <span className="text-[#20b2aa]">Limited spots available — book your seat today!</span>
            </p>
            <Button
              onClick={() => setShowBookingModal(true)}
              className="bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg px-8 py-6 rounded-lg font-semibold"
            >
              Reserve Your Spot
            </Button>
          </div>
        </div>
      </section>

      {/* What You'll Experience */}
      <section className="py-16 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            What You'll Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <Clock className="w-16 h-16 text-[#20b2aa] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                2.5 Hours of Creating
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Immerse yourself in a relaxed, guided session where you'll learn techniques from start to finish.
              </p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 text-[#20b2aa] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Small Group Setting
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Enjoy personalized attention with intimate class sizes designed for hands-on learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect for Beginners */}
      <section className="py-16 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Perfect for Beginners
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                No Experience Needed
              </h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Our workshop is specifically designed for those new to cement crafting. Step-by-step guidance ensures 
                you leave with a beautiful finished piece and newfound skills.
              </p>
              <p className="text-[#20b2aa] text-lg font-semibold">
                Bonus: Every participant receives a digital guide to continue creating at home!
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="aspect-square relative">
                <Image
                  src="/images/workshop image.png"
                  alt="Workshop participant"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Pricing */}
      <section className="py-16 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Workshop Pricing
          </h2>
          <p className="text-gray-300 text-center mb-12">
            Simple, transparent pricing with everything included.
          </p>
          <div className="max-w-xl mx-auto">
            <Card className="bg-[#20b2aa] border-0">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Single Workshop
                </h3>
                <div className="text-5xl font-bold text-white mb-6">
                  $100 <span className="text-xl font-normal">one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>2.5-hour hands-on session</span>
                  </li>
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>All materials provided</span>
                  </li>
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Take home your creation</span>
                  </li>
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Bonus digital guide</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-white text-[#20b2aa] hover:bg-gray-100 text-lg py-6 font-bold"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Creations Gallery */}
      <section className="py-16 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Our Creations
          </h2>
          <p className="text-gray-300 text-center mb-12">
            Explore the beautiful vessels crafted in our workshops.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              "/images/vessel-100.png",
              "/images/vessel-101.png",
              "/images/IMG-20251015-WA0008.jpg",
              "/images/new vessel 6.jpeg",
            ].map((src, index) => (
              <div key={index} className="aspect-square relative bg-white rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={`Creation ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Location */}
      <section className="py-16 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Workshop Location
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="aspect-video relative">
                <Image
                  src="/images/IMG-20251015-WA0011.jpg"
                  alt="Workshop studio"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Join our live stream workshop from anywhere
              </h3>
              <p className="text-gray-300 mb-6">
                link will be provided upon registration
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#20b2aa]" />
                  <div>
                    <p className="text-[#20b2aa] font-semibold">Contact:</p>
                    <a href="mailto:info@limenlakay.com" className="text-white hover:text-[#20b2aa]">
                      info@limenlakay.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-[#20b2aa]" />
                  <div>
                    <p className="text-[#20b2aa] font-semibold">Phone:</p>
                    <a href="tel:5615930238" className="text-white hover:text-[#20b2aa]">
                      561-593-0238
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="bg-transparent border-2 border-[#20b2aa]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Is this workshop suitable for beginners?
                </h3>
                <p className="text-gray-300">
                  Absolutely! No prior experience is needed. Our instructors guide you through every step.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-2 border-[#20b2aa]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  What should I wear?
                </h3>
                <p className="text-gray-300">
                  Wear comfortable clothes you don't mind getting a little dusty. Aprons are provided.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-2 border-[#20b2aa]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  Can I take my vessel home?
                </h3>
                <p className="text-gray-300">
                  Yes! Your finished creation is yours to keep. We'll package it safely for transport.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-2 border-[#20b2aa]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  What's the cancellation policy?
                </h3>
                <p className="text-gray-300">
                  Full refunds available up to 48 hours before your session. Rescheduling is always an option.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Book */}
      <section className="py-16 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            How to Book
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Date</h3>
              <p className="text-gray-300 text-sm">Choose your preferred workshop session</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Complete Your Info</h3>
              <p className="text-gray-300 text-sm">Provide name, email, and phone number</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Payment</h3>
              <p className="text-gray-300 text-sm">Pay via card or Zelle</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmation</h3>
              <p className="text-gray-300 text-sm">Receive your booking details instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Payment Options
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Credit/Debit Card
                </h3>
                <p className="text-gray-300">
                  Secure online payment with all major cards accepted. Your information is protected with 
                  industry-standard encryption.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Zelle
                </h3>
                <p className="text-gray-300 mb-4">
                  Send payment directly to:
                </p>
                <p className="text-[#20b2aa] font-bold text-lg mb-4">
                  limenlakayllc@gmail.com
                </p>
                <p className="text-gray-300 text-sm">
                  Include your name and workshop date in the memo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-[#233d4d]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Create?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join our next Concrete Creations Workshop and discover the satisfaction of handcrafted artistry. 
            Limited spots ensure personalized attention for every participant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => setShowBookingModal(true)}
              className="bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg px-8 py-6 font-semibold"
            >
              Reserve Your Spot
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#20b2aa] text-[#20b2aa] hover:bg-[#20b2aa] hover:text-white text-lg px-8 py-6 font-semibold"
            >
              <a href="tel:5615930238">Call Us</a>
            </Button>
          </div>
          <div className="border-t border-gray-600 pt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Limen Lakay LLC</h3>
            <p className="text-gray-300">
              Email: <a href="mailto:info@limenlakay.com" className="text-[#20b2aa] hover:underline">info@limenlakay.com</a> | 
              Phone: <a href="tel:5615930238" className="text-[#20b2aa] hover:underline">561-593-0238</a>
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookingModal(false);
          }}
        >
          <Card className="w-full max-w-md bg-white">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-[#1e3a47] mb-6">
                Book Your Workshop
              </h3>
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
                  <Label htmlFor="workshopDate">Select Workshop Date</Label>
                  <select
                    id="workshopDate"
                    value={formData.workshopDate}
                    onChange={(e) => setFormData({ ...formData, workshopDate: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="">Choose a date</option>
                    <option value="january15">January 15, 2026</option>
                    <option value="january22">January 22, 2026</option>
                    <option value="january29">January 29, 2026</option>
                  </select>
                </div>
                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#20b2aa] hover:bg-[#1a9988] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Continue to Payment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
