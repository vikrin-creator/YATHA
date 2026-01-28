import React, { useState, useEffect } from 'react'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions?status=${filterStatus}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.data?.subscriptions || [])
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch subscriptions')
      }
    } catch (err) {
      setError('Error fetching subscriptions: ' + err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (subscriptionId, action) => {
    try {
      setActionLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          action: action
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.data?.message || 'Action completed successfully')
        setTimeout(() => setSuccess(null), 3000)
        fetchSubscriptions()
        setSelectedSubscription(null)
      } else {
        setError(data.message || 'Action failed')
      }
    } catch (err) {
      setError('Error performing action: ' + err.message)
      console.error('Action error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const stats = {
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    paused: subscriptions.filter(s => s.status === 'paused').length,
  }

  const filteredSubscriptions = filterStatus === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filterStatus)

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'paused': 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">Loading subscriptions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <button 
          onClick={fetchSubscriptions}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-gray-500 text-sm">Paused</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.paused}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-gray-500 text-sm">Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'paused', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No subscriptions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Next Billing</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription, index) => (
                <tr key={subscription.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{subscription.user_name}</div>
                    <div className="text-gray-600">{subscription.user_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{subscription.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">${subscription.product_price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(subscription.next_billing_date)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedSubscription(subscription)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total Count */}
      <div className="text-sm text-gray-600 text-right">
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </div>

      {/* Modal for Actions */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedSubscription.user_name}</h3>
                <p className="text-sm text-gray-600">{selectedSubscription.product_name}</p>
              </div>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><span className="font-medium">Status:</span> {selectedSubscription.status}</p>
              <p><span className="font-medium">Amount:</span> ${selectedSubscription.product_price.toFixed(2)}/month</p>
              <p><span className="font-medium">Next Billing:</span> {formatDate(selectedSubscription.next_billing_date)}</p>
            </div>

            <div className="space-y-2">
              {selectedSubscription.status === 'active' && (
                <>
                  <button
                    onClick={() => performAction(selectedSubscription.id, 'pause')}
                    disabled={actionLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Loading...' : 'Pause Subscription'}
                  </button>
                  <button
                    onClick={() => performAction(selectedSubscription.id, 'manually_bill')}
                    disabled={actionLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Loading...' : 'Bill Now'}
                  </button>
                  <button
                    onClick={() => performAction(selectedSubscription.id, 'skip_month')}
                    disabled={actionLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Loading...' : 'Skip Next Month'}
                  </button>
                </>
              )}

              {selectedSubscription.status === 'paused' && (
                <button
                  onClick={() => performAction(selectedSubscription.id, 'resume')}
                  disabled={actionLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Resume Subscription'}
                </button>
              )}

              {selectedSubscription.status !== 'cancelled' && (
                <button
                  onClick={() => performAction(selectedSubscription.id, 'cancel')}
                  disabled={actionLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Cancel Subscription'}
                </button>
              )}

              <button
                onClick={() => setSelectedSubscription(null)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
