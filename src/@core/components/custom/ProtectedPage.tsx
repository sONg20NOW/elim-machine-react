'use client'

import { createContext } from 'react'

import { useMediaQuery, useTheme } from '@mui/material'

export const isTabletContext = createContext<boolean | null>(null)
export const isMobileContext = createContext<boolean | null>(null)

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <isTabletContext.Provider value={isTablet}>
      <isMobileContext.Provider value={isMobile}>{children}</isMobileContext.Provider>
    </isTabletContext.Provider>
  )
}
