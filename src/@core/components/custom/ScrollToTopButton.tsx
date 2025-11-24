'use client'

import { Box, Button, Fade, useScrollTrigger } from '@mui/material'
import { IconArrowUp } from '@tabler/icons-react'

export default function ScrollToTopButton() {
  const trigger = useScrollTrigger({
    threshold: 200,
    disableHysteresis: true
  })

  const handleClick = () => {
    const anchor = document.querySelector('body')

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Fade in={trigger}>
      <Box onClick={handleClick} role='presentation' sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Button
          variant='contained'
          className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center hidden sm:flex'
        >
          <IconArrowUp />
        </Button>
      </Box>
    </Fade>
  )
}
