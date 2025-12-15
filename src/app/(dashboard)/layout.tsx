// Type Imports

import type { ChildrenType } from '@core/types'

// Component Imports
import Navigation from '@components/layout/vertical/Navigation'
import VerticalFooter from '@components/layout/vertical/Footer'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports
import { getMode } from '@core/utils/serverHelpers'

import ScrollToTopButton from '@/@core/components/elim-button/ScrollToTopButton'
import Header from '@/components/layout/vertical/Header'
import ProtectedPage from '../../components/ProtectedPage'

const Layout = async (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const direction = i18n.langDirection[params.lang]
  const mode = await getMode()

  return (
    <ProtectedPage>
      <div className='h-[100dvh] flex flex-col'>
        <Header />
        {/* 내비게이션 바 + 메인 영역 */}
        <div className='flex-1 flex overflow-y-hidden'>
          <Navigation mode={mode} />
          <div className='flex-1 px-3 pt-3 h-full flex flex-col bg-indigo-100/50'>
            <div className='w-full flex-1 overflow-y-hidden'>{children}</div>
            <VerticalFooter />
          </div>
        </div>
        <ScrollToTopButton />
      </div>
    </ProtectedPage>
  )
}

export default Layout
