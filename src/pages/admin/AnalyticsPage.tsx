import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { BarChart3, TrendingUp, MousePointer, Globe, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const chartData = [
    { name: 'Mon', clicks: 120 },
    { name: 'Tue', clicks: 190 },
    { name: 'Wed', clicks: 300 },
    { name: 'Thu', clicks: 250 },
    { name: 'Fri', clicks: 420 },
    { name: 'Sat', clicks: 380 },
    { name: 'Sun', clicks: 290 },
  ]

  const topCountries = [
    { country: 'United States', clicks: 1234, percentage: 45 },
    { country: 'United Kingdom', clicks: 567, percentage: 20 },
    { country: 'Canada', clicks: 345, percentage: 12 },
    { country: 'Germany', clicks: 234, percentage: 8 },
    { country: 'France', clicks: 123, percentage: 4 },
  ]

  const topReferrers = [
    { source: 'Direct', clicks: 890, percentage: 32 },
    { source: 'Twitter', clicks: 567, percentage: 20 },
    { source: 'Facebook', clicks: 445, percentage: 16 },
    { source: 'LinkedIn', clicks: 334, percentage: 12 },
    { source: 'Reddit', clicks: 223, percentage: 8 },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your link performance</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">45,678</p>
              </div>
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +12.5%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">23,456</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +8.2%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">3.4%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-red-700 bg-red-50">
                -2.1%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Daily</p>
                <p className="text-2xl font-bold text-gray-900">6,525</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                +15.3%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Click Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Click Trends</CardTitle>
            <CardDescription>Daily clicks over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((day, index) => (
                <div key={day.name} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                    style={{ height: `${(day.clicks / 500) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{day.name}</span>
                  <span className="text-xs font-medium text-gray-900">{day.clicks}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Clicks by geographic location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {country.clicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrers and Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Traffic sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReferrers.map((referrer, index) => (
                <div key={referrer.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{referrer.source}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${referrer.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {referrer.clicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Clicks by device category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { device: 'Desktop', clicks: 1456, percentage: 52 },
                { device: 'Mobile', clicks: 1123, percentage: 40 },
                { device: 'Tablet', clicks: 234, percentage: 8 },
              ].map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{device.device}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {device.clicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}