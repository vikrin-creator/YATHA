import { useState, useEffect } from 'react'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getToken()
      if (!token) {
        setError('Please login to view users')
        setLoading(false)
        return
      }

      console.log('Fetching users from:', `${API_BASE_URL}/api/admin/users`)
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Users response:', result)
      
      // Handle the Response::success wrapped format
      if (result.success && result.data && Array.isArray(result.data)) {
        setUsers(result.data)
      } else if (Array.isArray(result)) {
        setUsers(result)
      } else if (Array.isArray(result.data)) {
        setUsers(result.data)
      } else {
        console.warn('Unexpected users data format:', result)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users: ' + error.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#111518]">User Management</h1>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-bold hover:bg-[#1873B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-grey">
            <p className="text-lg">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-neutral-grey">
            <p className="text-lg">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518]">ID</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518]">Name</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518] hidden md:table-cell">Email</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518] hidden lg:table-cell">Phone</th>
                  <th className="px-2 md:px-4 py-3 text-left font-bold text-[#111518] hidden lg:table-cell">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-4 py-3 text-center text-neutral-grey font-semibold text-xs md:text-base">
                      {user.id}
                    </td>
                    <td className="px-2 md:px-4 py-3 font-semibold text-[#111518] text-xs md:text-base">
                      {user.name}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-neutral-grey hidden md:table-cell text-xs md:text-base">
                      {user.email}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-neutral-grey hidden lg:table-cell text-xs md:text-base">
                      {user.phone || '-'}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-neutral-grey text-xs hidden lg:table-cell md:text-sm">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Summary */}
      {users.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[#1873B8] font-semibold">Total Users: {users.length}</p>
        </div>
      )}
    </div>
  )
}

export default UserManagement
