import { useState, useEffect } from 'react'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend'

function FAQManagement() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0
  })
  const [showForm, setShowForm] = useState(false)

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs()
  }, [])

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
      alert('Failed to load FAQs: ' + error.message)
      setFaqs([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = getToken()
      if (!token) {
        alert('Please login to manage FAQs')
        return
      }

      if (editingId) {
        // Update FAQ
        console.log('Updating FAQ:', editingId, formData)
        const response = await fetch(`${API_BASE_URL}/api/faqs/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()
        console.log('Update response:', result)

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update FAQ')
        }

        alert('FAQ updated successfully')
      } else {
        // Create FAQ
        console.log('Creating FAQ:', formData)
        const response = await fetch(`${API_BASE_URL}/api/faqs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()
        console.log('Create response:', result)

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create FAQ')
        }

        alert('FAQ created successfully')
      }

      // Reset form
      setFormData({ question: '', answer: '', display_order: 0 })
      setEditingId(null)
      setShowForm(false)
      fetchFAQs()
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order
    })
    setEditingId(faq.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    try {
      const token = getToken()
      if (!token) {
        alert('Please login to manage FAQs')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      alert('FAQ deleted successfully')
      fetchFAQs()
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  const handleCancel = () => {
    setFormData({ question: '', answer: '', display_order: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#111518]">FAQ Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-bold hover:bg-[#1873B8]/90 transition-colors w-full md:w-auto"
          >
            Add New FAQ
          </button>
        )}
      </div>

      {/* FAQ Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-[#111518] mb-4">
            {editingId ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Question *
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1873B8]"
                placeholder="Enter FAQ question"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Answer *
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1873B8] resize-none"
                placeholder="Enter FAQ answer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1873B8]"
                placeholder="Order of appearance (0 = first)"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-bold hover:bg-[#1873B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : editingId ? 'Update FAQ' : 'Create FAQ'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-[#111518] rounded-lg font-bold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {faqs.length === 0 ? (
          <div className="p-8 text-center text-neutral-grey">
            <p className="text-lg">No FAQs found. Create your first FAQ to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518]">Order</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518]">Question</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518] hidden md:table-cell">Answer</th>
                  <th className="px-2 md:px-4 py-3 text-center font-bold text-[#111518]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faqs.map(faq => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-4 py-3 text-center text-neutral-grey font-semibold text-xs md:text-base">
                      {faq.display_order}
                    </td>
                    <td className="px-2 md:px-4 py-3 font-semibold text-[#111518] max-w-xs truncate text-xs md:text-base">
                      {faq.question}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-neutral-grey max-w-sm truncate hidden md:table-cell text-xs md:text-base" title={faq.answer}>
                      {faq.answer}
                    </td>
                    <td className="px-2 md:px-4 py-3">
                      <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(faq)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          title="Edit FAQ"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Delete FAQ"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FAQManagement
