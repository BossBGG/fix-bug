'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWebPushNotification } from '@/hooks/useWebPushNotification'

type ToastItem = {
  id: string
  title: string
  body: string
  data?: any
}

export function PushNotificationManager() {
  // Initialize FCM - auto-subscribe logic is in the hook
  useWebPushNotification()

  const router = useRouter()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutsRef = useRef<Record<string, number>>({})

  const getHref = useMemo(() => {
    return (data: any): string | null => {
      if (data?.actionPath) return data.actionPath
      if (data?.actionType === 'WORK_ORDER' && data?.actionId) return `/work_order/${data.actionId}`
      return null
    }
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const onMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'PUSH_NOTIFICATION') return

      if (document.visibilityState !== 'visible') return

      const payload = event.data.payload || {}
      const title = String(payload.title || 'แจ้งเตือน')
      const body = String(payload.body || '')
      const data = payload.data
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`

      setToasts((prev) => [{ id, title, body, data }, ...prev].slice(0, 3))

      timeoutsRef.current[id] = window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        delete timeoutsRef.current[id]
      }, 6000)
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage)
      Object.values(timeoutsRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutsRef.current = {}
    }
  }, [getHref])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-[360px] max-w-[90vw]">
      {toasts.map((t) => {
        const href = getHref(t.data)
        return (
          <div
            key={t.id}
            className="bg-white border border-[#E1D2FF] shadow-lg rounded-xl p-4 cursor-pointer"
            onClick={() => {
              if (href) router.push(href)
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#160C26] text-sm truncate">{t.title}</div>
                <div className="text-[#4A4A4A] text-sm mt-1 line-clamp-2">{t.body}</div>
              </div>
              <button
                className="text-[#4A4A4A] hover:text-[#160C26]"
                onClick={(e) => {
                  e.stopPropagation()
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }}
                aria-label="ปิด"
              >
                X
              </button>
            </div>
            {!href && (
              <div className="text-[#671FAB] text-xs mt-2">ดูที่หน้าแจ้งเตือน</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
