'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import TabContext from '@mui/lab/TabContext'

import { DialogContent, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import type { TransitionProps } from '@mui/material/transitions'

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
  modifyButton?: ReactNode
  deleteButton?: ReactNode
  onClose?: () => void
  TransitionProps?: TransitionProps
}

/**
 *
 * @param childeren
 * (optional) TabList, TabPanel
 * @param value
 * (optional) 몇번째 탭인지 알려주는 상태.
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
  modifyButton,
  deleteButton,
  onClose = () => {
    setOpen(false)
  },
  TransitionProps
}: DefaultModalProps) {
  // States
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
      maxWidth={size}
      scroll='paper' // ✅ DialogContent 안에서만 스크롤
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      TransitionProps={TransitionProps}
    >
      {/* 닫기 버튼 */}
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={theme => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500]
        })}
      >
        <i className='tabler-x' />
      </IconButton>

      {/* 수정/삭제 버튼 */}
      <div className='absolute left-4 top-4 sm:left-8 sm:top-8 flex gap-2'>
        {modifyButton}
        {deleteButton}
      </div>

      {/* 제목 */}
      <DialogTitle
        variant='h4'
        className={classNames(
          ' flex items-center gap-0 sm:gap-2 whitespace-pre-wrap flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16',
          {
            'text-xl sm:text-3xl': size !== 'sm',
            'text-lg sm:text-xl': size === 'sm'
          }
        )}
      >
        {title}
        {headerDescription && (
          <Typography component='span' className='flex flex-col text-center'>
            {headerDescription}
          </Typography>
        )}
      </DialogTitle>

      {/* ✅ 스크롤 처리되는 본문 */}
      <DialogContent
        sx={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {value ? (
          children && <TabContext value={value}>{children}</TabContext>
        ) : (
          <>
            <Divider variant='middle' />
            {children}
          </>
        )}
      </DialogContent>

      {/* 하단 버튼 */}
      {(primaryButton || secondaryButton) && (
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
          {primaryButton}
          {secondaryButton}
        </DialogActions>
      )}
    </Dialog>
  )
}
