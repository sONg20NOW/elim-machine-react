// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import LayoutContent from './components/vertical/LayoutContent'

type VerticalLayoutProps = ChildrenType & {
  navigation?: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
}

const VerticalLayout = (props: VerticalLayoutProps) => {
  // Props
  const { footer, navigation, children } = props

  return (
    <div className={'flex flex-auto'}>
      {navigation || null}
      <div className={'flex flex-col w-full px-[10px] pb-[10px] gap-[5px]'}>
        {/* Content */}
        <LayoutContent>{children}</LayoutContent>
        {footer || null}
      </div>
    </div>
  )
}

export default VerticalLayout
