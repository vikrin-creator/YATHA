function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-3xl text-blue-600">inventory_2</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-gray-600">Products</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-3xl text-green-600">receipt_long</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-3xl text-purple-600">group</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-gray-600">Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-3xl text-orange-600">trending_up</span>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-gray-600">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/admin/products" className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 mr-3">add_box</span>
              <span className="text-gray-900">Add New Product</span>
            </a>
            <a href="/admin/orders" className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 mr-3">receipt_long</span>
              <span className="text-gray-900">View Orders</span>
            </a>
            <a href="/admin/users" className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-purple-600 mr-3">person_add</span>
              <span className="text-gray-900">Manage Users</span>
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-gray-600 mr-3">info</span>
              <span className="text-gray-600">Admin panel initialized</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="material-symbols-outlined text-gray-600 mr-3">database</span>
              <span className="text-gray-600">Database schema created</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard