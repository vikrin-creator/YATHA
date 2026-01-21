import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser, getToken } from '../services/authService'
import apiClient from '../services/api'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

function Checkout() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    agreeTerms: false
  })
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  useEffect(() => {
    // Auto-scroll to top
    window.scrollTo(0, 0)

    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate('/auth')
      return
    }

    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.name?.split(' ')[1] || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }))
      // fetch saved addresses for logged in user
      fetchAddresses()
    }

    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const fetchAddresses = async () => {
    try {
      const token = getToken()
      if (!token) {
        console.log('[Checkout] No token found, skipping address fetch')
        return
      }
      console.log('[Checkout] Fetching addresses...')
      
      const res = await apiClient.get('/addresses')
      console.log('[Checkout] Address API response:', res)
      
      if (res.success && res.data) {
        setAddresses(res.data)
        // pick default address if present - handle both boolean and integer values
        const def = (res.data || []).find(a => a.is_default == 1 || a.is_default === true || a.is_default === '1')
        console.log('[Checkout] Addresses loaded:', res.data, 'Default address found:', def)
        
        if (def) {
          setSelectedAddressId(def.id)
          setFormData(prev => ({
            ...prev,
            firstName: def.full_name?.split(' ')[0] || prev.firstName,
            lastName: def.full_name?.split(' ')[1] || prev.lastName,
            phone: def.phone || prev.phone,
            address: def.address_line_1 + (def.address_line_2 ? (', ' + def.address_line_2) : ''),
            city: def.city || prev.city,
            state: def.state || prev.state,
            zipCode: def.pincode || prev.zipCode,
            country: def.country || prev.country
          }))
          console.log('[Checkout] Default address selected:', def)
        }
      } else {
        console.error('[Checkout] API response not successful:', res)
      }
    } catch (err) {
      console.error('[Checkout] Error fetching addresses:', err)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.1
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!formData.agreeTerms) {
      alert('Please agree to terms and conditions')
      return
    }

    // Separate items by purchase type
    const subscriptionItems = cartItems.filter(item => item.purchaseType === 'subscribe')
    const onetimeItems = cartItems.filter(item => item.purchaseType !== 'subscribe')

    // Validate - cannot mix subscription and one-time purchases in same checkout
    if (subscriptionItems.length > 0 && onetimeItems.length > 0) {
      alert('Please checkout subscriptions and one-time purchases separately. Remove either subscription or one-time items and try again.')
      return
    }

    setLoading(true)

    try {
      const token = getToken()
      const basePayload = {
        address_id: selectedAddressId,
        success_url: window.location.origin + '/order-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: window.location.href
      }

      let endpoint = ''
      let payload = {}

      // Route to appropriate endpoint based on purchase type
      if (subscriptionItems.length > 0) {
        // Handle subscription items
        endpoint = `${API_BASE_URL}/api/subscriptions`
        payload = {
          ...basePayload,
          items: subscriptionItems,
          total: total
        }
      } else {
        // Handle one-time purchase items
        endpoint = `${API_BASE_URL}/api/checkout`
        payload = {
          ...basePayload,
          items: onetimeItems,
          total: total
        }
      }

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await resp.json()
      if (resp.ok && data.success && data.data && data.data.session && data.data.session.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.session.url
        return
      } else {
        console.error('Failed to create checkout session', data)
        alert(data.message || 'Failed to start payment session')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-organic-beige py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#111518] mb-3">Your Cart is Empty</h1>
          <p className="text-neutral-grey mb-6">Add some products before proceeding to checkout</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#1873B8] text-white rounded-full font-bold hover:bg-[#1873B8]/90 transition-colors text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-organic-beige py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <div className="w-16 h-16 bg-moringa-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-moringa-green">✓</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111518] mb-2">Order Placed Successfully!</h1>
            <p className="text-neutral-grey mb-2">Thank you for your purchase.</p>
            <p className="text-sm text-neutral-grey mb-6">You will receive an order confirmation email shortly.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#1873B8] text-white rounded-full font-bold hover:bg-[#1873B8]/90 transition-colors text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-beige py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111518] mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-[#111518] mb-3">Shipping Information</h2>

                    {/* Saved addresses selector */}
                    {addresses.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Use saved address</label>
                        <div className="space-y-2">
                          {addresses.map(addr => (
                            <label key={addr.id} className="flex items-center gap-3 p-2 border rounded-lg">
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={selectedAddressId === addr.id}
                                onClick={() => {
                                  // allow toggling off the selected radio to use a different address
                                  if (selectedAddressId === addr.id) {
                                    setSelectedAddressId(null)
                                    setFormData(prev => ({
                                      ...prev,
                                      address: '',
                                      city: '',
                                      state: '',
                                      zipCode: '',
                                      country: ''
                                    }))
                                  }
                                }}
                                onChange={() => {
                                  setSelectedAddressId(addr.id)
                                  // populate form with selected address
                                  setFormData(prev => ({
                                    ...prev,
                                    firstName: addr.full_name?.split(' ')[0] || prev.firstName,
                                    lastName: addr.full_name?.split(' ')[1] || prev.lastName,
                                    phone: addr.phone || prev.phone,
                                    address: addr.address_line_1 + (addr.address_line_2 ? (', ' + addr.address_line_2) : ''),
                                    city: addr.city || prev.city,
                                    state: addr.state || prev.state,
                                    zipCode: addr.pincode || prev.zipCode,
                                    country: addr.country || prev.country
                                  }))
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-[#111518]">{addr.name} {(addr.is_default == 1 || addr.is_default === true || addr.is_default === '1') && <span className="text-xs text-primary">(Default)</span>}</div>
                                <div className="text-sm text-neutral-grey">{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}</div>
                                <div className="text-sm text-neutral-grey">{addr.city}, {addr.state} - {addr.pincode}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Payment handled externally — section removed */}

              {/* Terms and Conditions */}
              <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-xs md:text-sm text-gray-700">
                    I agree to the <span className="font-bold">Terms and Conditions</span> and <span className="font-bold">Privacy Policy</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 md:py-3 bg-[#1873B8] text-white rounded-lg font-bold hover:bg-[#1873B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 sticky top-20">
              <h2 className="text-lg font-bold text-[#111518] mb-3">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-700">{item.name}</p>
                      <p className="text-neutral-grey">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#111518]">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toLocaleString()}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">Free shipping on orders over $500!</p>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-moringa-green">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
