import { Link, useLocation } from 'react-router-dom'

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: 'dashboard'
    },
    {
      title: 'Product Management',
      path: '/admin/products',
      icon: 'inventory_2'
    },
    {
      title: 'Promotion Banner',
      path: '/admin/promotions',
      icon: 'campaign'
    },
    {
      title: 'Review Management',
      path: '/admin/reviews',
      icon: 'rate_review'
    },
    {
      title: 'Order Management', 
      path: '/admin/orders',
      icon: 'receipt_long'
    },
    {
      title: 'Subscription Management',
      path: '/admin/subscriptions',
      icon: 'subscriptions'
    },
    {
      title: 'FAQ Management',
      path: '/admin/faqs',
      icon: 'help'
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: 'group'
    }
  ]

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className={`bg-organic-beige shadow-lg text-gray-800 h-screen fixed left-0 top-0 z-50 transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-[#E8D4C0] flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-900">YATHA</h1>
            <p className="text-xs text-gray-600 font-medium">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[#E8D4C0] rounded-lg transition-colors text-gray-700 hover:text-gray-900 ml-auto"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <span className="material-symbols-outlined text-lg">
            {isCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive(item.path)
                    ? 'bg-[#1873B8] text-white shadow-md'
                    : 'text-gray-700 hover:bg-[#E8D4C0] hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-20 bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AdminSidebar