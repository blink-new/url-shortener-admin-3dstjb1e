import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Plus,
  Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useToast } from '../../hooks/use-toast'
import { db, UrlRecord } from '../../lib/database'

export default function LinkManagementPage() {
  const [urls, setUrls] = useState<UrlRecord[]>([])
  const [filteredUrls, setFilteredUrls] = useState<UrlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'clicks' | 'updated'>('created')
  const { toast } = useToast()

  useEffect(() => {
    loadUrls()
  }, [])

  useEffect(() => {
    filterAndSortUrls()
  }, [urls, searchTerm, statusFilter, sortBy])

  const loadUrls = async () => {
    try {
      setLoading(true)
      const allUrls = await db.getAllUrls()
      setUrls(allUrls)
    } catch (error) {
      console.error('Failed to load URLs:', error)
      toast({
        title: "Error",
        description: "Failed to load URLs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUrls = () => {
    let filtered = urls

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(url => 
        url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (url.customAlias && url.customAlias.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(url => 
        statusFilter === 'active' ? url.isActive : !url.isActive
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'clicks':
          return b.clicks - a.clicks
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredUrls(filtered)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard"
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      })
    }
  }

  const toggleUrlStatus = async (urlId: string, currentStatus: boolean) => {
    try {
      await db.updateUrl(urlId, { isActive: !currentStatus })
      await loadUrls()
      toast({
        title: "Updated",
        description: `URL ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update URL status",
        variant: "destructive"
      })
    }
  }

  const deleteUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return
    }

    try {
      await db.deleteUrl(urlId)
      await loadUrls()
      toast({
        title: "Deleted",
        description: "URL deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive"
      })
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Short Code', 'Original URL', 'Clicks', 'Status', 'Created', 'Updated'],
      ...filteredUrls.map(url => [
        url.shortCode,
        url.originalUrl,
        url.clicks.toString(),
        url.isActive ? 'Active' : 'Inactive',
        new Date(url.createdAt).toLocaleDateString(),
        new Date(url.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pti-links-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Exported",
      description: "Links data exported successfully"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Link Management</h1>
          <p className="text-gray-600">Manage and monitor all shortened URLs</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <a href="/">
              <Plus className="w-4 h-4 mr-2" />
              Create Link
            </a>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search URLs, short codes, or aliases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="clicks">Click Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{urls.length}</div>
            <p className="text-sm text-gray-600">Total Links</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{urls.filter(u => u.isActive).length}</div>
            <p className="text-sm text-gray-600">Active Links</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{urls.reduce((sum, u) => sum + u.clicks, 0)}</div>
            <p className="text-sm text-gray-600">Total Clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredUrls.length}</div>
            <p className="text-sm text-gray-600">Filtered Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Links</CardTitle>
          <CardDescription>
            {filteredUrls.length} of {urls.length} links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUrls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No links found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short Link</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUrls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">
                            /{url.shortCode}
                          </div>
                          {url.customAlias && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {url.clicks}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={url.isActive ? "default" : "secondary"}
                          className={url.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {url.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(`${window.location.origin}/${url.shortCode}`)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`${window.location.origin}/${url.shortCode}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visit Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleUrlStatus(url.id, url.isActive)}
                            >
                              {url.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteUrl(url.id)}
                              className="text-red-600"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}