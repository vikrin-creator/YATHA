import React, { useState, useEffect } from 'react'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.data?.subscriptions || [])
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

  const stats = {
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    paused: subscriptions.filter(s => s.status === 'paused').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length
  }

  const filteredSubscriptions = filterStatus === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filterStatus)

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'past_due': 'bg-orange-100 text-orange-800'
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-gray-500 text-sm">Paused</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.paused}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-gray-500 text-sm">Past Due</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pastDue}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-gray-500 text-sm">Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterStatus('paused')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'paused'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Paused
        </button>
        <button
          onClick={() => setFilterStatus('past_due')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'past_due'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Past Due
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Cancelled
        </button>
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stripe Subscription ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription, index) => (
                <tr key={subscription.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{subscription.user_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subscription.user_email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{subscription.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">${subscription.product_price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">{subscription.stripe_subscription_id.substring(0, 20)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(subscription.created_at)}</td>
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
    </div>
  )
}
