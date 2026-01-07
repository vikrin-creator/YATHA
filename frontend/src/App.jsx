import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import About from './pages/About'
import ProductDetails from './pages/ProductDetails'
import AuthPage from './components/AuthPage'

// Admin components
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import ProductManagement from './admin/pages/ProductManagement'
import ReviewManagement from './admin/pages/ReviewManagement'

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="orders" element={<div className="p-8 text-center text-gray-500">Order Management Coming Soon</div>} />
          <Route path="users" element={<div className="p-8 text-center text-gray-500">User Management Coming Soon</div>} />
        </Route>

        {/* Auth Route (without layout) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Routes */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
