import { useState } from 'react'
import { getToken } from '../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function SubscriptionCard({ subscription, onCanceled }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCancelSubscription = async () => {
    if (!window.confirm(`Are you sure you want to cancel ${subscription.product_name}? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscription.id}`, {
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
              ${parseFloat(subscription.price).toFixed(2)}/{formatInterval(subscription.billing_interval, subscription.billing_interval_count)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-grey mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
        </div>

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

        {/* Stripe ID */}
        <div className="border-t border-neutral-grey/20 pt-4">
          <p className="text-xs text-neutral-grey mb-2">Stripe Subscription ID</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded text-[#111518] break-all">
            {subscription.stripe_subscription_id}
          </p>
        </div>

        {/* Cancel Button - Only show if subscription is active */}
        {subscription.status === 'active' && (
          <button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className={`w-full py-2 px-3 font-semibold text-sm rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                Canceling...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">cancel</span>
                Cancel Subscription
              </span>
            )}
          </button>
        )}

        {/* Info Message for Canceled Subscriptions */}
        {subscription.status === 'canceled' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">info</span>
              <span>This subscription has been canceled and will not renew.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionCard