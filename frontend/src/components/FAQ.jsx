import { useState, useEffect } from 'react'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend'

function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faqs`)
      if (!response.ok) throw new Error('Failed to fetch FAQs')
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="py-6 text-center">
        <p className="text-neutral-grey">Loading FAQs...</p>
      </div>
    )
  }

  if (faqs.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-neutral-grey">No FAQs available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="border-b border-gray-300 pb-3">
          <button
            onClick={() => toggleFAQ(faq.id)}
            className="w-full flex items-center justify-between py-2 hover:text-primary transition-colors group"
          >
            <span className="text-sm font-semibold text-[#111518] group-hover:text-primary text-left">
              {faq.question}
            </span>
            <span className={`material-symbols-outlined text-lg transition-transform ml-2 flex-shrink-0 ${
              expandedId === faq.id ? 'rotate-180' : ''
            }`}>
              expand_more
            </span>
          </button>

          {expandedId === faq.id && (
            <div className="pt-2 pb-3 text-sm text-neutral-grey leading-relaxed animate-in fade-in duration-200">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default FAQ
