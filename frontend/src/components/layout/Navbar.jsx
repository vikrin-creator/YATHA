import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import HeaderLogo from '../../assets/images/HeaderLogo.png'
import { isAuthenticated, logout, getCurrentUser } from '../../services/authService'
import AddressModal from '../AddressModal'

function Navbar() {
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8000" 
    : window.location.origin + '/backend';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const navigate = useNavigate()
  
  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`)
        const data = await response.json()
        if (data.success) {
          setAllProducts(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // Handle search input change
  useEffect(() => {
    if (searchInput.trim() === '') {
      setSearchResults([])
      setIsSearchOpen(false)
      return
    }

    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchInput.toLowerCase())
    )

    // Remove duplicates by ID
    const uniqueProducts = Array.from(new Map(filteredProducts.map(p => [p.id, p])).values())
    
    // Show only 5 results
    setSearchResults(uniqueProducts.slice(0, 5))
    setIsSearchOpen(true)
  }, [searchInput, allProducts])

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return `${API_BASE_URL}/public/uploads/images/placeholder.png`
    if (imgPath.startsWith('http')) return imgPath
    if (imgPath.startsWith('/')) return `${API_BASE_URL}${imgPath}`
    return `${API_BASE_URL}/public/uploads/images/${imgPath}`
  }

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    // Check authentication status on mount and when user menu is opened
    setIsLoggedIn(isAuthenticated())
    setUser(getCurrentUser())
  }, [isUserMenuOpen])

  useEffect(() => {
    // Update cart count from localStorage
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart')
      if (cart) {
        const items = JSON.parse(cart)
        const count = items.reduce((sum, item) => sum + item.quantity, 0)
        setCartCount(count)
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()

    // Listen for storage changes (for cross-tab updates)
    window.addEventListener('storage', updateCartCount)
    // Also listen for custom events (same tab updates)
    window.addEventListener('cartUpdated', updateCartCount)

    // Set up an interval to check cart every second
    const interval = setInterval(updateCartCount, 1000)

    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUser(null)
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-organic-beige/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-solid border-neutral-grey/20 py-3 md:py-4">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center flex-shrink-0">
            <img src={HeaderLogo} alt="YATHA" className="h-12 md:h-14 lg:h-16 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
             <Link to="/" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary">
              Home
            </Link>
            <Link to="/about" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary">
              About
            </Link>
            <a className="text-[#111518] text-sm font-medium leading-normal hover:text-primary" href="#">
              Contact
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon (Mobile) */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
              <span className="material-symbols-outlined">search</span>
            </button>
            
            {/* Search Bar (Desktop) */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <div className="relative">
                <input
                  className="form-input w-80 resize-none overflow-hidden rounded-full text-[#111518] border-2 border-neutral-grey/40 bg-white h-12 placeholder:text-neutral-grey/60 pl-5 pr-12 text-base font-normal shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Search products..."
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-grey/80">search</span>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-grey/20 z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/product/${product.slug}`)
                        setSearchInput('')
                        setIsSearchOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-organic-beige/20 transition-colors text-left border-b border-neutral-grey/10 last:border-b-0"
                    >
                      <div className="w-12 h-12 rounded bg-organic-beige flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={getFullImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `${API_BASE_URL}/public/uploads/images/placeholder.png`
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-neutral-grey/30">image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111518] truncate">{product.name}</p>
                        <p className="text-xs text-neutral-grey truncate">{product.short_description}</p>
                      </div>
                      <p className="text-sm font-bold text-primary flex-shrink-0">₹{product.price}</p>
                    </button>
                  ))}
                </div>
              )}

              {isSearchOpen && searchInput.trim() !== '' && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-grey/20 z-50 p-4 text-center">
                  <p className="text-neutral-grey text-sm">No products found</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {/* User Profile Dropdown - Desktop Only */}
              <div className="hidden sm:block relative" ref={userMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>
                  
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-grey/20 py-2"
                    style={{ zIndex: 9999 }}
                  >
                      {!isLoggedIn ? (
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            navigate('/auth')
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-[#111518] hover:bg-neutral-grey/10 font-medium"
                        >
                          Login / Sign Up
                        </button>
                      ) : (
                        <>
                          {/* User Info Section */}
                          {user && (
                            <div className="px-4 py-3 border-b border-neutral-grey/20">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#111518] truncate">
                                    {user.name || user.username || 'User'}
                                  </p>
                                  <p className="text-xs text-neutral-grey/80 truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/profile')
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">account_circle</span>
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              setShowAddressModal(true)
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">home</span>
                            My Address
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/profile?tab=orders')
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">shopping_bag</span>
                            My Orders
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/profile?tab=subscriptions')
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">subscriptions</span>
                            My Subscriptions
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">lock</span>
                            Change Password
                          </button>
                          
                          {/* Admin Panel Link - Only for Admin Users */}
                          {user && user.role === 'admin' && (
                            <>
                              <div className="border-t border-neutral-grey/20 my-2"></div>
                              <button 
                                onClick={() => {
                                  setIsUserMenuOpen(false)
                                  navigate('/admin')
                                }}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-semibold hover:bg-primary/10 w-full"
                              >
                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                Admin Panel
                              </button>
                            </>
                          )}
                          
                          <div className="border-t border-neutral-grey/20 my-2"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Logout
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>
              
              <button
                onClick={() => navigate('/cart')}
                className="relative flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
                <span className="material-symbols-outlined">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10"
              >
                <span className="material-symbols-outlined">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-grey/20 bg-organic-beige/95 backdrop-blur-md">
            <nav className="flex flex-col py-4 space-y-4">
              {/* Mobile User Menu */}
              <div className="px-4 pb-2 border-b border-neutral-grey/20">
                {!isLoggedIn ? (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      navigate('/auth')
                    }}
                    className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full text-left"
                  >
                    <span className="material-symbols-outlined">person</span>
                    Login / Sign Up
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* User Info in Mobile Menu */}
                    {user && (
                      <div className="flex items-center gap-3 py-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111518] truncate">
                            {user.name || user.username || 'User'}
                          </p>
                          <p className="text-xs text-neutral-grey/80 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/profile')
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">account_circle</span>
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setShowAddressModal(true)
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">home</span>
                      My Address
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/profile?tab=orders')
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_bag</span>
                      My Orders
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        navigate('/profile?tab=subscriptions')
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">subscriptions</span>
                      My Subscriptions
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">lock</span>
                      Change Password
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 text-red-600 text-sm font-medium leading-normal hover:text-red-700 py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <Link to="/" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary px-4">
                Home
              </Link>
              <Link to="/about" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary px-4">
                About
              </Link>
              <a className="text-[#111518] text-sm font-medium leading-normal hover:text-primary px-4" href="#">
                Contact
              </a>
            </nav>
          </div>
        )}

        {/* Address Modal (opened from profile dropdown) */}
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onAddressSaved={() => {
            setShowAddressModal(false)
          }}
        />

        {/* Mobile Search Modal */}
        {isMobileSearchOpen && (
          <div className="md:hidden border-b border-neutral-grey/20 bg-organic-beige/95 backdrop-blur-md p-4">
            <div className="relative" ref={mobileSearchRef}>
              <input
                autoFocus
                className="w-full rounded-full text-[#111518] border-2 border-neutral-grey/40 bg-white h-11 placeholder:text-neutral-grey/60 pl-5 pr-12 text-sm font-normal shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Search products..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-grey/80">search</span>

              {/* Mobile Search Results */}
              {searchInput.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-grey/20 z-50 max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.slug}`)
                          setSearchInput('')
                          setIsMobileSearchOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-organic-beige/20 transition-colors text-left border-b border-neutral-grey/10 last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded bg-organic-beige flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={getFullImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `${API_BASE_URL}/public/uploads/images/placeholder.png`
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-neutral-grey/30 text-sm">image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111518] truncate">{product.name}</p>
                          <p className="text-xs text-neutral-grey truncate">{product.short_description}</p>
                        </div>
                        <p className="text-xs font-bold text-primary flex-shrink-0">₹{product.price}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-neutral-grey text-sm">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
