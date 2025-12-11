// Type Imports
import type { ChildrenType } from '@/@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'

// Util Imports
import { getSettingsFromCookie } from '@core/utils/serverHelpers'
import QueryClientWrapper from './QueryClientWrapper'
import ClientSnackbarProvider from './ClientSnackbarProvider'
import { MediaQueriesProvider } from '@/@core/contexts/mediaQueryContext'

type Props = ChildrenType

const Providers = async (props: Props) => {
  // Props
  const { children } = props

  // Vars
  const mode = 'light'
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = 'light'

  return (
    <VerticalNavProvider>
      <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
        <ThemeProvider direction={'ltr'} systemMode={systemMode}>
          <MediaQueriesProvider>
            <QueryClientWrapper>
              <ClientSnackbarProvider>{children}</ClientSnackbarProvider>
            </QueryClientWrapper>
          </MediaQueriesProvider>
          {/* <AppReactToastify hideProgressBar /> */}
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers
