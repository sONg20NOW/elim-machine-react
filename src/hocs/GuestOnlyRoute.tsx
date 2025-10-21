// Type Imports
import type { ChildrenType } from '@/@core/types'
import type { Locale } from '@configs/i18n'

const GuestOnlyRoute = async ({ children }: ChildrenType & { lang: Locale }) => {
  // NextAuth removed - always allow access
  return <>{children}</>
}

export default GuestOnlyRoute
