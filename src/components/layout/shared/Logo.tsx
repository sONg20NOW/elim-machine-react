'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Third-party Imports
import Image from 'next/image'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

const Logo = ({}: {}) => {
  const MAIN_LOGO_DOWNSIZING = 1.15

  // Refs
  const logoTextRef = useRef<HTMLSpanElement>(null)

  // Hooks
  const { isHovered, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div className='flex items-center'>
      <Image
        src={'/images/elim_main_logo.png'}
        alt='elim-main-logo'
        width={212 / MAIN_LOGO_DOWNSIZING}
        height={50 / MAIN_LOGO_DOWNSIZING}
      />
    </div>
  )
}

export default Logo
