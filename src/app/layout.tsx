import Script from 'next/script'

import type { Metadata } from 'next'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

import { SpeedInsights } from '@vercel/speed-insights/next'

// Type Imports
import { SnackbarProvider } from 'notistack'

import type { ChildrenType } from '@/@core/types'

// Component Imports

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const BROWER_TAB_TITLE = 'ELIM'
const BROWER_TAB_DESCRIPTION = 'Elim-safety 114'

export const metadata: Metadata = {
  title: BROWER_TAB_TITLE,
  description: BROWER_TAB_DESCRIPTION
}

const RootLayout = (props: ChildrenType) => {
  // const params = await props.params

  const { children } = props

  // Vars
  // const headersList = await headers()
  const systemMode = 'light'

  // const direction = i18n.langDirection[params.lang]
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/sw.js')
  // }

  return (
    <html id='__next' suppressHydrationWarning>
      <head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <link rel='icon' href='/images/elim_icon.png?v=2' />
      </head>
      <Script src='//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'></Script>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        {/* 클라이언트 전용 SW 등록 컴포넌트 */}
        {/* <ServiceWorkerRegister /> */}
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <SnackbarProvider maxSnack={3} autoHideDuration={1000}>
          {children}
        </SnackbarProvider>
        <SpeedInsights />
        <ToastContainer autoClose={3000} position='bottom-left' />
      </body>
    </html>
  )
}

export default RootLayout
