import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  MousePointer, 
  Calendar,
  Globe,
  Clock,
  Download
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { db, UrlRecord, ClickRecord } from '../../lib/database'

interface AnalyticsData {
  totalUrls: number
  totalClicks: number
  activeUrls: number
  recentClicks: number
  topUrls: UrlRecord[]
  dailyClicks: Array<{ date: string; clicks: number }>
  clicksByHour: Array<{ hour: number; clicks: number }>
  topReferrers: Array<{ referrer: string; clicks: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Get basic analytics
      const basicAnalytics = await db.getAnalytics()
      
      // Get all clicks for detailed analysis
      const allClicks = await db.getAllClicks()
      
      // Filter clicks by time range
      const now = new Date()
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      
      const filteredClicks = allClicks.filter(click => 
        new Date(click.clickedAt) >= cutoffDate
      )

      // Generate hourly click data
      const clicksByHour = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        clicks: filteredClicks.filter(click => 
          new Date(click.clickedAt).getHours() === hour
        ).length
      }))

      // Generate referrer data
      const referrerCounts: { [key: string]: number } = {}
      filteredClicks.forEach(click => {
        const referrer = click.referrer || 'Direct'
        referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1
      })

      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, clicks]) => ({ referrer, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)

      setAnalytics({
        ...basicAnalytics,
        clicksByHour,
        topReferrers
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    if (!analytics) return

    const data = {
      summary: {
        totalUrls: analytics.totalUrls,
        totalClicks: analytics.totalClicks,
        activeUrls: analytics.activeUrls,
        recentClicks: analytics.recentClicks
      },
      dailyClicks: analytics.dailyClicks,
      topUrls: analytics.topUrls.map(url => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        created: url.createdAt
      })),
      topReferrers: analytics.topReferrers
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pti-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={loadAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your URL performance</p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUrls}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalClicks}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeUrls}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Clicks/Link</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUrls > 0 ? Math.round(analytics.totalClicks / analytics.totalUrls) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Clicks Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Clicks</CardTitle>
            <CardDescription>Click trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [value, 'Clicks']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Clicks by Hour</CardTitle>
            <CardDescription>When your links are most active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.clicksByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `${value}:00`}
                    formatter={(value) => [value, 'Clicks']}
                  />
                  <Bar dataKey="clicks" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Links and Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Your most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topUrls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MousePointer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No click data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topUrls.slice(0, 10).map((url, index) => (
                  <div key={url.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          /{url.shortCode}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {url.clicks} clicks
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Where your traffic comes from</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topReferrers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No referrer data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topReferrers.map((referrer, index) => (
                  <div key={referrer.referrer} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {referrer.referrer === 'Direct' ? 'Direct Traffic' : referrer.referrer}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {referrer.clicks} clicks
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Peak Hours</h3>
              <p className="text-sm text-gray-600">
                Most clicks occur between{' '}
                {analytics.clicksByHour.reduce((max, curr) => 
                  curr.clicks > max.clicks ? curr : max
                ).hour}:00 - {analytics.clicksByHour.reduce((max, curr) => 
                  curr.clicks > max.clicks ? curr : max
                ).hour + 1}:00
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growth Rate</h3>
              <p className="text-sm text-gray-600">
                {analytics.recentClicks > 0 ? '+' : ''}{analytics.recentClicks} clicks in the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Top Source</h3>
              <p className="text-sm text-gray-600">
                {analytics.topReferrers.length > 0 
                  ? analytics.topReferrers[0].referrer === 'Direct' 
                    ? 'Direct Traffic' 
                    : analytics.topReferrers[0].referrer
                  : 'No data'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}