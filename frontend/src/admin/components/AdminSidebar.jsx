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
    <div className={`bg-organic-beige text-clay-brown h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-clay-brown/10 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-clay-brown">YATHA Admin</h1>
            <p className="text-sm text-clay-brown/70">Management Panel</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-moringa-green/10 rounded-lg transition-colors text-clay-brown"
        >
          <span className="material-symbols-outlined text-lg">
            {isCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-moringa-green text-white'
                    : 'hover:bg-moringa-green/10 text-clay-brown/90 hover:text-clay-brown'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-clay-brown text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-2 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <div className="flex items-center gap-3 px-3 py-2 text-clay-brown/80">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-clay-brown">Admin User</p>
              <p className="text-xs text-clay-brown/70">admin@yatha.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar