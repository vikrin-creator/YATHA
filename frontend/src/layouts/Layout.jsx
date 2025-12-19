import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-organic-beige">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
