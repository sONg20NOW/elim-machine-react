'use client'

import { createContext } from 'react'

import { Backdrop, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material'

import useAccessTokenStore from '@/@core/utils/useAuthStore'

export const isTabletContext = createContext<boolean | null>(null)
export const isMobileContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const accessToken = useAccessTokenStore(set => set.accessToken)

  return (
    <>
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={!accessToken}>
        <div className='flex flex-col gap-3 items-center'>
          <Typography color='white' variant='h6'>
            허용되지 않은 접근입니다
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
