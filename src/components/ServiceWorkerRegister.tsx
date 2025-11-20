'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(r => console.log('SW registered', r))
        .catch(err => console.log('SW error', err))
    }
  }, [])

  return null
}
