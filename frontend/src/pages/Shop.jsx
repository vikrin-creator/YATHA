import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/public/uploads/images/placeholder.png`
    if (imgPath.startsWith('http')) return imgPath
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    return `${API_BASE_URL}/public/uploads/images/${imgPath}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-organic-beige/30 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-clay-brown tracking-tight">
            Shop All Products
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-grey">
            Discover our complete collection of raw, organic superfoods.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="flex flex-col gap-3 group text-center"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200 relative">
                  {product.status === 'active' && product.stock_quantity < 20 && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded text-clay-brown z-10">
                      Low Stock
                    </span>
                  )}
                  <img
                    alt={product.short_description || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={product.image 
                      ? getFullImageUrl(product.image)
                      : `${API_BASE_URL}/public/uploads/images/placeholder.png`}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
                    No Image
                  </div>
                </div>
                <div>
                  <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-[#111518]">
                    {product.name}
                  </h3>
                  {product.price && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-moringa-green">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <span className="material-symbols-outlined text-5xl text-neutral-grey/20 block mb-3">
              shopping_bag
            </span>
            <p className="text-neutral-grey text-lg">
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
