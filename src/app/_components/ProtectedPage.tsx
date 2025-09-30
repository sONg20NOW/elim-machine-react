'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { CircularProgress, Paper } from '@mui/material'

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = useState(false)

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
    <>
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
    </>
  )
}
