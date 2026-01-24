'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

interface ScheduledPost {
  id: string
  scheduled_date: string
  scheduled_time: string | null
  platform: string
  caption: string
  status: string
  media_asset_id: string | null
  product_name: string | null
  hashtags: string[] | null
}

interface ContentCalendarProps {
  onSelectDate?: (date: string) => void
  onEditPost?: (post: ScheduledPost) => void
}

export function ContentCalendar({ onSelectDate, onEditPost }: ContentCalendarProps) {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScheduledPosts()
  }, [currentMonth])

  const fetchScheduledPosts = async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      setScheduledPosts(data || [])
    } catch (err) {
      console.error('Error fetching scheduled posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getPostsForDate = (day: number) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split('T')[0]

    return scheduledPosts.filter(post => post.scheduled_date === dateStr)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    facebook: '👥',
    linkedin: '💼',
    tiktok: '🎵',
    email: '✉️'
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-300 dark:bg-gray-600',
    scheduled: 'bg-blue-500',
    published: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-gray-400'
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={goToPreviousMonth} variant="outline" className="px-3">
            ◀
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[200px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button onClick={goToNextMonth} variant="outline" className="px-3">
            ▶
          </Button>
        </div>
        <Button onClick={goToToday} className="bg-amber-600 hover:bg-amber-700">
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-800">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center py-3 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
          {getDaysInMonth().map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                />
              )
            }

            const postsForDay = getPostsForDate(day)
            const today = isToday(day)

            return (
              <div
                key={day}
                onClick={() => onSelectDate?.(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    .toISOString()
                    .split('T')[0]
                )}
                className={`
                  border-r border-b border-gray-200 dark:border-gray-700 p-2 cursor-pointer
                  hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors
                  ${today ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                `}
              >
                {/* Day Number */}
                <div className={`
                  text-sm font-bold mb-2
                  ${today ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {day}
                  {today && <span className="ml-1 text-xs">📌</span>}
                </div>

                {/* Scheduled Posts */}
                <div className="space-y-1">
                  {postsForDay.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditPost?.(post)
                      }}
                      className={`
                        text-xs p-1 rounded text-white truncate cursor-pointer
                        hover:opacity-80 transition-opacity
                        ${statusColors[post.status]}
                      `}
                      title={`${post.platform} - ${post.product_name || 'Untitled'} - ${post.status}`}
                    >
                      {platformIcons[post.platform]} {post.product_name || 'Untitled'}
                    </div>
                  ))}
                  {postsForDay.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      +{postsForDay.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {scheduledPosts.filter(p => p.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {scheduledPosts.filter(p => p.status === 'scheduled').length}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Scheduled</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {scheduledPosts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Published</div>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {scheduledPosts.length}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">Total</div>
        </div>
      </div>
    </div>
  )
}
