'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Backdrop, CircularProgress } from '@mui/material'

import useIsTablet from '@/@core/utils/useIsTablet'

export default function HomeRedirectPage() {
  const router = useRouter()
  const isTablet = useIsTablet()

  useEffect(() => {
    setTimeout(() => {
      if (isTablet) {
        router.replace('/check')
      } else {
        router.replace('/machine')
      }
    }, 3000)
  }, [router, isTablet])

  return (
    <Backdrop open>
      <CircularProgress size={60} />
    </Backdrop>
  )
}
