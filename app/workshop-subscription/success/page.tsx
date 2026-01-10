"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Mail } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Optionally verify the session
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e3a47] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e3a47] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-[#233d4d] border-0">
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your workshop spot has been reserved!
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-2xl font-semibold text-white mb-4">What's Next?</h2>
            <div className="space-y-4 text-gray-200">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-[#20b2aa] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Check Your Email</p>
                  <p className="text-sm">We've sent you a confirmation with all the workshop details and Zoom link.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-[#20b2aa] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Mark Your Calendar</p>
                  <p className="text-sm">Add the workshop to your calendar so you don't miss it!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#20b2aa] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Prepare Your Materials</p>
                  <p className="text-sm">Check your email for the materials list to have everything ready.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-[#20b2aa] hover:bg-[#1a9988] text-white text-lg py-6">
                Return to Home
              </Button>
            </Link>
            <Link href="/workshop-subscription">
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 py-6">
                Book Another Session
              </Button>
            </Link>
          </div>

          {sessionId && (
            <p className="text-sm text-gray-400 mt-6">
              Session ID: {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkshopSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e3a47] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
