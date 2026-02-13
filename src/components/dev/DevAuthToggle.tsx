'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { enableMockAuth, disableMockAuth, isMockAuthEnabled, setMockAuthFromDevServer } from '@/lib/mock-auth'
import { pushNotificationApi } from '@/services/api/pushNotification.api'

/**
 * Dev tool สำหรับเปิด/ปิด Mock Authentication
 * แสดงเฉพาะใน development mode
 */
export function DevAuthToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  useEffect(() => {
    // แสดงเฉพาะใน development และมี env variable
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true') {
      setIsVisible(true)
      setIsEnabled(isMockAuthEnabled())
    }
  }, [])

  if (!isVisible) return null

  const handleToggle = () => {
    if (isEnabled) {
      disableMockAuth()
      setIsEnabled(false)
      window.location.reload()
    } else {
      enableMockAuth()
      setIsEnabled(true)
      window.location.reload()
    }
  }

  const handleSendTestNotification = async () => {
    setIsSending(true)
    try {
      await pushNotificationApi.sendTestNotification({
        title: '🔔 ทดสอบการแจ้งเตือน',
        body: 'นี่คือข้อความทดสอบจาก Dev Tools เวลา ' + new Date().toLocaleTimeString('th-TH')
      })
      alert('✅ ส่ง notification สำเร็จ!')
    } catch (error: any) {
      alert('❌ ส่งไม่สำเร็จ: ' + (error?.response?.data?.message || error.message))
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateToken = () => {
    if (!tokenInput.trim()) {
      alert('❌ กรุณาใส่ token')
      return
    }
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      setMockAuthFromDevServer(tokenInput.trim(), user)
      alert('✅ อัพเดท token สำเร็จ! กำลัง reload...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      alert('❌ อัพเดทไม่สำเร็จ: ' + error.message)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg z-50 bg-yellow-50 border-yellow-300">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-yellow-800">
          🔧 Dev Tools
        </div>
        <div className="text-xs text-yellow-700">
          Mock Auth: {isEnabled ? '✅ Enabled' : '❌ Disabled'}
        </div>
        <Button
          size="sm"
          variant={isEnabled ? 'destructive' : 'default'}
          onClick={handleToggle}
          className="w-full"
        >
          {isEnabled ? 'Disable Mock Auth' : 'Enable Mock Auth'}
        </Button>
        {isEnabled && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTestNotification}
              disabled={isSending}
              className="w-full mt-2"
            >
              {isSending ? '⏳ กำลังส่ง...' : '🔔 ส่ง Test Notification'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="w-full mt-2"
            >
              {showTokenInput ? '❌ ยกเลิก' : '🔑 อัพเดท Token'}
            </Button>
            {showTokenInput && (
              <div className="space-y-2 mt-2">
                <textarea
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste token from dev server..."
                  className="w-full p-2 text-xs border rounded h-20 resize-none"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateToken}
                  className="w-full"
                >
                  💾 บันทึก Token
                </Button>
                <div className="text-xs text-yellow-600">
                  💡 วิธีเอา token:<br />
                  1. Login ที่ dev server<br />
                  2. F12 → Console<br />
                  3. รัน: localStorage.getItem('token')<br />
                  4. Copy มาวางที่นี่
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
