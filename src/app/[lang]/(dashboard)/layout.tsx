// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import VerticalFooter from '@components/layout/vertical/Footer'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode } from '@core/utils/serverHelpers'
import ScrollToTopButton from '@/@layouts/components/ScrollToTopButton'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params

  const { children } = props

  // Vars
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = await getMode()

  return (
    <Providers direction={direction}>
      <div className={'flex flex- auto relative'}>
        <Navigation dictionary={dictionary} mode={mode} />
        <div className='flex flex-col w-full px-[10px] pb-[10px] gap-[5px]'>
          <div className='flex-auto w-full pt-[10px] pb-[10px]'>{children}</div>
          <VerticalFooter />
        </div>
      </div>
      <ScrollToTopButton />
    </Providers>
  )
}

export default Layout
