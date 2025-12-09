import { useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
  Typography
} from '@mui/material'

import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'

import { motion } from 'motion/react'

import { IconCheck, IconPlus, IconSettingsFilled, IconTrashFilled, IconX } from '@tabler/icons-react'

import { auth } from '@/@core/utils/auth'
import { handleApiError } from '@/@core/utils/errorHandler'
import { useGetEnergyTargets } from '@/@core/hooks/customTanstackQueries'
import type { targetType } from '@/@core/types'

export default function AddTargetModal({ machineEnergyTypeId }: { machineEnergyTypeId: number }) {
  const params = useParams()

  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const { data: targets, refetch } = useGetEnergyTargets(`${params.id}`, `${machineEnergyTypeId}`)

  const handleAddTarget = async () => {
    if (!inputRef.current) return

    try {
      const newName = inputRef.current.value

      const response = await auth
        .post<{ data: { machineEnergyTargetIds: number[] } }>(
          `/api/machine-projects/${params.id}/machine-energy-targets?machineEnergyTypeId=${machineEnergyTypeId}`,
          {
            machineEnergyTargets: [{ name: newName }]
          }
        )
        .then(p => p.data.data.machineEnergyTargetIds)

      inputRef.current.value = ''
      refetch()

      // await auth.post(`/api/machine-project-energy-types`, {
      //   machineProjectEnergyTypes: [1, 2, 3, 4].map(value => ({
      //     machineProjectId: params.id,
      //     machineEnergyTypeId: value
      //   }))
      // })

      console.log('target 추가 완료:', response)
      toast.success('장소가 추가되었습니다.')
    } catch (e) {
      handleApiError(e)
    }
  }

  const handleDeleteTarget = async (target: targetType) => {
    try {
      await auth.delete(
        `/api/machine-projects/${params.id}/machine-energy-targets?machineEnergyTypeId=${machineEnergyTypeId}`,
        {
          // @ts-ignore
          data: {
            ids: [target.machineEnergyTargetId]
          }
        }
      )

      refetch()
      console.log('target 삭제 완료:', target.machineEnergyTargetId)
      toast.warning(`'장소명: ${target.name}'가 삭제되었습니다`)
    } catch (e) {
      handleApiError(e)
    }
  }

  const handleModifyTargetName = async (target: targetType, name: string) => {
    try {
      await auth.put(`/api/machine-projects/${params.id}/machine-energy-targets`, {
        machineEnergyTargets: [{ id: target.machineEnergyTargetId, name: name }]
      })

      console.log(`target 이름이 변경되었습니다. ${target.name} -> ${name}`)
      toast.success(`${target.name}의 이름이 변경되었습니다`)
      refetch()
    } catch (e) {
      handleApiError(e)
    }
  }

  return (
    <form>
      <Button
        onClick={() => setOpen(true)}
        variant='contained'
        color='warning'
        endIcon={<IconSettingsFilled size={20} />}
      >
        장소 관리
      </Button>
      <Dialog open={open} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ position: 'relative' }}>
          <div className='flex justify-between items-center'>
            <Typography variant='h4'>장소 관리</Typography>
            <IconButton
              sx={{ position: 'absolute', top: 5, right: 5 }}
              size='small'
              type='button'
              onClick={() => setOpen(false)}
            >
              <IconX />
            </IconButton>
          </div>
          <Divider />
        </DialogTitle>
        <DialogContent>
          <div className='grid gap-5'>
            <div className='grid gap-1'>
              <InputLabel>추가할 장소명</InputLabel>
              <div className='flex items-center justify-between gap-3'>
                <TextField inputRef={inputRef} size='small' sx={{ flex: 1 }} />
                <Fab size='small' type='button' color='secondary' onClick={handleAddTarget}>
                  <IconPlus />
                </Fab>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <Typography>기존 장소 목록</Typography>

              <Box sx={{ border: '1px dashed lightgray', borderRadius: 1, p: 2, display: 'grid', gap: 1 }}>
                {targets && targets.length > 0 ? (
                  targets.map(target => (
                    <TargetBox
                      key={target.machineEnergyTargetId}
                      target={target}
                      handleDeleteTarget={() => handleDeleteTarget(target)}
                      handleModifyTargetName={handleModifyTargetName}
                    />
                  ))
                ) : (
                  <div className='grid place-items-center'>
                    <Typography>장소를 추가해주세요</Typography>
                  </div>
                )}
              </Box>
            </div>
          </div>
        </DialogContent>
        {/* <DialogActions>
          <Button type='button' color='warning' variant='contained'>
            추가
          </Button>
          <Button color='secondary' type='button' variant='contained' onClick={() => setOpen(false)}>
            취소
          </Button>
        </DialogActions> */}
      </Dialog>
    </form>
  )
}

interface TargetBoxProps {
  target: targetType
  handleDeleteTarget: () => void
  handleModifyTargetName: (target: targetType, name: string) => void
}

function TargetBox({ target, handleDeleteTarget, handleModifyTargetName }: TargetBoxProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<{ name: string }>({ defaultValues: { name: target.name } })

  const MotionInputAdornment = motion.create(InputAdornment)

  function changeName(data: { name: string }) {
    handleModifyTargetName(target, data.name)
    reset({ name: data.name })
  }

  return (
    <form onSubmit={handleSubmit(changeName)}>
      <TextField
        fullWidth
        variant='standard'
        {...register('name')}
        sx={{ p: 2, border: '1px solid lightgray', borderRadius: 2 }}
        slotProps={{
          input: {
            endAdornment: (
              <div className='flex items-center'>
                <MotionInputAdornment
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={!isDirty ? 'text-green-400/0' : 'text-green-500'}
                  position='end'
                >
                  <IconButton disabled={!isDirty} type='submit' size='small'>
                    <IconCheck size={25} />
                  </IconButton>
                </MotionInputAdornment>

                <InputAdornment className='text-red-400' position='end'>
                  <IconButton size='small' type='button' onClick={handleDeleteTarget}>
                    <IconTrashFilled size={25} />
                  </IconButton>
                </InputAdornment>
              </div>
            )
          }
        }}
        defaultValue={name}
      />
    </form>
  )
}
