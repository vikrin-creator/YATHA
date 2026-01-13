import { useState } from 'react'

function ShippingPolicy() {
  const [activeSection, setActiveSection] = useState(null)

  const sections = [
    {
      id: 1,
      title: "Shipping",
      content: "All orders placed before 10:00 AM Central Time (CT) will be processed and shipped on the same business day. Orders placed after this time will be processed and shipped on the following business day. While we strive to ship all orders as quickly as possible, same-day shipping is not guaranteed.\n\nOrders are shipped via USPS or FedEx, unless otherwise specified at checkout. Expedited shipping options may be available for purchase.\n\nAt this time, YATHA ships only within the United States."
    },
    {
      id: 2,
      title: "Returns",
      content: "To initiate a return, customers must first contact support@yatha.com and include their order number. Return instructions will be provided upon approval.\n\nUnopened and unused products may be returned within 30 days of delivery. Products must be in their original, unopened, and resalable condition. For health and safety reasons, products that have been opened, used, tampered with, or have damaged packaging are not eligible for return.\n\nUpon receipt and inspection of returned products, YATHA will issue a refund for the purchase price of the product(s) only. Shipping and handling charges are non-refundable."
    },
    {
      id: 3,
      title: "Order Cancellations",
      content: "Orders may be canceled prior to shipment for a full refund. Once an order has shipped, it may not be canceled but may be returned in accordance with this policy."
    },
    {
      id: 4,
      title: "Exchanges",
      content: "Products may be exchanged only if they meet the return eligibility requirements listed above. Customers are responsible for return shipping costs. YATHA will ship the replacement product at no additional charge."
    },
    {
      id: 5,
      title: "Wholesale & Bulk Orders",
      content: "Returns of bulk or wholesale orders may be subject to a restocking fee. Please contact YATHA prior to placing or returning bulk orders for applicable terms."
    },
    {
      id: 6,
      title: "Return Shipping Responsibility",
      content: "Customers are responsible for all returned merchandise until it is received by YATHA. We strongly recommend using a shipping service that provides tracking and insurance. YATHA is not responsible for packages lost, damaged, or delayed during return transit."
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
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Shipping & Returns Policy</h1>
          <p className="text-sm text-white/90 mb-0.5">Fast shipping and easy returns</p>
          <p className="text-xs text-white/75">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Intro Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border-l-4 border-primary">
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed">
            We're committed to getting your order to you quickly and safely. This policy outlines our shipping procedures, return eligibility, and your responsibilities as a customer.
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
          <h3 className="text-lg font-bold text-[#111518] mb-2">Need Shipping or Return Help?</h3>
          <p className="text-neutral-grey text-sm mb-3">
            Our team is ready to assist you with any shipping or return questions. Don't hesitate to reach out!
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

export default ShippingPolicy
