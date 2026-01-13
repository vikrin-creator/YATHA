import { useState } from 'react'

function TermsOfService() {
  const [activeSection, setActiveSection] = useState(null)

  const sections = [
    {
      id: 1,
      title: "About YATHA",
      content: "This website is operated by YATHA (\"YATHA,\" \"we,\" \"us,\" or \"our\"). We provide natural wellness products through our Shopify-hosted online store.\n\nThese Terms apply to all visitors, customers, and users of our website."
    },
    {
      id: 2,
      title: "Eligibility",
      content: "By using our website, you confirm that you are at least the age of majority in your state or have legal parental or guardian consent to use this site.\n\nYou agree not to use our products or services for any unlawful or unauthorized purpose."
    },
    {
      id: 3,
      title: "Orders & Acceptance",
      content: "All orders are subject to acceptance and availability. We reserve the right to refuse, cancel, or limit any order for any reason, including pricing errors, suspected fraud, or inventory limitations.\n\nOnce an order is placed, you agree to provide accurate and complete billing and shipping information."
    },
    {
      id: 4,
      title: "Pricing & Product Information",
      content: "All prices and product descriptions are subject to change without notice.\n\nWe make reasonable efforts to display product images and descriptions accurately, but we do not guarantee that your screen will reflect the true color, texture, or appearance of the product."
    },
    {
      id: 5,
      title: "Shipping, Returns & Cancellations",
      content: "All purchases are governed by our Shipping & Returns Policy, which is incorporated into these Terms by reference.\n\nBy placing an order, you agree to the timelines, eligibility requirements, refund limitations, and responsibilities stated in that policy."
    },
    {
      id: 6,
      title: "Use of Website",
      content: "You agree not to:\n• Violate any laws or regulations\n• Interfere with the security or functionality of the website\n• Attempt to access or misuse data belonging to others\n• Use our content, branding, or materials without written permission\n\nWe reserve the right to suspend or terminate access for violations."
    },
    {
      id: 7,
      title: "Intellectual Property",
      content: "All content on this website—including logos, product names, images, text, and designs—is the exclusive property of YATHA and may not be copied, reproduced, or distributed without prior written consent."
    },
    {
      id: 8,
      title: "User Submissions",
      content: "If you submit reviews, comments, suggestions, or other content, you grant YATHA a royalty-free, perpetual license to use, display, and publish that content in any format.\n\nYou confirm that your submissions do not violate any third-party rights or laws."
    },
    {
      id: 9,
      title: "Health & Wellness Disclaimer",
      content: "YATHA products are intended to support general wellness. They are not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare professional before using any dietary or wellness product."
    },
    {
      id: 10,
      title: "Disclaimer of Warranties",
      content: "All products and services are provided \"as is\" and \"as available.\"\n\nYATHA makes no warranties, express or implied, regarding product performance, merchantability, or fitness for a particular purpose."
    },
    {
      id: 11,
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by law, YATHA shall not be liable for any indirect, incidental, consequential, or special damages arising from your use of the website or products, including but not limited to loss of profits, data, or health-related outcomes."
    },
    {
      id: 12,
      title: "Indemnification",
      content: "You agree to indemnify and hold harmless YATHA from any claims, damages, or expenses resulting from your breach of these Terms or misuse of our products or website."
    },
    {
      id: 13,
      title: "Termination",
      content: "We may suspend or terminate your access to the website at any time if we believe you have violated these Terms."
    },
    {
      id: 14,
      title: "Governing Law",
      content: "These Terms shall be governed by and interpreted under the laws of the United States."
    },
    {
      id: 15,
      title: "Updates to These Terms",
      content: "We may update these Terms from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised Terms."
    },
    {
      id: 16,
      title: "Contact Information",
      content: "For any questions about these Terms, please contact us at:\n📧 support@yatha.com"
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
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Terms & Conditions</h1>
          <p className="text-sm text-white/90 mb-0.5">Please read carefully</p>
          <p className="text-xs text-white/75">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Intro Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border-l-4 border-primary">
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed mb-2">
            Welcome to YATHA. These Terms of Service ("Terms") govern your access to and use of our website, products, and services. By visiting, browsing, or purchasing from our site, you agree to be bound by these Terms and all policies referenced herein.
          </p>
          <p className="text-neutral-grey text-sm md:text-base leading-relaxed">
            If you do not agree, please do not use our website.
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
          <h3 className="text-lg font-bold text-[#111518] mb-2">Questions About Our Terms?</h3>
          <p className="text-neutral-grey text-sm mb-3">
            We're happy to clarify any aspect of our Terms of Service. Get in touch with our team anytime.
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

export default TermsOfService
