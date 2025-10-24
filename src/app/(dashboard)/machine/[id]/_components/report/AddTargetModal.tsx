import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputLabel,
  TextField,
  Typography
} from '@mui/material'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'

interface formType {
  name1: string
  name2: string
  name3: string
}

export default function AddTargetModal() {
  const [open, setOpen] = useState(false)

  const { register } = useForm<formType>()

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant='contained'
        color='warning'
        endIcon={<i className='tabler-settings-filled text-xl' />}
      >
        장소 관리
      </Button>
      <Dialog open={open}>
        <DialogTitle>
          <div className='flex justify-between items-center'>
            <Typography variant='h4'>장소 관리</Typography>
            <IconButton size='small' type='button' onClick={() => setOpen(false)}>
              <i className='tabler-x text-error' />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>장소는 최대 세개까지 관리할 수 있습니다.</DialogContentText>
          <div className='flex flex-col gap-4 mt-5'>
            <SpaceInput register={register('name1')} idx={1} />
            <SpaceInput register={register('name2')} idx={2} />
            <SpaceInput register={register('name3')} idx={3} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button type='submit' color='warning' variant='contained'>
            저장
          </Button>
          <Button color='secondary' type='button' variant='contained'>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function SpaceInput({ register, idx }: { register: UseFormRegisterReturn; idx: number }) {
  return (
    <div className='grid gap-1'>
      <InputLabel>장소 {idx}</InputLabel>
      <TextField {...register} size='small' />
    </div>
  )
}
