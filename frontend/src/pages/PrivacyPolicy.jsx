import { useState } from 'react'

function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null)

  const sections = [
    {
      id: 1,
      title: "Information We Collect",
      subsections: [
        {
          title: "a. Information You Provide",
          content: "When you make a purchase, create an account, sign up for emails, or contact us, we may collect:\n• Name\n• Email address\n• Phone number\n• Billing and shipping address\n• Payment information (processed securely by third-party providers)\n• Order history and customer service communications"
        },
        {
          title: "b. Automatically Collected Information",
          content: "When you browse our website, we may automatically collect:\n• IP address\n• Browser and device information\n• Pages visited and time spent\n• Cookies and tracking technologies"
        }
      ]
    },
    {
      id: 2,
      title: "How We Use Your Information",
      content: "We use your information to:\n• Process and fulfill orders\n• Provide customer support\n• Send order confirmations and updates\n• Improve our website and products\n• Send marketing emails (you may unsubscribe at any time)\n• Detect and prevent fraud"
    },
    {
      id: 3,
      title: "How We Share Information",
      content: "We do not sell your personal information.\n\nWe may share your information with trusted third parties who help us operate our business, including:\n• Shopify (e-commerce platform)\n• Payment processors (e.g., Stripe, PayPal)\n• Shipping carriers\n• Email and marketing platforms\n\nThese providers are only permitted to use your information to perform services for YATHA."
    },
    {
      id: 4,
      title: "Cookies & Tracking",
      content: "We use cookies and similar technologies to:\n• Remember your preferences\n• Analyze site traffic\n• Improve your shopping experience\n\nYou can control cookies through your browser settings."
    },
    {
      id: 5,
      title: "Data Security",
      content: "We take reasonable steps to protect your personal information using administrative, technical, and physical safeguards. However, no system is completely secure and we cannot guarantee absolute security."
    },
    {
      id: 6,
      title: "Your Rights",
      content: "Depending on your location, you may have the right to:\n• Access your personal data\n• Request correction or deletion\n• Opt out of marketing communications\n\nTo make a request, please email support@yatha.com."
    },
    {
      id: 7,
      title: "Children's Privacy",
      content: "Our website is not intended for children under 13. We do not knowingly collect personal information from children."
    },
    {
      id: 8,
      title: "Third-Party Links",
      content: "Our website may contain links to third-party sites. We are not responsible for their privacy practices."
    },
    {
      id: 9,
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date."
    },
    {
      id: 10,
      title: "Contact Us",
      content: "If you have questions about this Privacy Policy or your data, contact us at:\n📧 support@yatha.com"
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
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Privacy Policy</h1>
          <p className="text-sm text-white/90 mb-0.5">Your privacy matters to us</p>
          <p className="text-xs text-white/75">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Intro Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border-l-4 border-primary">
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed mb-2">
            YATHA ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or make a purchase from our website.
          </p>
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed">
            By using our website, you agree to the practices described in this Privacy Policy.
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
                  {section.subsections ? (
                    <div className="space-y-3">
                      {section.subsections.map((subsection, idx) => (
                        <div key={idx}>
                          <h3 className="font-semibold text-[#111518] mb-2 text-sm">{subsection.title}</h3>
                          <p className="text-neutral-grey whitespace-pre-line leading-relaxed text-xs md:text-sm">
                            {subsection.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-grey whitespace-pre-line leading-relaxed text-xs md:text-sm">
                      {section.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-6 bg-gradient-to-r from-primary/10 via-wellness-purple/10 to-primary/10 rounded-lg p-5 border border-primary/20">
          <h3 className="text-lg font-bold text-[#111518] mb-2">Need More Information?</h3>
          <p className="text-neutral-grey text-sm mb-3">
            If you have any questions about our privacy practices or need to exercise your rights, don't hesitate to reach out.
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

export default PrivacyPolicy
