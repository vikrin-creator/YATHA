import { Link } from 'react-router-dom'
import { useState } from 'react'
import HeaderLogo from '../assets/images/HeaderLogo.png'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-organic-beige/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-solid border-neutral-grey/20 py-3 md:py-4">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center flex-shrink-0">
            <img src={HeaderLogo} alt="YATHA" className="h-10 md:h-12 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
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
            <label className="relative hidden lg:flex">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-grey">search</span>
              <input
                className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#111518] border-neutral-grey/30 bg-white/50 h-10 placeholder:text-neutral-grey pl-10 pr-4 text-sm font-normal"
                placeholder="Search"
                type="text"
              />
            </label>
            <div className="flex gap-2">
              <button className="hidden sm:flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
                <span className="material-symbols-outlined">person</span>
              </button>
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
