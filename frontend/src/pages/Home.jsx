import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroImage from '../assets/images/HeroSection.png'

function Home() {
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
        // Filter featured products or take first 4
        const featuredProducts = data.data.filter(product => product.featured).slice(0, 4)
        setProducts(featuredProducts.length > 0 ? featuredProducts : data.data.slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/public/uploads/images/placeholder.png`
    // If already has full URL, return as-is
    if (imgPath.startsWith('http')) return imgPath
    // If it's an absolute path, prepend base URL
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    // If it's just a filename, add full path
    return `${API_BASE_URL}/public/uploads/images/${imgPath}`
  }

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative w-full min-h-[60vh] md:min-h-[75vh] flex items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${HeroImage})`
        }}
      >
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Purity in Every Scoop 
          </h1>
          <p className="text-3xl sm:text-4xl md:text-5xl font-medium mt-2">
            Wellness in Every Sip
          </p>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-light text-amber-500">
            Raw, organic superfoods sourced with integrity for your daily vitality.
          </p>
          <div className="mt-6 sm:mt-8">
            <div className="inline-block bg-amber-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg cursor-pointer hover:bg-amber-600 hover:scale-105 hover:shadow-lg transition-all duration-300">
              <span className="text-xl font-black">Buy Moringa</span> this month and get 30% OFF
            </div>
          </div>
        </div>
      </section>

      {/* Why YATHA Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Why YATHA?</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-grey">
              Our philosophy is simple: pure, transparent, and unadulterated. We bring you the power of nature, exactly as it was intended.
            </p>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">eco</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Preservatives</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                We keep it clean. Our powders are free from any synthetic preservatives, ensuring you get only the purest ingredients.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">science</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Additives</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                Just one ingredient. We never use fillers, binders, or any artificial additives. What you see is what you get.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">recycling</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Artificial Processing</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                Our superfoods are gently dried and minimally processed to preserve their natural nutrient density and potency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Shop All Products</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green"></div>
            </div>
          ) : (
            <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
                        // Show placeholder div if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
                      No Image
                    </div>
                  </div>
                  <div>
                    <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-[#111518]">{product.name}</h3>
                    {product.price && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-lg font-bold text-moringa-green">${product.price}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-4 sm:py-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="bg-soft-lavender rounded-xl p-6 sm:p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Subscribe &amp; Save 10% Every Month</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
              Never run out of your favorite superfoods. Get them delivered to your door and enjoy a permanent discount on every order. It's wellness, simplified.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  )
}

export default Home
