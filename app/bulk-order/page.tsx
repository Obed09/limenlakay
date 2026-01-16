import BulkOrderQuestionnaire from '@/components/bulk-order-questionnaire';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BulkOrderPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button asChild variant="outline" className="font-semibold text-base hover:bg-amber-50 dark:hover:bg-amber-950 mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>
      </div>
      <BulkOrderQuestionnaire />
    </div>
  );
}