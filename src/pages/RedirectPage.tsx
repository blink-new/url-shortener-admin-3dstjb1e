import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { db } from '../lib/database'

export default function RedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code')
      setLoading(false)
      return
    }

    handleRedirect()
  }, [shortCode])

  const handleRedirect = async () => {
    try {
      setLoading(true)
      
      const urlRecord = await db.getUrlByShortCode(shortCode!)
      
      if (!urlRecord) {
        setError('Short URL not found or has been deactivated')
        setLoading(false)
        return
      }

      // Check if URL has expired
      if (urlRecord.expiresAt && new Date(urlRecord.expiresAt) < new Date()) {
        setError('This short URL has expired')
        setLoading(false)
        return
      }

      setUrl(urlRecord.originalUrl)
      
      // Record the click
      await db.recordClick({
        urlId: urlRecord.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        ipAddress: 'unknown' // In a real app, this would be handled server-side
      })

      // Auto-redirect after a short delay
      setTimeout(() => {
        setRedirecting(true)
        window.location.href = urlRecord.originalUrl
      }, 2000)
      
    } catch (error) {
      console.error('Redirect error:', error)
      setError('An error occurred while processing the redirect')
    } finally {
      setLoading(false)
    }
  }

  const handleManualRedirect = () => {
    if (url) {
      setRedirecting(true)
      window.location.href = url
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing redirect...</p>
            </div>
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
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Link Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Go to Homepage
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
          <CardTitle className="text-xl">
            {redirecting ? 'Redirecting...' : 'Redirect Ready'}
          </CardTitle>
          <CardDescription>
            {redirecting 
              ? 'Taking you to your destination...' 
              : 'You will be redirected automatically in a moment'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Destination:</p>
            <p className="text-sm font-mono break-all text-blue-600">{url}</p>
          </div>
          
          {!redirecting && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleManualRedirect}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
          
          {redirecting && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}