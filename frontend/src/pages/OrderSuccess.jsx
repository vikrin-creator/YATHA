import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getToken, isAuthenticated } from '../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:8000"
  : window.location.origin + '/backend'

function OrderSuccess() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const MAX_RETRIES = 8  // Retry for up to 16 seconds
  const RETRY_DELAY = 2000  // 2 seconds between retries

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/auth')
      return
    }

    // Get session ID from URL
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setError('No order session found. Redirecting to home...')
      setTimeout(() => navigate('/'), 3000)
      return
    }

    // Reset retry count when starting fresh
    setRetryCount(0)
    // Fetch order details using session ID
    fetchOrderDetails(sessionId)
  }, [searchParams, navigate])

  // Separate useEffect for retry mechanism
  useEffect(() => {
    if (retryCount > 0) {
      const sessionId = searchParams.get('session_id')
      if (sessionId) {
        const timer = setTimeout(() => {
          fetchOrderDetails(sessionId)
        }, RETRY_DELAY)
        return () => clearTimeout(timer)
      }
    }
  }, [retryCount, searchParams])

  const fetchOrderDetails = async (sessionId) => {
    try {
      const token = getToken()
      
      if (!token) {
        setError('Authentication failed. Please log in again.')
        setLoading(false)
        setTimeout(() => navigate('/auth'), 2000)
        return
      }
      
      console.log(`[OrderSuccess] Fetching order for session: ${sessionId} (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      
      // Query orders by stripe_session_id
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Find order matching this session
        const matchedOrder = data.data.find(o => o.stripe_session_id === sessionId)

        if (matchedOrder) {
          setOrder(matchedOrder)
          setLoading(false)
        } else {
          // Order not found yet - retry if we haven't exceeded max retries
          if (retryCount < MAX_RETRIES) {
            setError(null)
            setRetryCount(prev => prev + 1)
          } else {
            // Max retries exceeded
            setError('Order is taking longer to process. Please check your email for confirmation or contact support.')
            setLoading(false)
          }
        }
      } else {
        if (retryCount < MAX_RETRIES) {
          setError(null)
          setRetryCount(prev => prev + 1)
        } else {
          setError('Failed to fetch order details after multiple attempts. Please contact support.')
          setLoading(false)
        }
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      // Retry on error too
      if (retryCount < MAX_RETRIES) {
        setError(null)
        setRetryCount(prev => prev + 1)
      } else {
        setError('Error loading order details: ' + err.message)
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-beige/30 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin block mb-4">
            hourglass_empty
          </span>
          <h2 className="text-2xl font-bold text-[#111518] mb-2">Processing Your Order</h2>
          <p className="text-neutral-grey mb-2">Please wait while we confirm your payment...</p>
          <p className="text-xs text-neutral-grey">Attempt {retryCount + 1}/{MAX_RETRIES + 1}</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-organic-beige/30 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 block mb-4">
              error
            </span>
            <h2 className="text-2xl font-bold text-[#111518] mb-2">Order Error</h2>
            <p className="text-neutral-grey mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-organic-beige/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-grey">No order data available</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-beige/30 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111518] mb-2">
            Order Confirmed!
          </h1>
          <p className="text-neutral-grey text-lg">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-neutral-grey/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-grey mb-1">ORDER ID</p>
                <p className="text-2xl font-bold text-primary">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-grey mb-1">ORDER DATE</p>
                <p className="text-lg font-bold text-[#111518]">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-grey mb-1">STATUS</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-sm">
                  {order.status?.toUpperCase() || 'PAID'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-grey mb-1">TOTAL AMOUNT</p>
                <p className="text-2xl font-bold text-[#111518]">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Delivery Address */}
            {order.shipping_address && (
              <div>
                <h3 className="font-bold text-[#111518] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  Delivery Address
                </h3>
                <div className="bg-neutral-grey/5 rounded-lg p-4">
                  {(() => {
                    try {
                      const addr = typeof order.shipping_address === 'string'
                        ? JSON.parse(order.shipping_address)
                        : order.shipping_address
                      return (
                        <div className="text-[#111518] space-y-1">
                          <p className="font-medium">{addr.full_name || 'N/A'}</p>
                          <p>{addr.address_line_1 || 'N/A'}</p>
                          <p>{addr.address_line_2 ? `${addr.address_line_2}, ` : ''}{addr.city}, {addr.state} {addr.pincode}</p>
                          <p>{addr.country}</p>
                          {addr.phone && <p className="text-neutral-grey">Phone: {addr.phone}</p>}
                        </div>
                      )
                    } catch (e) {
                      return <p className="text-neutral-grey">Address details available</p>
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Stripe Reference */}
            <div className="border-t border-neutral-grey/20 pt-6">
              <h3 className="font-bold text-[#111518] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">credit_card</span>
                Payment Reference
              </h3>
              <div className="bg-neutral-grey/5 rounded-lg p-4">
                <p className="text-xs text-neutral-grey mb-1">Stripe Session ID</p>
                <p className="font-mono text-sm text-[#111518] break-all">
                  {order.stripe_session_id}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">info</span>
                What's Next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Your order is confirmed and being prepared</li>
                <li>✓ You will receive a shipping notification email</li>
                <li>✓ Track your order status in your profile</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/user/profile')}
            className="py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            View My Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="py-3 px-4 bg-neutral-grey/10 text-[#111518] font-semibold rounded-lg hover:bg-neutral-grey/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">home</span>
            Continue Shopping
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-neutral-grey text-sm">
            Questions about your order?{' '}
            <a href="mailto:support@yatha.com" className="text-primary font-semibold hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
