'use client'

import type { ReactNode } from 'react'

import { SnackbarProvider } from 'notistack'

interface Props {
  children: ReactNode
}

export default function ClientProviders({ children }: Props) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={1000}>
      {children}
    </SnackbarProvider>
  )
}
