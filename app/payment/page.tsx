export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💳 Payment Methods
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose your preferred payment method
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Zelle Payment */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-purple-300 dark:border-purple-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                Zelle
              </h2>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <span className="text-3xl">⚡</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold mb-2">
                  Send payment to:
                </p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100 break-all">
                  LIMENLAKAYLLC@GMAIL.COM
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Instant transfer</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>No fees</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Available 24/7</span>
                </p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-yellow-800 dark:text-yellow-200">Note:</strong> Please include your order number in the payment notes.
                </p>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-blue-300 dark:border-blue-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Bank Transfer
              </h2>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <span className="text-3xl">🏦</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-3">
                  Bank details available upon request
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact us for wire transfer information
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Secure transfers</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Large orders welcome</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">ℹ</span>
                  <span>1-3 business days processing</span>
                </p>
              </div>
            </div>
          </div>

          {/* Crypto (Coming Soon) */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-orange-300 dark:border-orange-700 shadow-xl opacity-75">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Cryptocurrency
              </h2>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <span className="text-3xl">₿</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2">
                  Coming Soon
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll soon accept Bitcoin, Ethereum, and other cryptocurrencies
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>BTC, ETH, USDC</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Instant confirmation</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Global payments</span>
                </p>
              </div>
            </div>
          </div>

          {/* Credit/Debit Cards (Coming Soon) */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-green-300 dark:border-green-700 shadow-xl opacity-75">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Credit/Debit Cards
              </h2>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <span className="text-3xl">💳</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                  Coming Soon
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Accept all major credit and debit cards
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Visa, Mastercard, Amex</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Secure checkout</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Instant processing</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            📋 Payment Instructions
          </h3>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Select your payment method</p>
                <p className="text-sm">Choose from Zelle (instant) or Bank Transfer</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Complete your order</p>
                <p className="text-sm">Fill out the bulk order form or contact us with your requirements</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Send payment</p>
                <p className="text-sm">Use the payment details above. Include your order number in the notes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Confirmation</p>
                <p className="text-sm">You'll receive a confirmation email once payment is received</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Questions about payment? Contact us:
          </p>
          <a 
            href="mailto:limenlakayllc@gmail.com" 
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline text-lg"
          >
            limenlakayllc@gmail.com
          </a>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <a 
            href="/"
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
