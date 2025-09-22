'use client'

// Component Imports
import Link from 'next/link'

import classnames from 'classnames'

import useVerticalNav from '@/@menu/hooks/useVerticalNav'

// Next Imports

// Third-party Imports

// Hook Imports

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const Footer = () => {
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(
        verticalLayoutClasses.footerContent,
        'pl-[10px] flex items-center justify-between flex-wrap gap-4 pr-[50px] hidden sm:flex'
      )}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made `}</span>
        <span className='text-textSecondary'>{` by Elim`}</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='https://elimsafety.com/' target='_blank' className={`text-color-primary`}>
            Go to Elim
          </Link>
        </div>
      )}
    </div>
  )
}

export default Footer
