import { useState } from 'react'

function RefundPolicy() {
  const [activeSection, setActiveSection] = useState(null)

  const sections = [
    {
      id: 1,
      title: "Return Eligibility",
      content: "Products may be returned within 30 days of delivery if they meet the following conditions:\n• The product is unopened and unused\n• The product is in its original, resalable packaging\n• The product has not been damaged, altered, or tampered with\n\nFor health and safety reasons, we cannot accept returns on opened, used, or damaged products."
    },
    {
      id: 2,
      title: "How to Start a Return",
      content: "To initiate a return, please email support@yatha.com and include:\n• Your order number\n• The item(s) you wish to return\n\nYou will receive return instructions after your request is approved. Returns sent without authorization may not be accepted."
    },
    {
      id: 3,
      title: "Refunds",
      content: "Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.\n\nIf approved, refunds will be issued to your original payment method for the purchase price of the product(s) only.\n• Shipping and handling charges are non-refundable\n• Refunds typically process within 5–10 business days, depending on your payment provider"
    },
    {
      id: 4,
      title: "Exchanges",
      content: "We only replace items if they are defective, damaged, or incorrect.\n\nPlease contact support@yatha.com within 5 days of delivery if there is an issue with your order."
    },
    {
      id: 5,
      title: "Cancellations",
      content: "Orders may be canceled for a full refund before shipment.\n\nOnce an order has shipped, it must follow the standard return process."
    },
    {
      id: 6,
      title: "Wholesale & Bulk Orders",
      content: "Large or wholesale purchases may be subject to a restocking fee and different return eligibility. Please contact us before returning any bulk orders."
    },
    {
      id: 7,
      title: "Return Shipping Responsibility",
      content: "Customers are responsible for return shipping costs unless the return is due to a YATHA error. We recommend using a tracked and insured shipping service, as YATHA is not responsible for packages lost in transit."
    },
    {
      id: 8,
      title: "Final Sale Items",
      content: "Items marked Final Sale are not eligible for return or refund."
    },
    {
      id: 9,
      title: "Contact Us",
      content: "For refund or return questions, please contact:\n📧 support@yatha.com"
    }
  ]

  return (
    <div className="min-h-screen bg-organic-beige">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-wellness-purple text-white py-4 md:py-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Refund Policy</h1>
          <p className="text-sm text-white/90 mb-0.5">Your satisfaction is our priority</p>
          <p className="text-xs text-white/75">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Intro Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border-l-4 border-primary">
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed mb-2">
            At YATHA, your satisfaction matters to us. We stand behind the quality of our products and want you to feel confident in every purchase. This Refund Policy explains how refunds, returns, and exchanges are handled.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-background-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-wellness-purple flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {section.id}
                  </div>
                  <h2 className="text-base font-bold text-[#111518] text-left">{section.title}</h2>
                </div>
                <svg
                  className={`w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0 ${
                    activeSection === section.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {activeSection === section.id && (
                <div className="px-5 py-4 border-t border-neutral-grey/10 bg-white/50">
                  <p className="text-neutral-grey whitespace-pre-line leading-relaxed text-xs md:text-sm">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-6 bg-gradient-to-r from-primary/10 via-wellness-purple/10 to-primary/10 rounded-lg p-5 border border-primary/20">
          <h3 className="text-lg font-bold text-[#111518] mb-2">Questions About Returns?</h3>
          <p className="text-neutral-grey text-sm mb-3">
            We're here to help! If you have any questions about our refund or return process, reach out to our support team.
          </p>
          <a
            href="mailto:support@yatha.com"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-6 text-neutral-grey text-xs">
          <p>Last Updated: January 12, 2026</p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="relative h-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent"></div>
      </div>
    </div>
  )
}

export default RefundPolicy
