'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    const register = async () => {
      if (!('serviceWorker' in navigator)) return

      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          const scriptURL = registration.active?.scriptURL
          if (!scriptURL) continue

          let pathname = ''
          try {
            pathname = new URL(scriptURL).pathname
          } catch {
            // ignore
          }

          if (
            pathname === '/sw.js' ||
            pathname === '/firebase-messaging-sw.js' ||
            pathname === '/apns-sw.js'
          ) {
            await registration.unregister()
          }
        }

        if (process.env.NODE_ENV === 'development') return

        await navigator.serviceWorker.register('/pwa-sw.js', { scope: '/' })
        await navigator.serviceWorker.ready
      } catch {
        // ignore
      }
    }

    register()
  }, [])

  return null
}
