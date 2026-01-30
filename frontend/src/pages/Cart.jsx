import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../services/authService'

function Cart() {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setLoading(false)
  }, [])

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/public/uploads/images/placeholder.png`
    if (imgPath.startsWith('http')) return imgPath
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    return `${API_BASE_URL}/public/uploads/images/${imgPath}`
  }

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Dispatch event to update navbar cart count
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Dispatch event to update navbar cart count
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
  const tax = subtotal * 0.1 // 10% tax
  const shipping = subtotal > 50 ? 0 : 7.99 // $7.99 shipping, free over $50
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
          <p className="mt-2 text-neutral-grey">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-organic-beige/30 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111518]">Shopping Cart</h1>
            <p className="text-sm text-neutral-grey mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-organic-beige hover:bg-organic-beige/80 text-primary font-semibold rounded-lg transition-all hover:gap-3"
          >
            <span className="material-symbols-outlined">storefront</span>
            Continue Shopping
          </button>
        </div>

        {/* Mobile Continue Shopping Button */}
        <button
          onClick={() => navigate('/')}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-organic-beige hover:bg-organic-beige/80 text-primary font-semibold rounded-lg transition-all mb-4"
        >
          <span className="material-symbols-outlined">storefront</span>
          Continue Shopping
        </button>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-neutral-grey/30 block mb-3">shopping_bag</span>
            <h2 className="text-xl font-bold text-[#111518] mb-2">Your cart is empty</h2>
            <p className="text-sm text-neutral-grey mb-4">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-4 ${
                      index !== cartItems.length - 1 ? 'border-b border-neutral-grey/10' : ''
                    } hover:bg-organic-beige/10 transition-colors`}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-organic-beige rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={getFullImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `${API_BASE_URL}/public/uploads/images/placeholder.png`
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-neutral-grey/30">
                          image_not_supported
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#111518] truncate">{item.name}</h3>
                      <p className="text-primary font-bold text-sm">${parseFloat(item.price).toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-organic-beige rounded p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-primary hover:bg-white rounded transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-8 text-center text-xs font-semibold text-[#111518] bg-transparent border-0 outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-primary hover:bg-white rounded transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-max">
                      <p className="text-xs text-neutral-grey">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-5 sticky top-20">
                <h2 className="text-lg font-bold text-[#111518] mb-4">Summary</h2>

                {/* Summary Items */}
                <div className="space-y-2 mb-4 pb-4 border-b border-neutral-grey/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-grey">Subtotal</span>
                    <span className="font-semibold text-[#111518]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-grey">Tax (10%)</span>
                    <span className="font-semibold text-[#111518]">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-grey">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-moringa-green' : 'text-[#111518]'}`}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#111518]">Total</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-2 px-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm mb-2 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                  Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 px-3 bg-organic-beige text-primary font-semibold rounded-lg hover:bg-organic-beige/80 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
