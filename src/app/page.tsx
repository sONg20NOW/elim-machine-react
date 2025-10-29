'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Backdrop, CircularProgress, Typography } from '@mui/material'

import useIsTablet from '@/@core/utils/useIsTablet'

export default function HomeRedirectPage() {
  const router = useRouter()
  const isTablet = useIsTablet()

  const [flag, setFlag] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setFlag(true)
      setTimeout(() => {
        if (isTablet) {
          router.replace('/check')
        } else {
          router.replace('/machine')
        }
      }, 1000)
    }, 1000)
  }, [router, isTablet])

  return (
    <Backdrop open>
      <div className='flex flex-col gap-8 items-center'>
        <Typography color='white'>
          {flag ? '엘림 기계설비현장 웹페이지로 이동 중...' : '사용자 정보를 불러오는 중...'}
        </Typography>
        <CircularProgress size={60} />
      </div>
    </Backdrop>
  )
}
