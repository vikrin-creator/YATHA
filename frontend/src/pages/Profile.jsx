import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated, getToken } from '../services/authService'
import apiClient from '../services/api'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function Profile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/auth')
      return
    }

    // Fetch fresh user data from backend
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/users')
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          // Fallback to localStorage data if API fails
          const userData = getCurrentUser()
          setUser(userData)
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        // Fallback to localStorage data if API fails
        const userData = getCurrentUser()
        setUser(userData)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
    fetchOrders()

    // Listen for showOrdersTab event from navbar
    const handleShowOrdersTab = () => {
      setActiveTab('orders')
    }
    window.addEventListener('showOrdersTab', handleShowOrdersTab)
    
    return () => {
      window.removeEventListener('showOrdersTab', handleShowOrdersTab)
    }
  }, [navigate])

  const fetchOrders = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setOrders(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  // Refresh orders every 3 seconds to catch status updates from admin
  useEffect(() => {
    if (isAuthenticated()) {
      const interval = setInterval(() => {
        fetchOrders()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
          <p className="mt-2 text-neutral-grey">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-4">Error loading profile</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-beige/30 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-neutral-grey/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-neutral-grey hover:text-[#111518]'
            }`}
          >
            <span className="material-symbols-outlined align-middle mr-2">person</span>
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-neutral-grey hover:text-[#111518]'
            }`}
          >
            <span className="material-symbols-outlined align-middle mr-2">shopping_bag</span>
            My Orders ({orders.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="h-20 bg-gradient-to-r from-primary to-primary/70"></div>

            {/* Profile Content */}
            <div className="relative px-4 md:px-6 pb-6">
              {/* Avatar */}
              <div className="flex justify-center -mt-10 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-4xl text-primary">account_circle</span>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#111518] mb-1">
                  {user?.name || user?.username || 'User Profile'}
                </h1>
                <p className="text-xs text-neutral-grey">Member Account</p>
              </div>

              {/* Details Section */}
              <div className="space-y-3">
                {/* Name */}
                <div className="border-b border-neutral-grey/20 pb-2">
                  <label className="block text-xs font-semibold text-neutral-grey mb-1">
                    <span className="material-symbols-outlined text-base align-middle">person</span> Full Name
                  </label>
                  <p className="text-sm text-[#111518] font-medium">
                    {user?.name || 'Not provided'}
                  </p>
                </div>

                {/* Email */}
                <div className="border-b border-neutral-grey/20 pb-2">
                  <label className="block text-xs font-semibold text-neutral-grey mb-1">
                    <span className="material-symbols-outlined text-base align-middle">mail</span> Email Address
                  </label>
                  <p className="text-sm text-[#111518] font-medium break-all">
                    {user?.email || 'Not provided'}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="border-b border-neutral-grey/20 pb-2">
                  <label className="block text-xs font-semibold text-neutral-grey mb-1">
                    <span className="material-symbols-outlined text-base align-middle">phone</span> Phone Number
                  </label>
                  <p className="text-sm text-[#111518] font-medium">
                    {user?.phone || 'Not provided'}
                  </p>
                </div>

                {/* Username */}
                {user?.username && (
                  <div className="border-b border-neutral-grey/20 pb-2">
                    <label className="block text-xs font-semibold text-neutral-grey mb-1">
                      <span className="material-symbols-outlined text-base align-middle">badge</span> Username
                    </label>
                    <p className="text-sm text-[#111518] font-medium">
                      {user.username}
                    </p>
                  </div>
                )}

                {/* Address */}
                {user?.address && (
                  <div className="border-b border-neutral-grey/20 pb-2">
                    <label className="block text-xs font-semibold text-neutral-grey mb-1">
                      <span className="material-symbols-outlined text-base align-middle">location_on</span> Address
                    </label>
                    <p className="text-sm text-[#111518] font-medium">
                      {user.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-2 px-3 bg-neutral-grey/10 text-[#111518] font-semibold text-sm rounded-lg hover:bg-neutral-grey/20 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-neutral-grey/30 block mb-4">shopping_bag</span>
                <h2 className="text-xl font-bold text-[#111518] mb-2">No Orders Yet</h2>
                <p className="text-neutral-grey mb-6">Start shopping to place your first order</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-neutral-grey mb-1">Order ID</p>
                        <p className="font-semibold text-[#111518]">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-grey mb-1">Date</p>
                        <p className="font-semibold text-[#111518]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-grey mb-1">Amount</p>
                        <p className="font-semibold text-[#111518]">${parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-grey mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
