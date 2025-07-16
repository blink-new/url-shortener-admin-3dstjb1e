import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function RedirectPage() {
  const { shortCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [originalUrl, setOriginalUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('Invalid short code')
        setLoading(false)
        return
      }

      try {
        // For demo purposes, simulate looking up the URL
        // In a real app, this would query the database
        const mockUrls: Record<string, string> = {
          'demo1': 'https://example.com',
          'demo2': 'https://google.com',
          'demo3': 'https://github.com',
        }

        const url = mockUrls[shortCode]
        
        if (url) {
          setOriginalUrl(url)
          // Simulate click tracking
          setTimeout(() => {
            window.location.href = url
          }, 2000)
        } else {
          setError('Short URL not found')
        }
      } catch (err) {
        setError('Failed to redirect')
      } finally {
        setLoading(false)
      }
    }

    handleRedirect()
  }, [shortCode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Link Not Found</CardTitle>
            <CardDescription>
              The short URL you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/">Create New Short Link</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <ExternalLink className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Redirecting...</CardTitle>
          <CardDescription>
            You will be redirected to your destination in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Destination:</p>
            <p className="text-sm font-mono break-all text-blue-600">{originalUrl}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              asChild
            >
              <a href="/">Go Home</a>
            </Button>
            <Button 
              className="flex-1"
              onClick={() => window.location.href = originalUrl}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}