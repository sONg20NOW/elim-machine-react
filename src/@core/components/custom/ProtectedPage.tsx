'use client'

import { createContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { CircularProgress, Paper, useMediaQuery, useTheme } from '@mui/material'

export const isTabletContext = createContext<boolean | null>(null)
export const isMobileContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = useState(false)

  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.replace('/login') // accessToken 없으면 로그인으로
      setHasToken(false)
    } else {
      setHasToken(true)
    }
  }, [router])

  return (
    <isTabletContext.Provider value={isTablet}>
      <isMobileContext.Provider value={isMobile}>
        {hasToken ? (
          children
        ) : (
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              gap: 4,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress />
          </Paper>
        )}
      </isMobileContext.Provider>
    </isTabletContext.Provider>
  )
}
