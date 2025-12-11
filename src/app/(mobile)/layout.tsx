// Type Imports

import type { ChildrenType } from '@core/types'

// Config Imports
// import { i18n } from '@configs/i18n'

// Util Imports

import ScrollToTopButton from '@/@core/components/elim-button/ScrollToTopButton'
import ProtectedPage from '../../components/ProtectedPage'

const Layout = async (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const direction = i18n.langDirection[params.lang]
  return (
    <ProtectedPage>
      {children}
      <ScrollToTopButton />
    </ProtectedPage>
  )
}

export default Layout
