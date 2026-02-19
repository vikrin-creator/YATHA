import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

function PromotionBannerManagement() {
  const [promotion, setPromotion] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    button_text: '',
    product_id: '',
    discount_percentage: '',
    is_active: true
  })

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend'

  useEffect(() => {
    const fetchData = async () => {
      await fetchPromotion()
      await fetchProducts()
      setLoading(false)
    }
    fetchData()
  }, [])

  const fetchPromotion = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/promotions/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      console.log('Promotion data:', data)
      if (data.success && data.data) {
        setPromotion(data.data)
        setFormData({
          button_text: data.data.button_text || '',
          product_id: String(data.data.product_id) || '',
          discount_percentage: String(data.data.discount_percentage) || '',
          is_active: data.data.is_active ? true : false
        })
      } else {
        toast.error(data.error || 'Failed to load promotion')
      }
    } catch (error) {
      console.error('Error fetching promotion:', error)
      toast.error('Failed to load promotion: ' + error.message)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.button_text?.trim()) {
      toast.error('Button text is required')
      return
    }

    if (!formData.product_id) {
      toast.error('Please select a product')
      return
    }

    if (!formData.discount_percentage) {
      toast.error('Discount percentage is required')
      return
    }

    if (!promotion?.id) {
      toast.error('Promotion not loaded yet. Please refresh the page.')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Submitting:', {
        button_text: formData.button_text,
        product_id: parseInt(formData.product_id),
        discount_percentage: parseFloat(formData.discount_percentage),
        is_active: true,
        id: promotion.id
      })

      const response = await fetch(`${API_BASE_URL}/api/promotions/${promotion.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          button_text: formData.button_text,
          product_id: parseInt(formData.product_id),
          discount_percentage: parseFloat(formData.discount_percentage),
          is_active: formData.is_active
        })
      })

      const data = await response.json()
      console.log('Response:', data)
      
      if (data.success) {
        setPromotion(data.data)
        setFormData({
          button_text: data.data.button_text,
          product_id: String(data.data.product_id),
          discount_percentage: String(data.data.discount_percentage),
          is_active: data.data.is_active ? true : false
        })
        toast.success('Promotion banner updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update promotion')
      }
    } catch (error) {
      console.error('Error updating promotion:', error)
      toast.error('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/public/uploads/images/placeholder.png`
    if (imgPath.startsWith('http')) return imgPath
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    return `${API_BASE_URL}/public/uploads/images/${imgPath}`
  }

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promotional Banner Management</h1>
        <p className="mt-1 text-gray-600">Edit the promotional banner that appears on the home page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Button Text Field */}
              <div>
                <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  id="button_text"
                  name="button_text"
                  value={formData.button_text}
                  onChange={handleChange}
                  placeholder="e.g., Buy Moringa this month and get 30% OFF"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent outline-none transition"
                />
                <p className="mt-1 text-sm text-gray-500">The text displayed on the promotional banner</p>
              </div>

              {/* Product Selection */}
              <div>
                <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  id="product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent outline-none transition"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">The product customers will be directed to when clicking the banner</p>
              </div>

              {/* Discount Percentage */}
              <div>
                <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  id="discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moringa-green focus:border-transparent outline-none transition"
                />
                <p className="mt-1 text-sm text-gray-500">The discount percentage to display on the banner</p>
              </div>

              {/* Enable/Disable Toggle */}
              <div className="pt-2 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Status
                    </label>
                    <p className="text-xs text-gray-500">Show or hide the promotional banner on the home page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                      formData.is_active ? 'bg-moringa-green' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formData.is_active ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  Status: <span className={formData.is_active ? 'text-moringa-green font-bold' : 'text-red-500 font-bold'}>
                    {formData.is_active ? '🟢 ENABLED' : '🔴 DISABLED'}
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-moringa-green text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Banner Configuration'}
                </button>
              </div>
            </form>
          </div>

          {/* Information Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0">info</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Edit the banner text to customize your promotional message</li>
                  <li>Select the product that the banner will link to</li>
                  <li>Set the discount percentage to show on the banner</li>
                  <li>Changes appear immediately on the home page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            
            {selectedProduct ? (
              <div className="space-y-4">
                {/* Banner Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="inline-block bg-amber-500 text-white py-2.5 px-4 rounded-lg font-bold text-sm text-center w-full">
                    <div className="break-words text-xs">{formData.button_text || 'Button text...'}</div>
                  </div>
                </div>

                {/* Product Preview */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">DESTINATION PRODUCT</p>
                  <div className="space-y-2">
                    {selectedProduct.image && (
                      <img 
                        src={getFullImageUrl(selectedProduct.image)} 
                        alt={selectedProduct.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">{selectedProduct.name}</p>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Price with Discount:</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-moringa-green">
                          ₹{(selectedProduct.price || 0).toFixed(2)}
                        </span>
                        {selectedProduct.original_price && selectedProduct.price !== selectedProduct.original_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{selectedProduct.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-600 font-semibold mt-1">
                        {formData.discount_percentage}% OFF
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">
                    When users click the banner, they'll be directed to this product page with the discount highlighted.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">image_not_supported</span>
                <p className="text-sm">Select a product to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionBannerManagement
