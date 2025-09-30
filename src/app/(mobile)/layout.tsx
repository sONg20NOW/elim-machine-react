// Type Imports

import { AppBar, Toolbar } from '@mui/material'

import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports

import ScrollToTopButton from '@/app/_components/button/ScrollToTopButton'
import ProtectedPage from '../_components/ProtectedPage'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const direction = i18n.langDirection[params.lang]
  return (
    <Providers>
      <ProtectedPage isNotWeb>
        {/* 헤더 */}
        <AppBar position='static'>
          <Toolbar></Toolbar>
        </AppBar>
        <div className='px-[10px] flex flex-col w-full justify-between h-full'>
          <div className='flex-auto w-full pt-[10px] pb-[10px]'>
            <div className='flex flex- auto relative h-full'>{children}</div>
          </div>
        </div>
        <ScrollToTopButton />
      </ProtectedPage>
    </Providers>
  )
}

export default Layout
