import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  Link2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { db, UrlRecord } from '../../lib/database'

interface UserStats {
  userId: string
  email: string
  totalUrls: number
  totalClicks: number
  activeUrls: number
  lastActivity: string
  joinedAt: string
}

export default function UserManagementPage() {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUserStats()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [userStats, searchTerm])

  const loadUserStats = async () => {
    try {
      setLoading(true)
      const allUrls = await db.getAllUrls()
      
      // Group URLs by user
      const userUrlMap: { [userId: string]: UrlRecord[] } = {}
      allUrls.forEach(url => {
        if (!userUrlMap[url.userId]) {
          userUrlMap[url.userId] = []
        }
        userUrlMap[url.userId].push(url)
      })

      // Calculate stats for each user
      const stats: UserStats[] = Object.entries(userUrlMap).map(([userId, urls]) => {
        const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
        const activeUrls = urls.filter(url => url.isActive).length
        const lastActivity = urls.reduce((latest, url) => 
          new Date(url.updatedAt) > new Date(latest) ? url.updatedAt : latest
        , urls[0]?.updatedAt || new Date().toISOString())
        const joinedAt = urls.reduce((earliest, url) => 
          new Date(url.createdAt) < new Date(earliest) ? url.createdAt : earliest
        , urls[0]?.createdAt || new Date().toISOString())

        return {
          userId,
          email: userId, // In a real app, this would be fetched from user data
          totalUrls: urls.length,
          totalClicks,
          activeUrls,
          lastActivity,
          joinedAt
        }
      })

      // Sort by total clicks descending
      stats.sort((a, b) => b.totalClicks - a.totalClicks)
      
      setUserStats(stats)
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(userStats)
      return
    }

    const filtered = userStats.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredUsers(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActivityStatus = (lastActivity: string) => {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceActivity <= 1) return { status: 'Active', color: 'bg-green-100 text-green-800' }
    if (daysSinceActivity <= 7) return { status: 'Recent', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalUsers = userStats.length
  const activeUsers = userStats.filter(user => 
    getActivityStatus(user.lastActivity).status === 'Active'
  ).length
  const totalUrls = userStats.reduce((sum, user) => sum + user.totalUrls, 0)
  const totalClicks = userStats.reduce((sum, user) => sum + user.totalClicks, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Monitor user activity and engagement</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{totalUrls}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {totalUsers} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
              <p className="text-sm">Try adjusting your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Links Created</TableHead>
                    <TableHead>Total Clicks</TableHead>
                    <TableHead>Active Links</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const activityStatus = getActivityStatus(user.lastActivity)
                    
                    return (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.email[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.email}</p>
                              <p className="text-sm text-gray-500">ID: {user.userId.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {user.totalUrls}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.totalClicks}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.activeUrls} / {user.totalUrls}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={activityStatus.color}>
                            {activityStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(user.joinedAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link2 className="w-4 h-4 mr-2" />
                                View Links
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Users with most links created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.totalClicks} total clicks
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {user.totalUrls} links
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Users with recent link activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats
                .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                .slice(0, 5)
                .map((user) => {
                  const activityStatus = getActivityStatus(user.lastActivity)
                  return (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.email[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Last active: {formatDate(user.lastActivity)}
                          </p>
                        </div>
                      </div>
                      <Badge className={activityStatus.color}>
                        {activityStatus.status}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}