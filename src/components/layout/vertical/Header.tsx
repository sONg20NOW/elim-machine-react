'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Drawer, IconButton, AppBar, Button, Toolbar, useMediaQuery, Box, useTheme } from '@mui/material'

import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

import SearchBar from '@/app/_components/SearchBar'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'

export default function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleLogout = async () => {
    try {
      // ! CSRF token 같이 넣어서 POST
      await auth.post(`/api/authentication/web/logout`)
    } catch (e) {
      handleApiError(e)
    } finally {
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  return (
    <AppBar position='static'>
      <Toolbar className='flex  justify-between'>
        <div className='flex gap-4'>
          {isMobile && (
            <IconButton edge='end' onClick={() => setOpen(true)}>
              <i className='tabler-menu-2 text-white' />
            </IconButton>
          )}
          <SearchBar placeholder='검색어를 입력하세요' setSearchKeyword={() => null} />
        </div>
        <Button color='inherit' onClick={() => handleLogout()}>
          Logout
        </Button>
      </Toolbar>
      {/* 모바일: Drawer 안에 Navigation */}
      {isMobile && (
        <Drawer anchor='left' open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}>
          <Box sx={{ width: 280, paddingTop: 5, paddingBottom: 5 }}>
            <Menu renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}>
              <MenuItem
                href={`/calendar`}
                icon={<i className='tabler-calendar' />}
                className='ps-2 pe-3 bg-white '
                style={{
                  borderRadius: 5
                }}
                onClick={() => setOpen(false)}
              >
                {'대시보드'}
              </MenuItem>
              <MenuSection label='기계설비점검'>
                <MenuItem
                  href={`/machine`}
                  icon={<i className='tabler-settings' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'기계설비현장'}
                </MenuItem>
                <MenuItem
                  href={`/machine/engineer`}
                  icon={<i className='tabler-users' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'설비인력'}
                </MenuItem>
                <MenuItem
                  href={`/machine/template`}
                  icon={<i className='tabler-clipboard' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'양식관리'}
                </MenuItem>
              </MenuSection>
              <MenuSection label='안전진단전검'>
                <MenuItem
                  href={`/safety`}
                  icon={<i className='tabler-shield' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'안전진단현장'}
                </MenuItem>
              </MenuSection>
              <MenuSection label='문의'>
                <MenuItem
                  href={`/board/notice`}
                  icon={<i className='tabler-speakerphone' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'공지사항'}
                </MenuItem>
                <MenuItem
                  href={`/board/files`}
                  icon={<i className='tabler-paperclip' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'자료실'}
                </MenuItem>
                <MenuItem
                  href={`/board/faq`}
                  icon={<i className='tabler-clipboard-check' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'FAQ'}
                </MenuItem>
                <MenuItem
                  href={`/board/qna`}
                  icon={<i className='tabler-zoom-question' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'일대일 문의'}
                </MenuItem>
              </MenuSection>
              <MenuSection label='관리'>
                <MenuItem
                  href={`/member`}
                  icon={<i className='tabler-users-plus' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'직원관리'}
                </MenuItem>
                <MenuItem
                  href={`/loginlog`}
                  icon={<i className='tabler-history' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'로그인 기록'}
                </MenuItem>
              </MenuSection>
              <MenuSection label='라이선스'>
                <MenuItem
                  href={`/license`}
                  icon={<i className='tabler-heart-handshake' />}
                  className='ps-2 pe-3 bg-white '
                  style={{
                    borderRadius: 5
                  }}
                  onClick={() => setOpen(false)}
                >
                  {'라이선스관리'}
                </MenuItem>
              </MenuSection>
            </Menu>
          </Box>
        </Drawer>
      )}
    </AppBar>
  )
}
