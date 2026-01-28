import { useState, useEffect } from 'react'
import { getToken } from '../services/authService'
import { API_BASE_URL } from '../config/api'

function SubscriptionCard({ subscription, onCanceled }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editingQuantity, setEditingQuantity] = useState(false)
  const [newQuantity, setNewQuantity] = useState(subscription.shipment_quantity || 1)

  const handleCancelSubscription = async () => {
    if (!window.confirm(`Are you sure you want to cancel ${subscription.product_name}? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription')
      }

      // Notify parent to refresh subscriptions
      if (onCanceled) {
        onCanceled()
      }
    } catch (err) {
      setError(err.message)
      console.error('Error canceling subscription:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch subscription details with order history
  const fetchOrderHistory = async () => {
    if (orders.length > 0) {
      setExpanded(!expanded)
      return
    }
    
    setLoadingOrders(true)
    setError(null)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.data && data.data.orders) {
        setOrders(data.data.orders)
      }
      setExpanded(!expanded)
    } catch (err) {
      setError('Failed to load order history: ' + err.message)
    } finally {
      setLoadingOrders(false)
    }
  }
  
  // Update shipment quantity
  const handleUpdateQuantity = async () => {
    if (newQuantity < 1) {
      setError('Quantity must be at least 1')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shipment_quantity: newQuantity })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity')
      }
      
      setSuccess('Shipment quantity updated successfully')
      setEditingQuantity(false)
      subscription.shipment_quantity = newQuantity
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Skip next shipment
  const handleSkipShipment = async () => {
    if (!window.confirm('Skip the next monthly shipment? You will not be charged for this cycle.')) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'skip' })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to skip shipment')
      }
      
      setSuccess('Next shipment skipped successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Pause subscription
  const handlePauseSubscription = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'pause' })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to pause subscription')
      }
      
      setSuccess('Subscription paused')
      if (onCanceled) {
        onCanceled()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Resume subscription
  const handleResumeSubscription = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'resume' })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resume subscription')
      }
      
      setSuccess('Subscription resumed')
      if (onCanceled) {
        onCanceled()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-blue-100 text-blue-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInterval = (interval, count) => {
    if (count === 1) {
      return `Every ${interval}`
    }
    return `Every ${count} ${interval}s`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <h3 className="text-lg font-bold text-[#111518]">
            {subscription.product_name}
          </h3>
          <p className="text-sm text-neutral-grey mt-1">
            Subscription ID: {subscription.id}
          </p>
        </div>

        {/* Price and Billing Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-grey mb-1">Price</p>
            <p className="font-semibold text-[#111518]">
              ${parseFloat(subscription.price).toFixed(2)}/month
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-grey mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Shipment Quantity */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-neutral-grey mb-2">Units per Monthly Delivery</p>
          {!editingQuantity ? (
            <div className="flex justify-between items-center">
              <p className="font-semibold text-[#111518]">{subscription.shipment_quantity || 1} units</p>
              {subscription.status === 'active' && (
                <button
                  onClick={() => {
                    setEditingQuantity(true)
                    setNewQuantity(subscription.shipment_quantity || 1)
                  }}
                  className="text-xs text-[#1873B8] hover:text-[#1873B8]/80 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-moringa-green focus:border-transparent"
              />
              <button
                onClick={handleUpdateQuantity}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-moringa-green text-white rounded hover:bg-moringa-green/80 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingQuantity(false)}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {/* Billing Dates */}
        {subscription.next_billing_date && (
          <div>
            <p className="text-xs text-neutral-grey mb-1">Next Billing Date</p>
            <p className="font-medium text-[#111518]">
              {new Date(subscription.next_billing_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Start Date */}
        <div>
          <p className="text-xs text-neutral-grey mb-1">Started</p>
          <p className="font-medium text-[#111518]">
            {new Date(subscription.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Order History Section */}
        <div className="border-t border-neutral-grey/20 pt-4">
          <button
            onClick={fetchOrderHistory}
            disabled={loadingOrders}
            className="w-full text-left font-semibold text-[#1873B8] hover:text-[#1873B8]/80 flex justify-between items-center"
          >
            <span>📦 Order History</span>
            <span>{expanded ? '▼' : '▶'}</span>
          </button>
          
          {expanded && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {loadingOrders ? (
                <p className="text-sm text-neutral-grey">Loading orders...</p>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="bg-gray-50 p-2 rounded text-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">Order #{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        order.shipment_status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.shipment_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.shipment_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.shipment_status}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-grey">
                      <p>{order.quantity} × {order.product_name}</p>
                      <p className="mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-grey">No orders yet</p>
              )}
            </div>
          )}
        </div>

        {/* Stripe ID */}
        <div className="border-t border-neutral-grey/20 pt-4">
          <p className="text-xs text-neutral-grey mb-2">Stripe Subscription ID</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded text-[#111518] break-all">
            {subscription.stripe_subscription_id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-neutral-grey/20 pt-4 space-y-2">
          {subscription.status === 'active' && (
            <>
              <button
                onClick={handleSkipShipment}
                disabled={isLoading}
                className="w-full py-2 px-3 font-semibold text-sm rounded-lg transition-colors bg-yellow-50 text-yellow-600 hover:bg-yellow-100 disabled:opacity-50"
              >
                ⏭️ Skip Next Shipment
              </button>
              
              <button
                onClick={handlePauseSubscription}
                disabled={isLoading}
                className="w-full py-2 px-3 font-semibold text-sm rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
              >
                ⏸️ Pause Subscription
              </button>
            </>
          )}

          {subscription.status === 'paused' && (
            <button
              onClick={handleResumeSubscription}
              disabled={isLoading}
              className="w-full py-2 px-3 font-semibold text-sm rounded-lg transition-colors bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
            >
              ▶️ Resume Subscription
            </button>
          )}

          {subscription.status === 'active' || subscription.status === 'paused' ? (
            <button
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="w-full py-2 px-3 font-semibold text-sm rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              🗑️ Cancel Subscription
            </button>
          ) : null}

          {subscription.status === 'canceled' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <p className="flex items-start gap-2">
                <span className="text-base mt-0.5">ℹ️</span>
                <span>This subscription has been canceled and will not renew.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCard
