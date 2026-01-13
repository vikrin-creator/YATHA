import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import About from './pages/About'
import ProductDetails from './pages/ProductDetails'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import TermsOfService from './pages/TermsOfService'
import ShippingPolicy from './pages/ShippingPolicy'
import AuthPage from './components/AuthPage'

// Admin components
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import ProductManagement from './admin/pages/ProductManagement'
import ReviewManagement from './admin/pages/ReviewManagement'
import FAQManagement from './admin/pages/FAQManagement'
import UserManagement from './admin/pages/UserManagement'

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="faqs" element={<FAQManagement />} />
          <Route path="orders" element={<div className="p-8 text-center text-gray-500">Order Management Coming Soon</div>} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Auth Route (without layout) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Routes */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
