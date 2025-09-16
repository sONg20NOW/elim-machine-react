import Script from 'next/script'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { BROWER_TAB_DESCRIPTION, BROWER_TAB_TITLE } from './_schema/TableHeader'

export const metadata = {
  title: BROWER_TAB_TITLE,
  description: BROWER_TAB_DESCRIPTION
}

const RootLayout = async (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const headersList = await headers()
  const systemMode = await getSystemMode()

  // const direction = i18n.langDirection[params.lang]

  return (
    <html id='__next' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/images/elim_icon.png?v=2' />
      </head>
      <Script src='//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'></Script>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
