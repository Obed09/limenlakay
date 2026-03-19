import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-5 py-12">
        <Link href="/" className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-8">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Limen Lakay&apos;s website and services, you accept and agree to be bound by 
              these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Products and Services</h2>
            <p>
              Limen Lakay offers handcrafted candles and related products. All products are made to order 
              and may have slight variations due to their handmade nature.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product colors, scents, and appearance may vary slightly from images</li>
              <li>We reserve the right to limit quantities and discontinue products</li>
              <li>All prices are subject to change without notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. Orders and Payment</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3.1 Standard Orders</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All orders are subject to acceptance and availability</li>
              <li>Payment is required at the time of order</li>
              <li>We accept major credit cards and other payment methods as displayed</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-4">3.2 Bulk Orders</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bulk orders (50+ units) require a 50% non-refundable deposit to begin production</li>
              <li>Remaining 50% is due upon completion before shipping</li>
              <li>Standard lead time is 2 months from deposit receipt</li>
              <li>Rush orders may be available for additional fees</li>
              <li>Changes after production begins may incur additional charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Custom Orders</h2>
            <p>Custom and personalized orders:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Are final sale and non-refundable</li>
              <li>Cannot be canceled once production has begun</li>
              <li>Require detailed specifications provided by the customer</li>
              <li>May take 2-8 weeks depending on complexity and quantity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Shipping costs are calculated at checkout based on weight and destination</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery to the carrier</li>
              <li>International orders may be subject to customs fees and import duties</li>
              <li>Customer is responsible for providing accurate shipping information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Returns and Refunds</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6.1 Standard Products</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Returns accepted within 14 days of delivery for unused, unopened products</li>
              <li>Customer responsible for return shipping costs</li>
              <li>Refunds issued to original payment method within 5-10 business days</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-4">6.2 Custom/Bulk Orders</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Custom and bulk orders are final sale</li>
              <li>Deposits are non-refundable</li>
              <li>No returns or exchanges except for defective products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Damaged or Defective Products</h2>
            <p>
              If you receive a damaged or defective product:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact us within 48 hours of delivery with photos of the damage</li>
              <li>We will replace the product or issue a refund at our discretion</li>
              <li>Claims made after 48 hours may not be honored</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Safety and Usage</h2>
            <p>
              Customers are responsible for safe candle usage:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Never leave burning candles unattended</li>
              <li>Keep away from flammable materials, children, and pets</li>
              <li>Follow all safety instructions provided with products</li>
              <li>Limen Lakay is not liable for misuse or accidents</li>
            </ul>
          </section>

          <section id="copyright">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. Intellectual Property &amp; Copyright</h2>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.1 Copyright &amp; Intellectual Property</h3>
            <p className="mb-3">
              All content on LimenLakay.com, including but not limited to the following, is the exclusive property of
              Limen Lakay LLC and is protected by United States and international copyright laws:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Product photographs</li>
              <li>Candle designs</li>
              <li>Vessel designs</li>
              <li>Brand logos and trademarks</li>
              <li>Marketing materials</li>
              <li>Product descriptions</li>
              <li>Videos and graphics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.2 Prohibited Uses</h3>
            <p className="mb-3">You may <strong>not</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Download, copy, or reproduce our images for any purpose</li>
              <li>Use our content on social media without written permission</li>
              <li>Claim our designs or images as your own</li>
              <li>Use our content for commercial purposes</li>
              <li>Modify, crop, or edit our images</li>
              <li>Remove any watermarks or copyright notices from our content</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.3 Authorized Use</h3>
            <p className="mb-3">You <strong>may</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Share posts directly from our official social media accounts with full credit attributed to Limen Lakay</li>
              <li>Link to our website with proper attribution</li>
              <li>Use our content for press or media purposes with prior written permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.4 DMCA Violations</h3>
            <p className="mb-3">Unauthorized use of our intellectual property will result in:</p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>A formal DMCA takedown notice</li>
              <li>A demand for removal within 24 hours</li>
              <li>Legal action for copyright infringement</li>
              <li>Reporting to applicable platforms and authorities</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.5 How to Request Permission</h3>
            <p className="mb-2">
              To request permission to use our content, email{' '}
              <a href="mailto:info@limenlakay.com" className="text-amber-600 dark:text-amber-400 hover:underline">info@limenlakay.com</a>{' '}
              with the subject line <strong>&quot;Image Use Permission Request&quot;</strong> and include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your name and business</li>
              <li>Intended use of the content</li>
              <li>Platform or medium where it will be used</li>
              <li>Requested duration of use</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9.6 Reporting Infringement</h3>
            <p>
              If you believe our intellectual property has been infringed, please report it by emailing{' '}
              <a href="mailto:info@limenlakay.com" className="text-amber-600 dark:text-amber-400 hover:underline">info@limenlakay.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. Limitation of Liability</h2>
            <p>
              Limen Lakay LLC is not liable for any indirect, incidental, or consequential damages arising 
              from the use of our products or services. Our liability is limited to the purchase price of 
              the product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">11. Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Florida, United States. Any disputes 
              shall be resolved in the courts of Palm Beach County, Florida.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be posted on this page 
              with an updated &quot;Last Updated&quot; date. Continued use of our services constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms and Conditions, please contact:
            </p>
            <p className="mt-2">
              <strong>Limen Lakay LLC</strong><br />
              Email: info@limenlakay.com<br />
              Phone: +1 561 593 0238
            </p>
          </section>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-12 pt-6 border-t">
            Last Updated: March 19, 2026
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
