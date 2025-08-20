import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Menu, 
  X,
  Building2,
  Search,
  Award,
  UserPlus,
  TrendingUp
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/', icon: BarChart3, label: 'Dashboard' },
        { path: '/analytics', icon: TrendingUp, label: 'Analytics' }
      ]
    },
    {
      title: 'Talent Pipeline',
      items: [
        { path: '/recruit', icon: Search, label: 'Recruit' },
        { path: '/candidates', icon: Users, label: 'Candidates' },
        { path: '/interviews', icon: Calendar, label: 'Interviews' },
        { path: '/offers', icon: FileText, label: 'Offers' }
      ]
    },
    {
      title: 'Post-Hire',
      items: [
        { path: '/hired', icon: UserPlus, label: 'Hired' },
        { path: '/onboard', icon: Award, label: 'Onboard' }
      ]
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">TalentHub</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title} className={groupIndex > 0 ? 'mt-8' : ''}>
                <div className="px-4 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1
                      ${isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Bottom section for user info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">HR</span>
              </div>
              <span className="text-sm font-medium text-gray-700">HR Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="lg:hidden flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">HR</span>
              </div>
              <span className="text-sm font-medium text-gray-700">HR Manager</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout