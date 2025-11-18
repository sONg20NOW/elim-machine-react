'use client'

import { createContext, useEffect, useState } from 'react'

import { Backdrop, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material'

import useAccessTokenStore from '@/@core/utils/useAuthStore'

export const isTabletContext = createContext<boolean | null>(null)
export const isMobileContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [dotCnt, setDotCnt] = useState<0 | 1 | 2 | 3>(0)

  const accessToken = useAccessTokenStore(set => set.accessToken)

  useEffect(() => {
    const intervalId = setInterval(() => setDotCnt(prev => (prev === 3 ? 0 : ((prev + 1) as 1 | 2 | 3))), 500)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={!accessToken}>
        <div className='flex flex-col gap-3 items-center'>
          <Typography color='white' variant='h4'>
            사용자 인증 중{Array(dotCnt).fill('.')}
            <span className='opacity-[0%]'>{Array(3 - dotCnt).fill('.')}</span>
          </Typography>
          <CircularProgress sx={{ color: 'white' }} />
        </div>
      </Backdrop>

      <isTabletContext.Provider value={isTablet}>
        <isMobileContext.Provider value={isMobile}>{children}</isMobileContext.Provider>
      </isTabletContext.Provider>
    </>
  )
}
