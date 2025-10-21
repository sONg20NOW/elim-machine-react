// Type Imports

import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports

import ScrollToTopButton from '@/@core/components/custom/ScrollToTopButton'
import ProtectedPage from '../../@core/components/custom/ProtectedPage'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const direction = i18n.langDirection[params.lang]
  return (
    <Providers>
      <ProtectedPage>
        {children}
        <ScrollToTopButton />
      </ProtectedPage>
    </Providers>
  )
}

export default Layout
