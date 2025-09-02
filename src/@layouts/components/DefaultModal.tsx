'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import TabContext from '@mui/lab/TabContext'

import { IconButton } from '@mui/material'

type DefaultModalProps = {
  value: string
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  children?: ReactNode
  primaryButton?: ReactNode
  secondaryButton?: ReactNode
  handleClose?: () => void
}

/**
 *
 * @param childeren
 * TabList, TabPanel
 * @param value
 * 몇번째 탭인지 알려주는 상태.
 * @returns
 * modal component 리턴.
 */
export default function DefaultModal({
  value,
  open,
  setOpen,
  title,
  children,
  primaryButton,
  secondaryButton,
  handleClose = () => {
    setOpen(false)
  }
}: DefaultModalProps) {
  // States
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={theme => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500]
        })}
      >
        <i className='tabler-x' />
      </IconButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {title}
      </DialogTitle>
      <div>
        <TabContext value={value}>{children}</TabContext>
      </div>
      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
        {primaryButton}
        {secondaryButton}
      </DialogActions>
    </Dialog>
  )
}
