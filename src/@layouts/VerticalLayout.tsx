// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports

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
        <main className='flex-auto w-full pt-[5px] pb-[10px]'>{children}</main>
        {footer || null}
      </div>
    </div>
  )
}

export default VerticalLayout
