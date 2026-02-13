'use client'
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWebPushNotification } from '@/hooks/useWebPushNotification'
import { useAppSelector } from '@/app/redux/hook'

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const token = useAppSelector((state) => state.auth.token)
  const webPush = useWebPushNotification()

  useEffect(() => {
    const dismissed = localStorage.getItem('notification_banner_dismissed')
    const subscribed = localStorage.getItem('webpush_subscribed')
    
    if (!token || dismissed === 'true' || subscribed === 'true') {
      setIsVisible(false)
      return
    }

    if (Notification.permission === 'default' || Notification.permission === 'denied') {
      setIsVisible(true)
    }
  }, [token])

  const handleEnable = async () => {
    if (Notification.permission === 'denied') {
      alert('กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        const userId = token ? JSON.parse(atob(token.split('.')[1])).sub : undefined
        if (!userId) return
        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID()
        localStorage.setItem('device_id', deviceId)
        
        const subscribed = await webPush.subscribe(userId, deviceId, navigator.userAgent)
        if (subscribed) {
          localStorage.setItem('webpush_subscribed', 'true')
          setIsVisible(false)
        }
      } catch (error) {
        console.error('Subscribe failed:', error)
      }
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('notification_banner_dismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm md:text-base">
            เปิดการแจ้งเตือนเพื่อรับข้อมูลอัพเดทใบสั่งงานแบบ real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEnable}
            className="whitespace-nowrap"
          >
            เปิดใช้งาน
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
