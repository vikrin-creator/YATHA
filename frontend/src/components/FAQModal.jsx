import { useState, useEffect } from 'react'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend'

function FAQModal({ isOpen, onClose }) {
  const [faqs, setFaqs] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchFAQs()
    }
  }, [isOpen])

  const fetchFAQs = async () => {
    try {
      console.log('Fetching FAQs from:', `${API_BASE_URL}/api/faqs`)
      const response = await fetch(`${API_BASE_URL}/api/faqs`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('FAQ response:', result)
      
      // Handle the Response::success wrapped format
      if (result.success && result.data && Array.isArray(result.data)) {
        setFaqs(result.data)
      } else if (Array.isArray(result)) {
        setFaqs(result)
      } else if (Array.isArray(result.data)) {
        setFaqs(result.data)
      } else {
        console.warn('Unexpected FAQ data format:', result)
        setFaqs([])
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-[#111518]">Frequently Asked Questions</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-neutral-grey">Loading FAQs...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-neutral-grey">No FAQs available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-semibold text-[#111518] group-hover:text-primary text-left">
                        {faq.question}
                      </span>
                      <span className={`material-symbols-outlined text-lg transition-transform ml-2 flex-shrink-0 text-primary ${
                        expandedId === faq.id ? 'rotate-180' : ''
                      }`}>
                        expand_more
                      </span>
                    </button>

                    {expandedId === faq.id && (
                      <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
                        <p className="text-sm text-neutral-grey leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-bold hover:bg-[#1873B8]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FAQModal
