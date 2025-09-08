'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import TabContext from '@mui/lab/TabContext'

import { IconButton, Typography } from '@mui/material'

type DefaultModalProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  value?: string
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  headerDescription?: string
  children?: ReactNode
  primaryButton?: ReactNode
  secondaryButton?: ReactNode
  deleteButton?: ReactNode
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
  size = 'md',
  value,
  open,
  setOpen,
  title,
  headerDescription,
  children,
  primaryButton,
  secondaryButton,
  deleteButton,
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
      maxWidth={size}
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
      <div className='absolute left-8 top-8'>{deleteButton}</div>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {title}
        <Typography component='span' className='flex flex-col text-center'>
          {headerDescription}
        </Typography>
      </DialogTitle>
      <div>{value && children && <TabContext value={value}>{children}</TabContext>}</div>
      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
        {primaryButton}
        {secondaryButton}
      </DialogActions>
    </Dialog>
  )
}
