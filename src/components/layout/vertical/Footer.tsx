'use client'

// Component Imports
import Link from 'next/link'

import classnames from 'classnames'

// Next Imports

// Third-party Imports

// Hook Imports

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const Footer = () => {
  return (
    <div
      className={classnames(
        verticalLayoutClasses.footerContent,
        'pl-[10px] flex items-center justify-between flex-wrap  hidden md:flex'
      )}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made `}</span>
        <span className='text-textSecondary'>{` by Elim`}</span>
      </p>
      <Link href='/check' className={`text-color-primary`}>
        성능점검 앱
      </Link>
    </div>
  )
}

export default Footer
