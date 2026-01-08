import { useState, useEffect } from 'react'
import { getToken } from '../../services/authService'

function ReviewManagement() {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    title: '',
    rating: 5,
    comment: '',
    status: 'approved'
  })
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`)
      const data = await response.json()
      if (data.success) {
        setReviews(data.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setFormData({
      customer_name: review.customer_name,
      customer_email: review.customer_email,
      title: review.title || '',
      rating: review.rating,
      comment: review.comment,
      status: review.status
    })
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setEditingReview(null)
    setFormData({
      customer_name: '',
      customer_email: '',
      title: '',
      rating: 5,
      comment: '',
      status: 'approved'
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const headers = {
        'Content-Type': 'application/json'
      }
      const token = getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        handleCloseModal()
        fetchReviews()
      }
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        const headers = {}
        const token = getToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers
        })
        const data = await response.json()
        if (data.success) {
          fetchReviews()
        }
      } catch (error) {
        console.error('Error deleting review:', error)
      }
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-amber-400 text-lg' : 'text-gray-300 text-lg'}>
        ★
      </span>
    ))
  }

  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return `px-3 py-1 text-xs font-medium rounded-full ${colors[status] || colors.pending}`
  }

  const filteredReviews = filterStatus === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="text-3xl text-gray-300">💬</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.status === 'approved').length}</p>
            </div>
            <div className="text-3xl text-green-300">✓</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{reviews.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="text-3xl text-yellow-300">⏳</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-600">
                {reviews.filter(r => r.status === 'approved').length > 0 
                  ? (reviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.filter(r => r.status === 'approved').length).toFixed(1) 
                  : '0'}
              </p>
            </div>
            <div className="text-3xl text-amber-300">⭐</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 md:gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
            filterStatus === 'all' 
              ? 'bg-moringa-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
            filterStatus === 'approved' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved ({reviews.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
            filterStatus === 'pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({reviews.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Comment</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{review.customer_name}</p>
                        <p className="text-xs text-gray-500 hidden md:inline">{review.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <p className="text-xs md:text-sm text-gray-900 truncate max-w-xs">{review.product_name || 'Unknown'}</p>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">{renderStars(review.rating)}</div>
                    </td>
                    <td className="px-3 md:px-6 py-4 max-w-xs hidden md:table-cell">
                      <p className="text-xs md:text-sm text-gray-600 truncate">{review.comment}</p>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(review.status)}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-600 hidden md:table-cell">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm space-x-1 md:space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit review"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete review"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-3 md:px-6 py-8 text-center text-gray-500">
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Review</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Feeling amazing!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-moringa-green text-white rounded-lg hover:bg-moringa-green/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewManagement
