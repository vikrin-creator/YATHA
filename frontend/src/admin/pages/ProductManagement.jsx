import { useState, useEffect } from 'react'

function ProductManagement() {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category: 'Superfood Powders',
    status: 'active',
    featured: false,
    image: ''
  })
  const [imageFiles, setImageFiles] = useState({
    main: null,
    additional: [null, null, null]
  })
  const [imagePreview, setImagePreview] = useState({
    main: '',
    additional: ['', '', '']
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    // Prevent multiple fetches at once
    if (isFetching) {
      console.log('⚠️ Fetch already in progress, skipping...')
      return
    }
    
    setIsFetching(true)
    console.log('📥 Starting fetchProducts...')
    
    try {
      const response = await fetch('http://localhost:8000/api/products')
      console.log('✅ Received response:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 Data received:', data)
      
      if (data.success) {
        setProducts(data.data)
        console.log('✅ Products updated:', data.data.length)
      } else {
        console.error('❌ API returned error:', data.message)
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
    } finally {
      setIsFetching(false)
      setLoading(false)
      console.log('✅ fetchProducts completed')
    }
  }

  const handleCloseModal = () => {
    // Clean up preview URLs to prevent memory leaks
    if (imagePreview.main && imagePreview.main.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.main)
    }
    imagePreview.additional.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    
    // Reset all form state
    setShowAddModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      category: 'Superfood Powders',
      status: 'active',
      featured: false,
      images: []
    })
    setImageFiles({ main: null, additional: [null, null, null] })
    setImagePreview({ main: '', additional: ['', '', ''] })
    setUploading(false)
  }
  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      category: 'Superfood Powders',
      status: 'active',
      featured: false,
      images: []
    })
    setImageFiles({ main: null, additional: [null, null, null] })
    setImagePreview({ main: '', additional: ['', '', ''] })
    setShowAddModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price || '',
      original_price: product.original_price || '',
      stock_quantity: product.stock_quantity || '',
      category: product.category || 'Superfood Powders',
      status: product.status || 'active',
      featured: product.featured || false,
      image: product.image || ''
    })
    
    // Helper to construct full image URL from database path
    const getFullImageUrl = (imgPath) => {
      if (!imgPath) return ''
      if (imgPath.startsWith('http')) return imgPath
      if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
      return `${API_BASE_URL}/uploads/images/${imgPath}`
    }
    
    // Set main image preview
    const mainImage = product.image ? getFullImageUrl(product.image) : ''
    
    // Set additional images preview
    const additionalPreviews = ['', '', '']
    if (product.additional_images && Array.isArray(product.additional_images)) {
      product.additional_images.forEach((img, index) => {
        if (index < 3) {
          additionalPreviews[index] = getFullImageUrl(img)
        }
      })
    }
    
    setImagePreview({
      main: mainImage,
      additional: additionalPreviews
    })
    setImageFiles({ main: null, additional: [null, null, null] })
    setShowAddModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleImageChange = (e, type, index = null) => {
    const file = e.target.files[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    if (type === 'main') {
      setImageFiles(prev => ({ ...prev, main: file }))
      setImagePreview(prev => ({ ...prev, main: previewUrl }))
    } else {
      setImageFiles(prev => ({
        ...prev,
        additional: prev.additional.map((f, i) => i === index ? file : f)
      }))
      setImagePreview(prev => ({
        ...prev,
        additional: prev.additional.map((url, i) => i === index ? previewUrl : url)
      }))
    }
  }

  const uploadImage = async (file) => {
    console.log('🖼️ uploadImage called with file:', file.name)
    
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      console.log('📤 Sending to /api/upload-image')
      const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
        method: 'POST',
        body: formData
      })
      
      console.log('✅ Upload response status:', response.status)
      const data = await response.json()
      console.log('📦 Upload response:', data)
      
      if (data.success && data.data && data.data.url) {
        console.log('✅ Image uploaded successfully:', data.data.url)
        return data.data.url
      } else {
        console.error('❌ Upload failed:', data.message || 'Unknown error')
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    console.log('🚀 Form submit started')
    
    try {
      // Upload main image
      let mainImageUrl = ''
      if (imageFiles.main) {
        console.log('📸 Uploading main image...')
        mainImageUrl = await uploadImage(imageFiles.main)
        console.log('✅ Main image uploaded:', mainImageUrl)
      } else if (imagePreview.main && !imagePreview.main.startsWith('blob:')) {
        if (imagePreview.main.includes(API_BASE_URL)) {
          mainImageUrl = imagePreview.main.substring(API_BASE_URL.length)
        } else {
          mainImageUrl = imagePreview.main
        }
        console.log('♻️ Using existing main image:', mainImageUrl)
      }
      
      // Upload additional images
      const additionalImageUrls = []
      for (let i = 0; i < imageFiles.additional.length; i++) {
        const file = imageFiles.additional[i]
        if (file) {
          console.log(`📸 Uploading additional image ${i + 1}...`)
          const url = await uploadImage(file)
          additionalImageUrls.push(url)
          console.log(`✅ Additional image ${i + 1} uploaded:`, url)
        } else if (imagePreview.additional[i] && !imagePreview.additional[i].startsWith('blob:')) {
          // Keep existing additional image
          let url = imagePreview.additional[i]
          if (url.includes(API_BASE_URL)) {
            url = url.substring(API_BASE_URL.length)
          }
          additionalImageUrls.push(url)
        }
      }
      
      const productData = {
        ...formData,
        image: mainImageUrl,
        additional_images: additionalImageUrls
      }
      
      console.log('📤 Product data ready:', productData)
      
      let response
      if (editingProduct) {
        console.log(`🔄 PUT request to: /api/products/${editingProduct.id}`)
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      } else {
        console.log(`➕ POST request to: /api/products`)
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      }
      
      console.log('✅ Response received:', response.status)
      const data = await response.json()
      console.log('📦 Response data:', data)
      
      if (data.success || response.ok) {
        console.log('✅ Save successful')
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        handleCloseModal()
        console.log('🔄 Refetching products...')
        setTimeout(() => fetchProducts(), 300)
      } else {
        console.error('❌ API error:', data)
        alert(data.message || 'Failed to save product')
      }
    } catch (error) {
      console.error('❌ Catch error:', error)
      alert('Error saving product: ' + error.message)
    } finally {
      setUploading(false)
      console.log('✅ Form submit ended')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          setProducts(products.filter(p => p.id !== productId))
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.inactive}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your products, inventory, and pricing</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-moringa-green text-white px-4 py-2 rounded-lg hover:bg-moringa-green/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-blue-600">inventory_2</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-gray-600 text-sm">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-green-600">trending_up</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'active').length}</p>
              <p className="text-gray-600 text-sm">Active Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-orange-600">warning</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.stock_quantity < 20).length}</p>
              <p className="text-gray-600 text-sm">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-purple-600">star</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.featured).length}</p>
              <p className="text-gray-600 text-sm">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img 
                          className="h-12 w-12 rounded-lg object-cover" 
                          src={product.image 
                            ? (product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image.startsWith('/') ? product.image : '/' + product.image}`)
                            : `${API_BASE_URL}/uploads/images/placeholder.png`}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = `${API_BASE_URL}/uploads/images/placeholder.png`
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                    {product.original_price && (
                      <div className="text-sm text-gray-500 line-through">${product.original_price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${product.stock_quantity < 20 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {product.stock_quantity} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(product.status)}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.featured ? (
                      <span className="material-symbols-outlined text-golden-yellow">star</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300">star</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6" onReset={handleCloseModal}>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Product Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      maxLength="500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                      <input
                        type="number"
                        name="original_price"
                        value={formData.original_price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      >
                        <option value="Superfood Powders">Superfood Powders</option>
                        <option value="Herbal Supplements">Herbal Supplements</option>
                        <option value="Organic Products">Organic Products</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-moringa-green focus:border-moringa-green"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-moringa-green focus:ring-moringa-green"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Featured Product</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                      {imagePreview.main ? (
                        <div className="relative">
                          <img src={imagePreview.main} alt="Main preview" className="w-full h-32 object-cover rounded" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setImagePreview(prev => ({ ...prev, main: '' }))
                              setImageFiles(prev => ({ ...prev, main: null }))
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-20"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-center cursor-pointer">
                          <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
                          <p className="text-gray-500 text-sm mt-2">Click to upload main image</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'main')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (up to 3)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-2 relative cursor-pointer hover:border-moringa-green transition-colors">
                          {imagePreview.additional[index] ? (
                            <div className="relative">
                              <img src={imagePreview.additional[index]} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setImagePreview(prev => ({
                                    ...prev,
                                    additional: prev.additional.map((url, i) => i === index ? '' : url)
                                  }))
                                  setImageFiles(prev => ({
                                    ...prev,
                                    additional: prev.additional.map((file, i) => i === index ? null : file)
                                  }))
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 z-20"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="text-center h-20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-400 text-2xl">add_photo_alternate</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'additional', index)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCloseModal()
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-moringa-green text-white rounded-lg hover:bg-moringa-green/90 transition-colors flex items-center gap-2"
                  disabled={uploading}
                >
                  {uploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {uploading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement