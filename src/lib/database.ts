// Local storage database simulation for URL shortener
export interface UrlRecord {
  id: string
  userId: string
  originalUrl: string
  shortCode: string
  customAlias?: string
  clicks: number
  isActive: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface ClickRecord {
  id: string
  urlId: string
  userAgent?: string
  ipAddress?: string
  referrer?: string
  country?: string
  city?: string
  clickedAt: string
}

class LocalDatabase {
  private getUrls(): UrlRecord[] {
    const data = localStorage.getItem('pti_urls')
    return data ? JSON.parse(data) : []
  }

  private saveUrls(urls: UrlRecord[]): void {
    localStorage.setItem('pti_urls', JSON.stringify(urls))
  }

  private getClicks(): ClickRecord[] {
    const data = localStorage.getItem('pti_clicks')
    return data ? JSON.parse(data) : []
  }

  private saveClicks(clicks: ClickRecord[]): void {
    localStorage.setItem('pti_clicks', JSON.stringify(clicks))
  }

  // URL operations
  async createUrl(data: Omit<UrlRecord, 'id' | 'clicks' | 'createdAt' | 'updatedAt'>): Promise<UrlRecord> {
    const urls = this.getUrls()
    
    // Check if short code already exists
    if (urls.some(url => url.shortCode === data.shortCode)) {
      throw new Error('Short code already exists')
    }

    const newUrl: UrlRecord = {
      ...data,
      id: `url_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    urls.push(newUrl)
    this.saveUrls(urls)
    return newUrl
  }

  async getUrlByShortCode(shortCode: string): Promise<UrlRecord | null> {
    const urls = this.getUrls()
    return urls.find(url => url.shortCode === shortCode && url.isActive) || null
  }

  async getUrlsByUserId(userId: string): Promise<UrlRecord[]> {
    const urls = this.getUrls()
    return urls.filter(url => url.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getAllUrls(): Promise<UrlRecord[]> {
    const urls = this.getUrls()
    return urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async updateUrl(id: string, updates: Partial<UrlRecord>): Promise<UrlRecord | null> {
    const urls = this.getUrls()
    const index = urls.findIndex(url => url.id === id)
    
    if (index === -1) return null

    urls[index] = {
      ...urls[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveUrls(urls)
    return urls[index]
  }

  async deleteUrl(id: string): Promise<boolean> {
    const urls = this.getUrls()
    const filteredUrls = urls.filter(url => url.id !== id)
    
    if (filteredUrls.length === urls.length) return false
    
    this.saveUrls(filteredUrls)
    
    // Also delete associated clicks
    const clicks = this.getClicks()
    const filteredClicks = clicks.filter(click => click.urlId !== id)
    this.saveClicks(filteredClicks)
    
    return true
  }

  async incrementClicks(urlId: string): Promise<void> {
    const urls = this.getUrls()
    const index = urls.findIndex(url => url.id === urlId)
    
    if (index !== -1) {
      urls[index].clicks += 1
      urls[index].updatedAt = new Date().toISOString()
      this.saveUrls(urls)
    }
  }

  // Click operations
  async recordClick(data: Omit<ClickRecord, 'id' | 'clickedAt'>): Promise<ClickRecord> {
    const clicks = this.getClicks()
    
    const newClick: ClickRecord = {
      ...data,
      id: `click_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      clickedAt: new Date().toISOString()
    }

    clicks.push(newClick)
    this.saveClicks(clicks)
    
    // Increment URL click count
    await this.incrementClicks(data.urlId)
    
    return newClick
  }

  async getClicksByUrlId(urlId: string): Promise<ClickRecord[]> {
    const clicks = this.getClicks()
    return clicks.filter(click => click.urlId === urlId).sort((a, b) => 
      new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
    )
  }

  async getAllClicks(): Promise<ClickRecord[]> {
    const clicks = this.getClicks()
    return clicks.sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
  }

  // Analytics
  async getAnalytics(userId?: string) {
    const urls = userId ? await this.getUrlsByUserId(userId) : await this.getAllUrls()
    const allClicks = await this.getAllClicks()
    
    const totalUrls = urls.length
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
    const activeUrls = urls.filter(url => url.isActive).length
    
    // Get clicks from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentClicks = allClicks.filter(click => {
      const clickDate = new Date(click.clickedAt)
      return clickDate >= thirtyDaysAgo
    })

    // Top performing URLs
    const topUrls = urls
      .filter(url => url.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Daily click data for charts
    const dailyClicks = this.getDailyClickData(recentClicks)

    return {
      totalUrls,
      totalClicks,
      activeUrls,
      recentClicks: recentClicks.length,
      topUrls,
      dailyClicks
    }
  }

  private getDailyClickData(clicks: ClickRecord[]) {
    const dailyData: { [key: string]: number } = {}
    
    // Initialize last 30 days with 0 clicks
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyData[dateStr] = 0
    }
    
    // Count actual clicks
    clicks.forEach(click => {
      const dateStr = click.clickedAt.split('T')[0]
      if (dailyData.hasOwnProperty(dateStr)) {
        dailyData[dateStr]++
      }
    })
    
    return Object.entries(dailyData).map(([date, clicks]) => ({
      date,
      clicks
    }))
  }

  // Generate unique short code
  generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Check if short code is available
  async isShortCodeAvailable(shortCode: string): Promise<boolean> {
    const urls = this.getUrls()
    return !urls.some(url => url.shortCode === shortCode)
  }
}

export const db = new LocalDatabase()