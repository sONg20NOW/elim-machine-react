'use client'

// Component Imports
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
        'px-[10px] flex items-center justify-between flex-wrap  hidden md:flex'
      )}
    >
      <div className='flex items-center gap-6'>
        <p>
          <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made `}</span>
          <span className='text-textSecondary'>{` by Elim`}</span>
        </p>
      </div>
      {/* <Link href='/check' className={`text-color-primary`}>
        성능점검 앱
      </Link> */}
    </div>
  )
}

export default Footer
