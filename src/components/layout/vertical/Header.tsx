'use client'

import { useContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Drawer, IconButton, AppBar, Button, Toolbar, Box, Typography, Link } from '@mui/material'

import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

import { logout } from '@/lib/auth'
import { isMobileContext, isTabletContext } from '@/@core/components/custom/ProtectedPage'
import UserModal from '@/app/(dashboard)/member/_components/UserModal'
import { useGetSingleMember } from '@/@core/hooks/customTanstackQueries'

// import Logo from '@components/layout/shared/Logo'

export default function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openUser, setOpenUser] = useState(false)
  const [memberId, setMemberId] = useState<number>(0)

  const isTablet = useContext(isTabletContext)
  const isMobile = useContext(isMobileContext)

  const { data: userData } = useGetSingleMember(memberId.toString())

  const username = userData?.memberBasicResponseDto?.name

  useEffect(() => {
    const stored = localStorage.getItem('user')

    if (stored) {
      setMemberId((JSON.parse(stored) as { memberId: number }).memberId)
    } else {
      setMemberId(0)
    }
  }, [])

  return (
    <AppBar
      sx={{
        background: theme => `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`
      }}
      position='static'
    >
      <Toolbar className='flex justify-between'>
        <div className='flex gap-2'>
          {isTablet && (
            <IconButton edge='end' onClick={() => setOpen(true)}>
              <i className='tabler-menu-2 text-white' />
            </IconButton>
          )}
          <div onClick={() => router.push('/machine')} className='cursor-pointer'>
            {/* <Logo /> */}
            <Typography color='white' variant='h4' sx={{ paddingInlineStart: 4 }}>
              엘림 주식회사
            </Typography>
          </div>
        </div>
        {!isTablet && (
          <div className='flex gap-5 items-center overflow-visible'>
            <Typography
              color='white'
              onClick={() => console.log(document.cookie.split(';'))}
              sx={{ alignItems: 'center', display: 'flex' }}
            >
              반갑습니다,{' '}
              <Button color='inherit' type='button' onClick={() => setOpenUser(true)}>
                {username}
              </Button>
              님
            </Typography>
            <Button
              size='small'
              sx={{ backgroundColor: 'white', ':hover': { boxShadow: 5, backgroundColor: 'lightgray' } }}
              variant='contained'
              onClick={logout}
            >
              <Typography sx={{ fontWeight: 600 }}>로그아웃</Typography>
            </Button>
          </div>
        )}
      </Toolbar>
      {/* 모바일: Drawer 안에 Navigation */}
      {isTablet && (
        <Drawer
          slotProps={{ paper: { sx: { width: !isMobile ? '30%' : '80%' } } }}
          anchor='left'
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <Box sx={{ paddingBottom: 5, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {isTablet && (
              <Box
                sx={{ backgroundColor: 'primary.dark' }}
                className='flex flex-col justify-between items-start overflow-visible p-3'
              >
                <div className='flex justify-between w-full'>
                  <Typography color='white' onClick={() => console.log(document.cookie.split(';'))}>
                    반갑습니다,
                  </Typography>
                  <Button
                    size='small'
                    sx={{
                      backgroundColor: 'white',
                      verticalAlign: 'start',
                      ':hover': { boxShadow: 5, backgroundColor: 'lightgray' }
                    }}
                    variant='contained'
                    onClick={logout}
                  >
                    <Typography sx={{ fontWeight: 600 }}>로그아웃</Typography>
                  </Button>
                </div>
                <Typography
                  maxWidth={3}
                  sx={{
                    overflow: 'hidden', // width 넘으면 숨김
                    textOverflow: 'ellipsis', // 넘는 텍스트는 ... 처리
                    whiteSpace: 'nowrap', // 줄바꿈 방지
                    maxWidth: 220,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  color='white'
                  onClick={() => console.log(document.cookie.split(';'))}
                >
                  <Button color='inherit' type='button' onClick={() => setOpenUser(true)} sx={{ p: 0 }}>
                    {username}
                  </Button>
                  님
                </Typography>
              </Box>
            )}
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
          <Box sx={{ width: 'full', textAlign: 'right' }}>
            <Link href='/check' className={`text-color-primary`} width={'fit-content'} sx={{ py: 1, px: 3 }}>
              성능점검 앱
            </Link>
          </Box>
        </Drawer>
      )}
      {userData && openUser && <UserModal open={openUser} setOpen={setOpenUser} selectedUserData={userData} />}
    </AppBar>
  )
}
