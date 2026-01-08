import { useState, useEffect, useRef } from 'react'
import { getToken, isAuthenticated, getCurrentUser } from '../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function Reviews({ productId, slug, productName }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    title: '',
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const carouselRef = useRef(null)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  useEffect(() => {
    fetchReviews()
    // Check if user is logged in
    if (isAuthenticated()) {
      setIsLoggedIn(true)
      const user = getCurrentUser()
      setCurrentUser(user)
      if (user) {
        setFormData(prev => ({
          ...prev,
          customer_name: user.name || '',
          customer_email: user.email || ''
        }))
      }
    }
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews?product_id=${productId}`)
      const data = await response.json()
      if (data.success) {
        // Filter only approved reviews for public display
        const approvedReviews = data.data.filter(review => review.status === 'approved')
        setReviews(approvedReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    startXRef.current = e.pageX - carouselRef.current.offsetLeft
    scrollLeftRef.current = carouselRef.current.scrollLeft
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const headers = {
        'Content-Type': 'application/json'
      }

      const token = getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: productId,
          ...formData,
          status: 'pending'
        })
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format')
      }

      const data = await response.json()
      if (data.success) {
        setSuccessMessage('Review submitted! It will appear after approval.')
        setFormData({
          customer_name: '',
          customer_email: '',
          title: '',
          rating: 5,
          comment: ''
        })
        setShowForm(false)
        fetchReviews()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setSuccessMessage('Error: ' + (data.message || 'Failed to submit review'))
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setSuccessMessage('Error submitting review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-golden-yellow' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  }

  return (
    <section className="py-8 sm:py-12 md:py-16" id="reviews">
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }
        
        .auto-scroll-container {
          display: flex;
          animation: scroll-left 25s linear infinite;
          gap: 1.5rem;
          padding-bottom: 1rem;
          will-change: transform;
        }
        
        .auto-scroll-container.pause-animation {
          animation-play-state: paused;
        }
        
        .auto-scroll-container:hover:not(.pause-animation) {
          animation-play-state: paused;
        }
        
        .reviews-wrapper {
          overflow-x: scroll;
          overflow-y: hidden;
          width: 100%;
          scroll-behavior: smooth;
          user-select: none;
        }
        
        .reviews-wrapper::-webkit-scrollbar {
          height: 0;
          display: none;
        }
        
        .reviews-wrapper {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#111518]">Customer Reviews</h2>
            {!loading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-golden-yellow text-xl">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(calculateAverageRating()) ? '★' : i < calculateAverageRating() ? '⯨' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-lg font-bold text-[#111518]">{calculateAverageRating()}</span>
                <span className="text-neutral-grey">(Based on {reviews.length} reviews)</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 px-6 py-3 border border-clay-brown text-clay-brown font-bold rounded-full hover:bg-clay-brown hover:text-white transition-colors"
          >
            Write a Review
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Reviews Auto-Scroll */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div 
            className={`reviews-wrapper mb-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`auto-scroll-container ${isDragging ? 'pause-animation' : ''}`}>
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-3 sm:p-4 rounded-lg border border-neutral-grey/10 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-80">
                  <div className="flex items-center gap-1 text-golden-yellow mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm fill-1">
                        {i < review.rating ? 'star' : 'star'}
                      </span>
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-[#111518] mb-2">{review.title}</h4>
                  )}
                  <p className="text-neutral-grey text-sm mb-4 line-clamp-3">"{review.comment}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-clay-brown">{review.customer_name}</span>
                    <span className="text-xs text-neutral-grey">Verified Buyer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-neutral-grey text-center py-8 mb-8">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Share Your Experience</h2>
                  <p className="text-sm text-gray-600 mt-1">Writing review for: <span className="font-semibold text-moringa-green">{productName}</span></p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      readOnly={isLoggedIn}
                      required
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent ${isLoggedIn ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      readOnly={isLoggedIn}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent ${isLoggedIn ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ Good</option>
                    <option value={3}>⭐⭐⭐ Average</option>
                    <option value={2}>⭐⭐ Fair</option>
                    <option value={1}>⭐ Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Great quality, would recommend!"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Share your experience with this product..."
                    required
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-moringa-green text-white rounded-lg hover:bg-moringa-green/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Reviews
