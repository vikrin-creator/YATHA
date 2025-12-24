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
