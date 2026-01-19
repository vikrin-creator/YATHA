import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const navigate = useNavigate()

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-blue-100 text-blue-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-purple-100 text-purple-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  ]

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data?.orders || [])
      } else {
        setError(data.message || 'Failed to load orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        setEditingOrderId(null)
        
        // Optionally show success message
        console.log('Order status updated successfully')
      } else {
        alert('Error updating order: ' + data.message)
      }
    } catch (err) {
      console.error('Error updating order:', err)
      alert('Error updating order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filter !== 'all' && order.status !== filter) {
      return false
    }
    
    // Filter by search term (order ID, email, user name)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        order.id.toString().includes(search) ||
        (order.user_email && order.user_email.toLowerCase().includes(search)) ||
        (order.user_name && order.user_name.toLowerCase().includes(search))
      )
    }
    
    return true
  })

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    pending: orders.filter(o => o.status === 'pending').length,
    failed: orders.filter(o => o.status === 'failed').length,
  }

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-organic-beige/30 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate('/admin')}
              className="text-primary hover:text-primary/80"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-3xl font-bold text-[#111518]">Order Management</h1>
          </div>
          <p className="text-neutral-grey">Manage and track all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.total, color: 'bg-blue-50', icon: 'shopping_cart' },
            { label: 'Paid', value: stats.paid, color: 'bg-green-50', icon: 'check_circle' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50', icon: 'schedule' },
            { label: 'Failed', value: stats.failed, color: 'bg-red-50', icon: 'error' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-lg p-4 border border-neutral-grey/10`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-grey mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111518]">{stat.value}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-neutral-grey/30">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-grey">search</span>
              <input
                type="text"
                placeholder="Search by Order ID, Email, or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-grey/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-grey/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin block mb-4">refresh</span>
            <p className="text-neutral-grey">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button
              onClick={fetchAllOrders}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-neutral-grey/30 block mb-4">shopping_bag</span>
            <p className="text-neutral-grey text-lg">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-grey/5 border-b border-neutral-grey/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-grey">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-grey">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-grey">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-grey">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-grey">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-grey">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-grey">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-grey/10 hover:bg-neutral-grey/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#111518]">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-[#111518]">{order.user_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-grey break-all">{order.user_email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-grey">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#111518] text-right">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingOrderId === order.id ? (
                          <div className="flex gap-2">
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value)}
                              className="px-2 py-1 border border-neutral-grey/20 rounded text-sm focus:outline-none focus:border-primary"
                              disabled={updatingOrderId === order.id}
                            >
                              {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => updateOrderStatus(order.id, editingStatus)}
                              disabled={updatingOrderId === order.id}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                            >
                              {updatingOrderId === order.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              disabled={updatingOrderId === order.id}
                              className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                            getStatusColor(order.status)
                          }`}>
                            {(order.status || 'PENDING').toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center gap-2">
                          {editingOrderId !== order.id && (
                            <button
                              onClick={() => {
                                setEditingOrderId(order.id)
                                setEditingStatus(order.status)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Status"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-4 text-center text-sm text-neutral-grey">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderManagement

