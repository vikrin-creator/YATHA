import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import HeaderLogo from '../../assets/images/HeaderLogo.png'
import { isAuthenticated, logout } from '../../services/authService'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    // Check authentication status on mount and when user menu is opened
    setIsLoggedIn(isAuthenticated())
  }, [isUserMenuOpen])

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
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-organic-beige/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-solid border-neutral-grey/20 py-3 md:py-4">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center flex-shrink-0">
            <img src={HeaderLogo} alt="YATHA" className="h-8 md:h-10 lg:h-12 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
             <Link to="/" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary">
              Home
            </Link>
            <Link to="/" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary">
              Shop
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
            <button className="lg:hidden flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
              <span className="material-symbols-outlined">search</span>
            </button>
            
            {/* Search Bar (Desktop) */}
            <label className="relative hidden lg:flex">
              <input
                className="form-input w-80 resize-none overflow-hidden rounded-full text-[#111518] border-2 border-neutral-grey/40 bg-white h-12 placeholder:text-neutral-grey/60 pl-5 pr-12 text-base font-normal shadow-sm"
                placeholder="Search"
                type="text"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-grey/80">search</span>
            </label>
            <div className="flex gap-2">
              {/* User Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10"
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
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">account_circle</span>
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">home</span>
                            My Address
                          </button>
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111518] hover:bg-neutral-grey/10 w-full"
                          >
                            <span className="material-symbols-outlined text-lg">shopping_bag</span>
                            My Orders
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
              
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
                <span className="material-symbols-outlined">shopping_bag</span>
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
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">account_circle</span>
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">home</span>
                      My Address
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 text-[#111518] text-sm font-medium leading-normal hover:text-primary py-2 w-full"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_bag</span>
                      My Orders
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
              <Link to="/" onClick={scrollToTop} className="text-[#111518] text-sm font-medium leading-normal hover:text-primary px-4">
                Shop
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
      </div>
    </header>
  )
}

export default Navbar
