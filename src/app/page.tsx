'use client'

import { useContext, useLayoutEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Backdrop, CircularProgress, Typography } from '@mui/material'

import { isTabletContext } from '@/@core/contexts/mediaQueryContext'

export default function HomeRedirectPage() {
  const router = useRouter()
  const isTablet = useContext(isTabletContext)

  useLayoutEffect(() => {
    router.replace(isTablet ? '/check' : '/machine')
  }, [router, isTablet])

  return (
    <Backdrop open>
      <div className='flex flex-col gap-8 items-center'>
        <Typography color='white'>{'엘림 기계설비현장 웹페이지로 이동 중...'}</Typography>
        <CircularProgress size={60} />
      </div>
    </Backdrop>
  )
}
