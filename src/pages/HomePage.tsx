import { useState } from 'react'
import { Link2, Copy, QrCode, BarChart3, Settings, LogOut } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'

interface HomePageProps {
  user: any
}

export default function HomePage({ user }: HomePageProps) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recentUrls, setRecentUrls] = useState([])
  const { toast } = useToast()

  const handleShorten = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive"
      })
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast({
        title: "Error", 
        description: "Please enter a valid URL",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // For now, simulate the URL shortening since DB is not available
      const shortCode = customAlias || Math.random().toString(36).substring(2, 8)
      const shortened = `${window.location.origin}/${shortCode}`
      
      setShortenedUrl(shortened)
      
      // Add to recent URLs (simulated)
      const newUrl = {
        id: Date.now().toString(),
        original_url: url,
        short_code: shortCode,
        shortened_url: shortened,
        clicks: 0,
        created_at: new Date().toISOString()
      }
      
      setRecentUrls(prev => [newUrl, ...prev.slice(0, 4)])
      
      toast({
        title: "Success!",
        description: "URL shortened successfully"
      })
      
      setUrl('')
      setCustomAlias('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
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
                placeholder="Enter your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleShorten()}
              />
              <Input
                placeholder="Custom alias (optional)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="sm:w-48"
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
                    <Button size="sm" variant="outline">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent URLs */}
        {recentUrls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Links</CardTitle>
              <CardDescription>
                Your recently shortened URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUrls.map((urlItem: any) => (
                  <div key={urlItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {urlItem.shortened_url}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {urlItem.original_url}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <Badge variant="secondary">
                        {urlItem.clicks} clicks
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(urlItem.shortened_url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}