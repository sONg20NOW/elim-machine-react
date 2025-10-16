import Script from 'next/script'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { BROWER_TAB_DESCRIPTION, BROWER_TAB_TITLE } from './_constants/table/TableHeader'

export const metadata = {
  title: BROWER_TAB_TITLE,
  description: BROWER_TAB_DESCRIPTION
}

const RootLayout = async (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const headersList = await headers()
  const systemMode = 'light'

  // const direction = i18n.langDirection[params.lang]

  return (
    <html id='__next' suppressHydrationWarning>
      <head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <link rel='icon' href='/images/elim_icon.png?v=2' />
      </head>
      <Script src='//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'></Script>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        {children}
        <ToastContainer autoClose={3000} />
      </body>
    </html>
  )
}

export default RootLayout
