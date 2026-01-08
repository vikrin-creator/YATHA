import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated, getToken } from '../services/authService'
import apiClient from '../services/api'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
  }, [navigate])

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
      <div className="max-w-xl mx-auto">
        {/* Profile Card */}
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
              <button
                className="flex-1 py-2 px-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
