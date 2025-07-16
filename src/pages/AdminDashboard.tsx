import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Link2, 
  Users, 
  Home,
  TrendingUp,
  MousePointer,
  Calendar,
  LogOut,
  Activity
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { blink } from '../blink/client'
import { db, UrlRecord } from '../lib/database'
import AnalyticsPage from './admin/AnalyticsPage'
import LinkManagementPage from './admin/LinkManagementPage'
import UserManagementPage from './admin/UserManagementPage'

interface AdminDashboardProps {
  user: any
}

interface DashboardStats {
  totalUrls: number
  totalClicks: number
  activeUrls: number
  recentClicks: number
  topUrls: UrlRecord[]
  dailyClicks: Array<{ date: string; clicks: number }>
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
              <Route path="/" element={<DashboardOverview user={user} />} />
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

function DashboardOverview({ user }: { user: any }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const analytics = await db.getAnalytics()
      setStats(analytics)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
        <Button onClick={loadDashboardStats} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const statCards = [
    { 
      name: 'Total Links', 
      value: stats.totalUrls.toLocaleString(), 
      change: '+12%', 
      icon: Link2,
      description: 'All shortened URLs'
    },
    { 
      name: 'Total Clicks', 
      value: stats.totalClicks.toLocaleString(), 
      change: '+8%', 
      icon: MousePointer,
      description: 'All time clicks'
    },
    { 
      name: 'Active Links', 
      value: stats.activeUrls.toLocaleString(), 
      change: '+23%', 
      icon: Activity,
      description: 'Currently active URLs'
    },
    { 
      name: 'Recent Clicks', 
      value: stats.recentClicks.toLocaleString(), 
      change: '+15%', 
      icon: Calendar,
      description: 'Last 30 days'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your URL shortener performance and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
            {stats.topUrls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No links created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topUrls.slice(0, 5).map((url) => (
                  <div key={url.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        /{url.shortCode}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {url.originalUrl}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!url.isActive && (
                        <Badge variant="secondary" className="text-red-600 bg-red-50">
                          Inactive
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {url.clicks} clicks
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topUrls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MousePointer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No click data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topUrls
                  .filter(url => url.clicks > 0)
                  .sort((a, b) => b.clicks - a.clicks)
                  .slice(0, 5)
                  .map((url) => (
                    <div key={url.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          /{url.shortCode}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <Badge>
                        {url.clicks} clicks
                      </Badge>
                    </div>
                  ))}
                {stats.topUrls.filter(url => url.clicks > 0).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No clicks recorded yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/links">
                <Link2 className="w-4 h-4 mr-2" />
                Manage Links
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Create New Link
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}