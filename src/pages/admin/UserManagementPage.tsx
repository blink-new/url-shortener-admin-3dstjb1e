import { useState } from 'react'
import { Search, MoreHorizontal, UserPlus, Shield, Ban, Mail } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { useToast } from '../../hooks/use-toast'

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const mockUsers = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'admin',
      status: 'active',
      linksCount: 45,
      totalClicks: 12345,
      joinedAt: '2024-01-10',
      lastActive: '2024-01-16'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'user',
      status: 'active',
      linksCount: 23,
      totalClicks: 5678,
      joinedAt: '2024-01-12',
      lastActive: '2024-01-15'
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      role: 'user',
      status: 'suspended',
      linksCount: 12,
      totalClicks: 890,
      joinedAt: '2024-01-08',
      lastActive: '2024-01-14'
    },
    {
      id: '4',
      email: 'alice.brown@example.com',
      name: 'Alice Brown',
      role: 'moderator',
      status: 'active',
      linksCount: 67,
      totalClicks: 23456,
      joinedAt: '2024-01-05',
      lastActive: '2024-01-16'
    },
  ]

  const handleUserAction = (action: string, userId: string, userName: string) => {
    const actions = {
      promote: `${userName} has been promoted to admin`,
      suspend: `${userName} has been suspended`,
      activate: `${userName} has been activated`,
      delete: `${userName} has been deleted`,
      email: `Email sent to ${userName}`
    }

    toast({
      title: "Action Completed",
      description: actions[action as keyof typeof actions],
      variant: action === 'delete' || action === 'suspend' ? 'destructive' : 'default'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = mockUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +5.2%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1,156</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +2.1%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">78</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-red-700 bg-red-50">
                -12.3%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +18.7%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">All Users</Button>
              <Button variant="outline">Active</Button>
              <Button variant="outline">Suspended</Button>
              <Button variant="outline">Admins</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Total Clicks</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.linksCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.totalClicks.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserAction('email', user.id, user.name)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleUserAction('promote', user.id, user.name)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('suspend', user.id, user.name)}
                            className="text-red-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUserAction('activate', user.id, user.name)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleUserAction('delete', user.id, user.name)}
                          className="text-red-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}