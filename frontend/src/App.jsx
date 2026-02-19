import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import ProductDetails from './pages/ProductDetails'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import TermsOfService from './pages/TermsOfService'
import ShippingPolicy from './pages/ShippingPolicy'
import AuthPage from './components/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'

// Admin components
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import ProductManagement from './admin/pages/ProductManagement'
import ReviewManagement from './admin/pages/ReviewManagement'
import FAQManagement from './admin/pages/FAQManagement'
import OrderManagement from './admin/pages/OrderManagement'
import OrderDetails from './admin/pages/OrderDetails'
import UserManagement from './admin/pages/UserManagement'
import SubscriptionManagement from './admin/pages/SubscriptionManagement'
import PromotionBannerManagement from './admin/pages/PromotionBannerManagement'

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />          <Route path="promotions" element={<PromotionBannerManagement />} />          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="faqs" element={<FAQManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
        </Route>

        {/* Auth Route (without layout) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Routes */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } />
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
