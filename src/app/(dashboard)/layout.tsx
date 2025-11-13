// Type Imports

import type { ChildrenType } from '@/@core/types'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import VerticalFooter from '@components/layout/vertical/Footer'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports
import { getMode } from '@core/utils/serverHelpers'

import ScrollToTopButton from '@/@core/components/custom/ScrollToTopButton'
import Header from '@/components/layout/vertical/Header'
import ProtectedPage from '../../@core/components/custom/ProtectedPage'

const Layout = async (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const direction = i18n.langDirection[params.lang]
  const mode = await getMode()

  return (
    <Providers>
      <ProtectedPage>
        <Header />
        <div className='flex flex-auto relative h-full'>
          <Navigation mode={mode} />
          <div className='w-full pb-[10px]'>
            <div className='px-[10px] flex flex-col w-full justify-between h-full'>
              <div className='flex-auto w-full pt-[10px] pb-[10px]'>{children}</div>
              <VerticalFooter />
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </ProtectedPage>
    </Providers>
  )
}

export default Layout
