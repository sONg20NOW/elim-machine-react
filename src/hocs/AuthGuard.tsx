// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// export default async function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
export default async function AuthGuard({ children }: ChildrenType & { locale: Locale }) {
  // NextAuth removed - always allow access
  return <>{children}</>
}
