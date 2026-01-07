import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Reviews from '../components/Reviews'

function ProductDetails() {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [purchaseType, setPurchaseType] = useState('subscribe')

  useEffect(() => {
    fetchProductDetails()
  }, [slug])

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/products`)
      const data = await response.json()
      if (data.success) {
        const foundProduct = data.data.find(p => p.slug === slug)
        setProduct(foundProduct || null)
        
        // Get related products (other products, excluding current one)
        const related = data.data.filter(p => p.slug !== slug).slice(0, 3)
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moringa-green"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-clay-brown mb-4">Product Not Found</h1>
        <Link to="/" className="text-moringa-green hover:underline">Return to Home</Link>
      </div>
    )
  }

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/images/placeholder.png`
    // If already has base URL, return as-is
    if (imgPath.includes(API_BASE_URL)) return imgPath
    // If it's a relative path, add base URL prefix
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    // If it's just a filename, add /images/ prefix
    return `${API_BASE_URL}/images/${imgPath}`
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => getFullImageUrl(img))
    : [`${API_BASE_URL}/uploads/images/placeholder.png`]

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta)
    setQuantity(newQuantity)
  }

  const handleQuantityInput = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setQuantity(value)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="flex-grow pt-4 sm:pt-6">
      
        

        {/* Product Details */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Product Images */}
            <div className="flex flex-col gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0 w-full">
              <div className="w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-grey/10">
                <img 
                  alt="Premium Organic Moringa Powder in a bowl" 
                  className="w-full h-full object-cover" 
                  src={productImages[selectedImage]}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {productImages.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md sm:rounded-lg overflow-hidden border hover:border-primary/50 bg-white p-1 sm:p-2 ${
                      selectedImage === index 
                        ? 'border-2 border-primary ring-2 ring-primary/20' 
                        : 'border-neutral-grey/20'
                    }`}
                  >
                    <img 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-contain" 
                      src={image}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-moringa-green/10 px-2.5 py-0.5 text-xs font-bold text-moringa-green uppercase tracking-wide">
                  100% Organic
                </span>
                {product.featured && (
                  <span className="inline-flex items-center rounded-full bg-golden-yellow/20 px-2.5 py-0.5 text-xs font-bold text-clay-brown uppercase tracking-wide">
                    Best Seller
                  </span>
                )}
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold text-[#111518] tracking-tight mb-1.5">{product.name}</h1>
              <p className="text-xs md:text-sm text-neutral-grey font-light mb-3">{product.short_description}</p>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex text-golden-yellow text-sm">
                  <span className="material-symbols-outlined fill-1 text-base">star</span>
                  <span className="material-symbols-outlined fill-1 text-base">star</span>
                  <span className="material-symbols-outlined fill-1 text-base">star</span>
                  <span className="material-symbols-outlined fill-1 text-base">star</span>
                  <span className="material-symbols-outlined fill-1 text-base">star_half</span>
                </div>
                <a className="text-xs font-medium text-primary hover:underline underline-offset-4" href="#reviews">4.8 (124 Reviews)</a>
              </div>

              <div className="text-neutral-grey mb-4 leading-relaxed text-xs md:text-sm">
                <p>{product.description}</p>
              </div>

              {/* Purchase Options */}
              <div className="bg-white rounded-lg border border-neutral-grey/20 p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
                <label className="flex items-start gap-3 cursor-pointer mb-3">
                  <input 
                    className="mt-1 h-4 w-4 text-primary border-neutral-grey/30 focus:ring-primary" 
                    name="purchase-type" 
                    type="radio" 
                    value="onetime"
                    checked={purchaseType === 'onetime'}
                    onChange={(e) => setPurchaseType(e.target.value)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#111518]">One-time purchase</span>
                      <span className="font-semibold text-sm text-[#111518]">${product.price}</span>
                    </div>
                  </div>
                </label>
                
                <hr className="border-neutral-grey/10 my-3"/>
                
                <label className="flex items-start gap-3 cursor-pointer relative">
                  <input 
                    className="mt-1 h-4 w-4 text-primary border-neutral-grey/30 focus:ring-primary" 
                    name="purchase-type" 
                    type="radio" 
                    value="subscribe"
                    checked={purchaseType === 'subscribe'}
                    onChange={(e) => setPurchaseType(e.target.value)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-primary">Subscribe & Save 10%</span>
                      <div className="text-right">
                        <span className="font-semibold text-sm text-primary block">${(product.price * 0.9).toFixed(2)}</span>
                        <span className="text-xs text-neutral-grey line-through">${product.price}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-grey mt-0.5">Flexible delivery every 30 days. Cancel anytime.</p>
                  </div>
                </label>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center rounded-full border border-neutral-grey/30 bg-white h-10 sm:h-12 w-full sm:w-28">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-full flex items-center justify-center text-neutral-grey hover:text-[#111518]"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <input 
                    className="w-full text-center border-none p-0 focus:ring-0 text-[#111518] font-bold h-full bg-transparent appearance-none" 
                    type="number" 
                    value={quantity}
                    onChange={handleQuantityInput}
                  />
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-full flex items-center justify-center text-neutral-grey hover:text-[#111518]"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                
                <button className="flex-1 rounded-full bg-primary h-10 sm:h-12 text-white font-semibold text-sm sm:text-base hover:bg-opacity-90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">shopping_cart</span>
                  Add to Cart
                </button>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-neutral-grey/20 pt-3 sm:pt-4">
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-moringa-green/10 flex items-center justify-center text-moringa-green">
                    <span className="material-symbols-outlined text-lg sm:text-xl">eco</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-clay-brown">100% Organic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-moringa-green/10 flex items-center justify-center text-moringa-green">
                    <span className="material-symbols-outlined text-lg sm:text-xl">science</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-clay-brown">Lab Tested</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-moringa-green/10 flex items-center justify-center text-moringa-green">
                    <span className="material-symbols-outlined text-lg sm:text-xl">grain</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-clay-brown">No Additives</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        

        {/* Customer Reviews */}
        <Reviews productId={product.id} slug={slug} />

        {/* Frequently Bought Together */}
        <section className="py-8 sm:py-12 md:py-16 bg-background-light">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-center text-xl md:text-2xl font-bold text-[#111518] tracking-tight mb-6">Frequently Bought Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.slug}`}
                  className="flex flex-col gap-3 group text-center"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200 relative">
                    {relatedProduct.status === 'active' && relatedProduct.stock_quantity < 20 && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded text-clay-brown z-10">
                        Selling Fast
                      </span>
                    )}
                    <img 
                      alt={relatedProduct.short_description || relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={relatedProduct.images && relatedProduct.images[0] 
                        ? `${API_BASE_URL}${relatedProduct.images[0]}` 
                        : `${API_BASE_URL}/uploads/images/placeholder.png`}
                      onError={(e) => {
                        e.target.src = `/uploads/images/placeholder.png`
                      }}
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#111518]">{relatedProduct.name}</h3>
                  <p className="text-primary font-bold">${relatedProduct.price}</p>
                  <button className="mt-2 w-full rounded-full border border-primary text-primary font-semibold py-2 hover:bg-primary hover:text-white transition-colors">Add to Cart</button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProductDetails