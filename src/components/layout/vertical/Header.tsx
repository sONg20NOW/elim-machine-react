'use client'

import { useRouter } from 'next/navigation'

import { AppBar, Button, Toolbar } from '@mui/material'

import SearchBar from '@/app/_components/SearchBar'
import { auth } from '@/lib/auth'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await auth.post('/api/auth/web/logout')
    } catch (e) {
      console.error('로그아웃 실패', e)
    } finally {
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  return (
    <AppBar position='static'>
      <Toolbar className='flex  justify-between'>
        <SearchBar placeholder='검색어를 입력하세요' onClick={() => null} />
        <Button color='inherit' onClick={() => handleLogout()}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}
