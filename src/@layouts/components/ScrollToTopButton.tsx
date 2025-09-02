'use client'

import { Button } from '@mui/material'

import ScrollToTop from '@/@core/components/scroll-to-top'

export default function ScrollToTopButton() {
  return (
    <ScrollToTop className='mui-fixed'>
      <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
        <i className='tabler-arrow-up' />
      </Button>
    </ScrollToTop>
  )
}
