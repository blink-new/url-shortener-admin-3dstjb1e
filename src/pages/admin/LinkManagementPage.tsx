import { useState } from 'react'
import { Search, Plus, MoreHorizontal, Edit, Trash2, Copy, BarChart3, QrCode } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Switch } from '../../components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../hooks/use-toast'

export default function LinkManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const mockLinks = [
    {
      id: '1',
      shortCode: 'abc123',
      originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
      title: 'Example Website',
      clicks: 1234,
      isActive: true,
      createdAt: '2024-01-15',
      expiresAt: null,
      userId: 'user1'
    },
    {
      id: '2',
      shortCode: 'def456',
      originalUrl: 'https://github.com/user/repository',
      title: 'GitHub Repository',
      clicks: 567,
      isActive: true,
      createdAt: '2024-01-14',
      expiresAt: '2024-12-31',
      userId: 'user2'
    },
    {
      id: '3',
      shortCode: 'ghi789',
      originalUrl: 'https://docs.google.com/document/d/1234567890',
      title: 'Google Doc',
      clicks: 89,
      isActive: false,
      createdAt: '2024-01-13',
      expiresAt: null,
      userId: 'user1'
    },
  ]

  const handleCopyLink = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard"
    })
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toast({
      title: currentStatus ? "Link Disabled" : "Link Enabled",
      description: `Link has been ${currentStatus ? 'disabled' : 'enabled'} successfully`
    })
  }

  const handleDeleteLink = (id: string) => {
    toast({
      title: "Link Deleted",
      description: "Link has been permanently deleted",
      variant: "destructive"
    })
  }

  const filteredLinks = mockLinks.filter(link => 
    link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Link Management</h1>
          <p className="text-gray-600">Manage all your shortened URLs</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Short Link</DialogTitle>
              <DialogDescription>
                Enter the details for your new short link
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Original URL</Label>
                <Input id="url" placeholder="https://example.com/long-url" />
              </div>
              <div>
                <Label htmlFor="alias">Custom Alias (optional)</Label>
                <Input id="alias" placeholder="my-custom-link" />
              </div>
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input id="title" placeholder="Link title" />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" placeholder="Link description" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsCreateDialogOpen(false)
                  toast({
                    title: "Link Created",
                    description: "Your short link has been created successfully"
                  })
                }}>
                  Create Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">All Links</Button>
              <Button variant="outline">Active</Button>
              <Button variant="outline">Inactive</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Links ({filteredLinks.length})</CardTitle>
          <CardDescription>
            Manage and monitor your shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short Link</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {link.shortCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(link.shortCode)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={link.originalUrl}>
                      {link.originalUrl}
                    </div>
                  </TableCell>
                  <TableCell>
                    {link.title || <span className="text-gray-400">No title</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {link.clicks.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={() => handleToggleStatus(link.id, link.isActive)}
                      />
                      <span className="text-sm text-gray-600">
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(link.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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