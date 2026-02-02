"use client";
// Updated with Stripe payment integration

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from '@/components/site-footer';
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
  Mail,
  Loader2,
  ArrowLeft
} from "lucide-react";

interface WorkshopSession {
  id: string;
  session_date: string;
  session_time: string;
  meeting_link: string;
  max_participants: number;
  current_participants: number;
  status: string;
  registration_enabled?: boolean;
}

export default function WorkshopSubscriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [closedMessage, setClosedMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workshopDate: "",
  });

  useEffect(() => {
    fetchSessions();
    fetchRegistrationStatus();
  }, []);

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch("/api/workshop-booking/settings");
      const data = await response.json();
      if (data.settings) {
        setRegistrationEnabled(data.settings.registration_enabled);
        setClosedMessage(data.settings.closed_message || "Unfortunately, registration is closed at this time. Please check back for the next session.");
      }
    } catch (error) {
      console.error("Failed to fetch registration status:", error);
      // Default to open if there's an error
      setRegistrationEnabled(true);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/workshop-booking/sessions");
      const data = await response.json();
      
      // Filter for open sessions with registration enabled and sort by date
      const openSessions = (data.sessions || [])
        .filter((s: WorkshopSession) => 
          s.status === "open" && s.registration_enabled !== false
        )
        .sort((a: WorkshopSession, b: WorkshopSession) => 
          new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
        );
      
      setSessions(openSessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          packageType: "single",
          packagePrice: 120,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
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
              Concrete Pouring Class
            </h1>
            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              Learn the art of crafting beautiful cement candle vessels in our hands-on beginner workshop. 
              Transform raw materials into stunning home décor pieces you&apos;ll treasure.
            </p>
            <p className="text-2xl text-white font-semibold mb-8">
              Next Session: <span className="text-[#20b2aa]">Limited spots available — book your seat today!</span>
            </p>
            <Button
              asChild
              className="bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg px-8 py-6 rounded-lg font-semibold"
            >
              <a href="#book-now">Reserve Your Spot</a>
            </Button>
          </div>
        </div>
      </section>

      {/* What You'll Experience */}
      <section className="py-20 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            What You&apos;ll Experience
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Join our interactive live Zoom class and learn professional cement vessel pouring techniques from start to finish. Perfect for beginners and creative enthusiasts alike.
          </p>
        </div>
      </section>

      {/* Perfect for Beginners */}
      <section className="py-20 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
            Perfect for Beginners
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">
                No Experience Needed
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our workshop is specifically designed for those new to cement crafting. Step-by-step guidance ensures 
                you leave with a beautiful finished piece and newfound skills.
              </p>
              <div className="bg-[#20b2aa]/10 border-l-4 border-[#20b2aa] p-6 rounded-r-lg">
                <p className="text-[#20b2aa] text-xl font-bold mb-3">
                  🎁 Exclusive Workshop Bonus!
                </p>
                <p className="text-white text-lg leading-relaxed">
                  Every participant receives a comprehensive PDF take-home guide with detailed instructions, tips, and techniques to download at the end of the workshop. Keep creating masterpieces long after you leave!
                </p>
              </div>
              <p className="text-[#20b2aa] text-lg font-semibold">
                Plus: Get instant access to our digital resource library for ongoing inspiration!
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="aspect-square relative">
                <Image
                  src="/images/workshop cement vessel.jpeg"
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
      <section className="py-20 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Workshop Pricing
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Affordable, all-inclusive pricing for your creative journey
          </p>
          <div className="max-w-xl mx-auto">
            <Card className="bg-[#20b2aa] border-0 shadow-2xl">
              <CardContent className="p-10">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Single Workshop
                </h3>
                <div className="text-5xl font-bold text-white mb-6">
                  $120 <span className="text-xl font-normal">one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Step-by-step guidance</span>
                  </li>
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Bonus digital guide</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-white text-[#20b2aa] hover:bg-gray-100 text-lg py-6 font-bold"
                >
                  <a href="#book-now">Book Now</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Book Now Form */}
      <section id="book-now" className="py-20 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Book Your Workshop
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16">
            Complete the form below to reserve your spot
          </p>
          <div className="max-w-2xl mx-auto">
            {!registrationEnabled ? (
              <Card className="bg-[#233d4d] border-2 border-amber-500 shadow-2xl">
                <CardContent className="p-10 text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                      <UserCheck className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Registration Currently Closed
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {closedMessage}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 rounded-lg font-semibold"
                  >
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Return to Homepage
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
            <Card className="bg-[#233d4d] border-0 shadow-2xl">
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white mb-2 block">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white mb-2 block">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="workshopDate" className="text-white mb-2 block">
                          Workshop Date & Time
                        </Label>
                        <select
                          id="workshopDate"
                          value={formData.workshopDate}
                          onChange={(e) => setFormData({ ...formData, workshopDate: e.target.value })}
                          className="w-full bg-white/20 border border-white/30 text-white rounded-md px-3 py-2"
                          required
                          disabled={loadingSessions}
                        >
                          <option value="" className="text-gray-900">
                            {loadingSessions ? "Loading sessions..." : "Select a date & time"}
                          </option>
                          {sessions.map((session) => {
                            const date = new Date(session.session_date);
                            const formattedDate = date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                            const spotsLeft = session.max_participants - session.current_participants;
                            
                            return (
                              <option 
                                key={session.id} 
                                value={session.id} 
                                className="text-gray-900"
                              >
                                {formattedDate} at {session.session_time} - {spotsLeft} spots left
                              </option>
                            );
                          })}
                        </select>
                        {sessions.length === 0 && !loadingSessions && (
                          <p className="text-sm text-yellow-300 mt-2">
                            No sessions with registration open at the moment. Please check back later.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Payment Information
                    </h3>
                    <div className="bg-[#20b2aa]/20 border border-[#20b2aa]/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-6 w-6 text-[#20b2aa] mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Secure Payment with Stripe</h4>
                          <p className="text-sm text-gray-300 mb-2">
                            You'll be redirected to Stripe's secure checkout to complete your payment. 
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <div className="px-2 py-1 bg-white/20 rounded text-white text-xs font-semibold">VISA</div>
                            <div className="px-2 py-1 bg-white/20 rounded text-white text-xs font-semibold">Mastercard</div>
                            <div className="px-2 py-1 bg-white/20 rounded text-white text-xs font-semibold">AMEX</div>
                            <div className="px-2 py-1 bg-white/20 rounded text-white text-xs font-semibold">Discover</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg py-6 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Secure Checkout - $120
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </section>

      {/* Our Creations Gallery */}
      <section className="py-20 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Our Creations
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Explore the beautiful vessels crafted in our workshops
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              "/images/new vessel 4.jpeg",
              "/images/new vessel 9.jpeg",
              "/images/new vessels 10.png",
              "/images/blue empty vessel .jpeg",
            ].map((src, index) => (
              <div key={index} className="aspect-square relative bg-white rounded-lg overflow-hidden p-4">
                <Image
                  src={src}
                  alt={`Creation ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Location */}
      <section className="py-20 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Workshop Location
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Join from the comfort of your home
          </p>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="aspect-video relative">
                <Image
                  src="/images/workshop image.png"
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
      <section className="py-20 bg-[#1e3a47]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Everything you need to know about our workshop
          </p>
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
                  Wear comfortable clothes you don&apos;t mind getting a little dusty. Aprons are provided.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-2 border-[#20b2aa]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  What&apos;s the cancellation policy?
                </h3>
                <p className="text-gray-300">
                  Full refunds available up to 48 hours before your session. Rescheduling is always an option.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommended Materials */}
      <section className="py-20 bg-[#233d4d]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Recommended Materials
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                While we provide all essential supplies, these optional items can enhance your creative experience
              </p>
            </div>

            {/* Product Links */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-[#1e3a47] border-[#20b2aa]">
                <CardContent className="p-6 space-y-4">
                  <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">😷</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Safety First: Respirator Mask
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Dual-filtration respirator mask from AirGearPro provides reliable protection while working with concrete materials.
                  </p>
                  <a
                    href="https://a.co/d/hDJm06I"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#20b2aa] hover:bg-[#1a9e96]">
                      View on Amazon
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-[#1e3a47] border-[#20b2aa]">
                <CardContent className="p-6 space-y-4">
                  <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">🥣</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Norpro Silicone Bowl Set
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Perfect for mixing and preparing your concrete materials. Flexible, easy to clean, and durable for all your crafting needs.
                  </p>
                  <a
                    href="https://a.co/d/hMk4j9a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#20b2aa] hover:bg-[#1a9e96]">
                      View on Amazon
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-[#1e3a47] border-[#20b2aa]">
                <CardContent className="p-6 space-y-4">
                  <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">🧤</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Protective Vinyl Gloves
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Powder-free, latex-free synthetic vinyl exam gloves provide affordable yet reliable hand protection for your creative process.
                  </p>
                  <a
                    href="https://a.co/d/9EawD9T"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#20b2aa] hover:bg-[#1a9e96]">
                      View on Amazon
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Mold Options */}
            <div className="bg-[#1e3a47] rounded-lg p-8 border-2 border-[#20b2aa]">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Creative Mold Options
              </h3>
              <p className="text-gray-300 text-center mb-8">
                Explore these versatile silicone molds to expand your concrete crafting possibilities
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src="/images/silicone cooking spoons.png"
                      alt="Silicone cooking spoons molds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-white text-center">
                    Silicone Cooking Spoon
                  </h4>
                  <p className="text-sm text-gray-300 text-center">
                    Create decorative concrete spoons
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src="/images/silicone creative pot molds.png"
                      alt="Silicone creative pot molds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-white text-center">
                    Creative Pot Molds
                  </h4>
                  <p className="text-sm text-gray-300 text-center">
                    Design unique planters and vessels
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src="/images/silicone storage jar molds.png"
                      alt="Silicone storage jar molds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-white text-center">
                    Storage Jar Molds
                  </h4>
                  <p className="text-sm text-gray-300 text-center">
                    Craft beautiful storage containers
                  </p>
                </div>
              </div>
            </div>

            {/* Color Tip */}
            <div className="mt-8 text-center p-6 bg-[#20b2aa]/10 rounded-lg border-2 border-[#20b2aa]">
              <h4 className="text-xl font-bold text-white mb-3">
                ✨ Pro Tip: Add Your Personal Touch
              </h4>
              <p className="text-gray-300 text-lg">
                Want to customize your creation with vibrant colors? Pick up concrete pigments or acrylic paints at your local craft store! 
                We&apos;ll show you how to incorporate them beautifully into your designs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Book */}
      <section className="py-16 bg-[#1e3a47]">
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
            Join our next Concrete Pouring Class and discover the satisfaction of handcrafted artistry. 
            Limited spots ensure personalized attention for every participant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              className="bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg px-8 py-6 font-semibold"
            >
              <a href="#book-now">Reserve Your Spot</a>
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
      <SiteFooter />
    </div>
  );
}
