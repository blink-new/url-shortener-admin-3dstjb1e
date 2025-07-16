import { useState, useEffect } from 'react'
import { Link2, Copy, QrCode, BarChart3, LogOut, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { db, UrlRecord } from '../lib/database'

interface HomePageProps {
  user: any
}

export default function HomePage({ user }: HomePageProps) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recentUrls, setRecentUrls] = useState<UrlRecord[]>([])
  const [loadingUrls, setLoadingUrls] = useState(true)
  const { toast } = useToast()

  // Load user's URLs on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserUrls()
    }
  }, [user?.id])

  const loadUserUrls = async () => {
    try {
      setLoadingUrls(true)
      const urls = await db.getUrlsByUserId(user.id)
      setRecentUrls(urls.slice(0, 10)) // Show last 10 URLs
    } catch (error) {
      console.error('Failed to load URLs:', error)
    } finally {
      setLoadingUrls(false)
    }
  }

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleShorten = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive"
      })
      return
    }

    if (!validateUrl(url)) {
      toast({
        title: "Error", 
        description: "Please enter a valid URL (must start with http:// or https://)",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      let shortCode = customAlias.trim()
      
      // If custom alias provided, check if it's available
      if (shortCode) {
        if (shortCode.length < 3) {
          toast({
            title: "Error",
            description: "Custom alias must be at least 3 characters long",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        const isAvailable = await db.isShortCodeAvailable(shortCode)
        if (!isAvailable) {
          toast({
            title: "Error",
            description: "This custom alias is already taken",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
      } else {
        // Generate unique short code
        do {
          shortCode = db.generateShortCode()
        } while (!(await db.isShortCodeAvailable(shortCode)))
      }
      
      // Create the URL record
      const newUrl = await db.createUrl({
        userId: user.id,
        originalUrl: url,
        shortCode,
        customAlias: customAlias.trim() || undefined,
        isActive: true
      })
      
      const shortened = `${window.location.origin}/${shortCode}`
      setShortenedUrl(shortened)
      
      // Refresh the recent URLs list
      await loadUserUrls()
      
      toast({
        title: "Success!",
        description: "URL shortened successfully"
      })
      
      setUrl('')
      setCustomAlias('')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to shorten URL. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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

  const deleteUrl = async (urlId: string) => {
    try {
      await db.deleteUrl(urlId)
      await loadUserUrls()
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

  const toggleUrlStatus = async (urlId: string, currentStatus: boolean) => {
    try {
      await db.updateUrl(urlId, { isActive: !currentStatus })
      await loadUserUrls()
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

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Pti</CardTitle>
            <CardDescription>
              Sign in to start shortening URLs and access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Pti</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Admin Panel
                </a>
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hi, {user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shorten Your URLs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create short, memorable links that are easy to share. Track clicks and manage all your links in one place.
          </p>
        </div>

        {/* URL Shortener Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Short Link</CardTitle>
            <CardDescription>
              Enter a long URL to get a shortened version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter your long URL here... (https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleShorten()}
              />
              <Input
                placeholder="Custom alias (optional)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                className="sm:w-48"
                maxLength={20}
              />
              <Button 
                onClick={handleShorten} 
                disabled={isLoading}
                className="sm:w-32"
              >
                {isLoading ? 'Shortening...' : 'Shorten'}
              </Button>
            </div>
            
            {shortenedUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium mb-1">Your shortened URL:</p>
                    <p className="text-green-800 font-mono break-all">{shortenedUrl}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shortenedUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(shortenedUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>
              Manage your recently shortened URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUrls ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentUrls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No URLs shortened yet</p>
                <p className="text-sm">Create your first short link above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUrls.map((urlItem) => (
                  <div key={urlItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {window.location.origin}/{urlItem.shortCode}
                        </p>
                        {!urlItem.isActive && (
                          <Badge variant="secondary" className="text-red-600 bg-red-50">
                            Inactive
                          </Badge>
                        )}
                        {urlItem.customAlias && (
                          <Badge variant="outline">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {urlItem.originalUrl}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created {new Date(urlItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <Badge variant="secondary">
                        {urlItem.clicks} clicks
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${window.location.origin}/${urlItem.shortCode}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`${window.location.origin}/${urlItem.shortCode}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUrlStatus(urlItem.id, urlItem.isActive)}
                        className={urlItem.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {urlItem.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUrl(urlItem.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}