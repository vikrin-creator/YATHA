import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      // For now, we'll fetch all orders and find the one we need
      // In a real app, you'd have a dedicated endpoint
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success && data.data?.orders) {
        const foundOrder = data.data.orders.find(o => o.id === parseInt(orderId))
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          setError('Order not found')
        }
      } else {
        setError('Failed to load order details')
      }
    } catch (err) {
      console.error('Error fetching order details:', err)
      setError('Error loading order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-grey">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-light p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Order not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse shipping address if it's JSON
  let shippingAddress = {}
  if (order.shipping_address) {
    try {
      shippingAddress = typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address
    } catch (e) {
      shippingAddress = { raw: order.shipping_address }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <h1 className="text-2xl font-bold text-neutral-dark">Order #{order.id}</h1>
          <div></div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-grey text-sm">Order Status</p>
              <p className="text-xl font-semibold text-neutral-dark capitalize mt-1">
                {order.status || 'No status'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
              {order.status || 'pending'}
            </span>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-dark mb-4">Order Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-neutral-grey text-sm">Order ID</p>
              <p className="text-neutral-dark font-medium mt-1">#{order.id}</p>
            </div>
            <div>
              <p className="text-neutral-grey text-sm">Order Date</p>
              <p className="text-neutral-dark font-medium mt-1">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-neutral-grey text-sm">Order Amount</p>
              <p className="text-neutral-dark font-medium text-lg mt-1">₹{parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-neutral-grey text-sm">Payment Status</p>
              <p className="text-neutral-dark font-medium mt-1 capitalize">{order.status || 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-dark mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-neutral-grey text-sm">Customer Name</p>
              <p className="text-neutral-dark font-medium mt-1">{order.user_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-neutral-grey text-sm">Email Address</p>
              <p className="text-neutral-dark font-medium mt-1">{order.user_email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {Object.keys(shippingAddress).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-dark mb-4">Shipping Address</h2>
            <div className="space-y-2 text-neutral-dark">
              {shippingAddress.address_line_1 && (
                <p>{shippingAddress.address_line_1}</p>
              )}
              {shippingAddress.address_line_2 && (
                <p>{shippingAddress.address_line_2}</p>
              )}
              {(shippingAddress.city || shippingAddress.state || shippingAddress.pincode) && (
                <p>
                  {shippingAddress.city} {shippingAddress.state && `, ${shippingAddress.state}`}
                  {shippingAddress.pincode && ` - ${shippingAddress.pincode}`}
                </p>
              )}
              {shippingAddress.country && (
                <p>{shippingAddress.country}</p>
              )}
            </div>
          </div>
        )}

        {/* Stripe Information */}
        {(order.stripe_session_id || order.stripe_invoice_id) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-dark mb-4">Payment Details</h2>
            <div className="space-y-3 text-sm font-mono text-neutral-grey break-all">
              {order.stripe_session_id && (
                <div>
                  <p className="text-xs font-semibold text-neutral-dark mb-1">Stripe Session ID</p>
                  <p className="bg-neutral-light p-2 rounded">{order.stripe_session_id}</p>
                </div>
              )}
              {order.stripe_invoice_id && (
                <div>
                  <p className="text-xs font-semibold text-neutral-dark mb-1">Stripe Invoice ID</p>
                  <p className="bg-neutral-light p-2 rounded">{order.stripe_invoice_id}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
