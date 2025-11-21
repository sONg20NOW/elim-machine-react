'use client'

import { createContext, useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Backdrop, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material'

import useAccessTokenStore from '@/@core/utils/useAuthStore'

export const isTabletContext = createContext<boolean | null>(null)
export const isMobileContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()

  const [dotCnt, setDotCnt] = useState<0 | 1 | 2 | 3>(0)
  const [showRelogin, setShowRelogin] = useState(false)

  const accessToken = useAccessTokenStore(set => set.accessToken)

  const routeToLoginPage = useCallback(() => {
    router.push('/login')
  }, [router])

  useEffect(() => {
    const intervalId = setInterval(() => setDotCnt(prev => (prev === 3 ? 0 : ((prev + 1) as 1 | 2 | 3))), 500)

    setTimeout(() => {
      setShowRelogin(true)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={!accessToken}>
        <div className='flex flex-col gap-3 items-center'>
          <Typography color='white' variant='h4'>
            로그인 정보를 찾는 중{Array(dotCnt).fill('.')}
            <span className='opacity-[0%]'>{Array(3 - dotCnt).fill('.')}</span>
          </Typography>
          <CircularProgress sx={{ color: 'white' }} />
          {showRelogin && (
            <Button variant='contained' type='button' onClick={routeToLoginPage}>
              다시 로그인
            </Button>
          )}
        </div>
      </Backdrop>

      <isTabletContext.Provider value={isTablet}>
        <isMobileContext.Provider value={isMobile}>{children}</isMobileContext.Provider>
      </isTabletContext.Provider>
    </>
  )
}
