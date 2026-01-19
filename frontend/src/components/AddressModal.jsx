import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getToken } from '../services/authService'

const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:8000"
  : window.location.origin + '/backend'

function AddressModal({ isOpen, onClose, editingAddress = null, onAddressSaved }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    type: 'home',
    name: '',
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    is_default: false
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchAddresses()
    }
  }, [isOpen])

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        ...editingAddress,
        is_default: editingAddress.is_default === 1 || editingAddress.is_default === true
      })
      setShowForm(true)
    }
  }, [editingAddress])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const token = getToken()

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
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

      if (result.success && result.data) {
        setAddresses(result.data)
      } else {
        setAddresses([])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Address name is required'
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Address line 1 is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)
      const token = getToken()
      const isEditing = !!formData.id

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) {
          setErrors(errorData.errors)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Reset form
        setFormData({
          id: null,
          type: 'home',
          name: '',
          full_name: '',
          phone: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          pincode: '',
          country: '',
          is_default: false
        })
        setShowForm(false)
        setErrors({})

        // Refresh addresses
        await fetchAddresses()

        // Notify parent component
        if (onAddressSaved) {
          onAddressSaved()
        }
      }
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (address) => {
    setFormData({
      ...address,
      is_default: address.is_default === 1 || address.is_default === true
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const token = getToken()

      const response = await fetch(`${API_BASE_URL}/api/addresses?id=${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        await fetchAddresses()
        if (onAddressSaved) {
          onAddressSaved()
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      id: null,
      type: 'home',
      name: '',
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      is_default: false
    })
    setErrors({})
    setShowForm(false)
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99990]"
        onClick={onClose}
      />

      {/* Modal container - responsive: full-screen on small, centered on md+ */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        <div className="w-full h-full p-4 md:static md:p-0 md:flex md:items-center md:justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-full h-full max-h-full md:max-w-3xl md:max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-[#111518]">My Addresses</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-neutral-grey">Loading addresses...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add New Address Button */}
                {!showForm && (
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#111518]">Saved Addresses</h3>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-4 py-2 bg-[#1873B8] text-white rounded-lg font-medium hover:bg-[#1873B8]/90 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Add New Address
                    </button>
                  </div>
                )}

                {/* Address Form */}
                {showForm && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#111518]">
                        {formData.id ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            Address Type
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            Address Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Home, Office"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.full_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#111518] mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="address_line_1"
                          value={formData.address_line_1}
                          onChange={handleInputChange}
                          placeholder="Street address, building, apartment"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                            errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.address_line_1 && <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#111518] mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="address_line_2"
                          value={formData.address_line_2}
                          onChange={handleInputChange}
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter state"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-1">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="Enter pincode"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1873B8] focus:border-transparent ${
                              errors.pincode ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          name="is_default"
                          checked={formData.is_default}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#1873B8] border-gray-300 rounded focus:ring-[#1873B8]"
                        />
                        <label htmlFor="is_default" className="text-sm text-[#111518]">
                          Set as default address
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-medium hover:bg-[#1873B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : (formData.id ? 'Update Address' : 'Save Address')}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address List */}
                {!showForm && addresses.length > 0 && (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-[#111518]">{address.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                address.type === 'home' ? 'bg-[#B65DAA]/10 text-[#B65DAA]' :
                                address.type === 'work' ? 'bg-[#F2A27C]/10 text-[#F2A27C]' :
                                'bg-[#6A994E]/10 text-[#6A994E]'
                              }`}>
                                {address.type}
                              </span>
                              {address.is_default === 1 && (
                                <span className="px-2 py-1 text-xs bg-[#1873B8]/10 text-[#1873B8] rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-grey mb-1">{address.full_name}</p>
                            <p className="text-sm text-neutral-grey mb-1">{address.phone}</p>
                            <p className="text-sm text-neutral-grey">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-sm text-neutral-grey">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            {address.country && (
                              <p className="text-sm text-neutral-grey">{address.country}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(address)}
                              className="p-2 text-[#1873B8] hover:bg-[#1873B8]/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(address.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!showForm && addresses.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-neutral-grey mb-4">location_off</span>
                    <h3 className="text-lg font-medium text-[#111518] mb-2">No addresses found</h3>
                    <p className="text-neutral-grey mb-4">Add your first address to get started</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-2 bg-[#1873B8] text-white rounded-lg font-medium hover:bg-[#1873B8]/90 transition-colors"
                    >
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

export default AddressModal