import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Link2, 
  Users, 
  Settings, 
  Home,
  TrendingUp,
  MousePointer,
  Calendar,
  LogOut
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { blink } from '../blink/client'
import AnalyticsPage from './admin/AnalyticsPage'
import LinkManagementPage from './admin/LinkManagementPage'
import UserManagementPage from './admin/UserManagementPage'

interface AdminDashboardProps {
  user: any
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const location = useLocation()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3, current: location.pathname === '/admin' },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp, current: location.pathname === '/admin/analytics' },
    { name: 'Links', href: '/admin/links', icon: Link2, current: location.pathname === '/admin/links' },
    { name: 'Users', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users' },
  ]

  const stats = [
    { name: 'Total Links', value: '1,234', change: '+12%', icon: Link2 },
    { name: 'Total Clicks', value: '45,678', change: '+8%', icon: MousePointer },
    { name: 'Active Users', value: '89', change: '+23%', icon: Users },
    { name: 'This Month', value: '2,345', change: '+15%', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Pti Admin</h1>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-1">
            <Link
              to="/"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <Home className="mr-3 h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </nav>
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => blink.auth.logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DashboardOverview stats={stats} />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/links" element={<LinkManagementPage />} />
              <Route path="/users" element={<UserManagementPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function DashboardOverview({ stats }: { stats: any[] }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your URL shortener performance and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-green-700 bg-green-50">
                  {stat.change}
                </Badge>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription>Latest shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      pti.ly/abc{i}23
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      https://example.com/very-long-url-{i}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {Math.floor(Math.random() * 100)} clicks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Most clicked links this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      pti.ly/top{i}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      https://popular-site-{i}.com
                    </p>
                  </div>
                  <Badge>
                    {1000 - i * 150} clicks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}