'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)

    if (isMobile && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(r => console.log('SW registered', r))
        .catch(err => console.log('SW error', err))
    }
  }, [])

  return null
}
