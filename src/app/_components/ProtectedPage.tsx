'use client'

import { createContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { CircularProgress, Paper, useMediaQuery, useTheme } from '@mui/material'

export const isTabletContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children, isNotWeb }: { children: React.ReactNode; isNotWeb?: boolean }) {
  const router = useRouter()
  const [hasToken, setHasToken] = useState(false)

  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      router.replace('/login') // accessToken 없으면 로그인으로
      setHasToken(false)
    } else {
      setHasToken(true)
    }
  }, [router])

  useEffect(() => {
    if (isNotWeb) {
      router.replace('/check')
    }
  }, [isNotWeb, router])

  return (
    <isTabletContext.Provider value={isTablet}>
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
    </isTabletContext.Provider>
  )
}
