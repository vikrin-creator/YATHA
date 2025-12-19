import { Link } from 'react-router-dom'
import HeaderLogo from '../assets/images/HeaderLogo.png'

function Navbar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 bg-organic-beige/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center justify-center whitespace-nowrap border-b border-solid border-neutral-grey/20 py-6 relative">
          <Link to="/" onClick={scrollToTop} className="flex items-center absolute left-0">
            <img src={HeaderLogo} alt="YATHA" className="h-16" />
          </Link>
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
          <div className="flex items-center gap-4 absolute right-0">
            <label className="relative hidden sm:flex">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-grey">search</span>
              <input
                className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#111518] border-neutral-grey/30 bg-white/50 h-10 placeholder:text-neutral-grey pl-10 pr-4 text-sm font-normal"
                placeholder="Search"
                type="text"
              />
            </label>
            <div className="flex gap-2">
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
                <span className="material-symbols-outlined">person</span>
              </button>
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-white/50 text-[#111518] hover:bg-neutral-grey/10">
                <span className="material-symbols-outlined">shopping_bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
