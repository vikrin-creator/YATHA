import { Link } from 'react-router-dom'
import FooterLogo from '../assets/images/FooterLogo.png'

function Footer() {
  return (
    <footer className="bg-white/50 border-t border-neutral-grey/20 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center">
              <img src={FooterLogo} alt="YATHA" className="h-16 sm:h-20 md:h-24" />
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-neutral-grey">Purity in every scoop. Raw, organic superfoods for your daily wellness.</p>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#111518]">Shop</h3>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-grey">
              <li><a className="hover:text-primary" href="#">All Products</a></li>
              <li><a className="hover:text-primary" href="#">Moringa</a></li>
              <li><a className="hover:text-primary" href="#">Beetroot</a></li>
              <li><a className="hover:text-primary" href="#">Bundles</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#111518]">About</h3>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-grey">
              <li><a className="hover:text-primary" href="#">Our Story</a></li>
              <li><a className="hover:text-primary" href="#">Blog</a></li>
              <li><a className="hover:text-primary" href="#">Contact Us</a></li>
              <li><a className="hover:text-primary" href="#">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#111518]">Support</h3>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-grey">
              <li><a className="hover:text-primary" href="#">Shipping &amp; Returns</a></li>
              <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 border-t border-neutral-grey/20 pt-6 sm:pt-8 flex justify-center items-center text-xs sm:text-sm text-neutral-grey">
          <p className="text-center">
            © 2025 <Link to="/" className="text-[#111518]  hover:text-primary transition-colors">YATHA</Link>. All rights reserved. | Designed and Developed by <a href="https://www.vikrin.com/" target="_blank" rel="noopener noreferrer" className="text-[#111518] hover:text-primary transition-colors">Vikrin</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
