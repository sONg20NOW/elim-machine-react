// Type Imports
import type { ChildrenType } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import ReduxProvider from '@/redux-store/ReduxProvider'

// Util Imports
import { getSettingsFromCookie } from '@core/utils/serverHelpers'

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
          <ReduxProvider>{children}</ReduxProvider>
          {/* <AppReactToastify hideProgressBar /> */}
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers
