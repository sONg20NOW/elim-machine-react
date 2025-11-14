'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { createContext, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import type { EngineerResponseDtoType } from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { ENGINEER_INPUT_INFO } from '@/app/_constants/input/EngineerInputInfo'
import DeleteModal from '@/@core/components/custom/DeleteModal'

import styles from '@/app/_style/Table.module.css'
import { gradeOption } from '@/app/_constants/options'
import { auth } from '@/lib/auth'

type UserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: EngineerResponseDtoType
  setData: Dispatch<SetStateAction<EngineerResponseDtoType | undefined>>
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, data, setData, reloadData }: UserModalProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isDirty }
  } = useForm<EngineerResponseDtoType>({ defaultValues: data })

  const watchedVersion = watch('version')
  const engineerId = data.id

  const handleDeleteUser = async () => {
    try {
      setLoading(true)

      await auth.delete(`/api/engineers`, {
        // @ts-ignore
        data: { engineerDeleteRequestDtos: [{ engineerId: engineerId, version: watchedVersion }] }
      })

      handleSuccess('설비인력에서 삭제되었습니다.')
      setShowDeleteModal(false)
      setOpen(false)
      reloadData()
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async (data: EngineerResponseDtoType) => {
    try {
      setLoading(true)

      const response = await auth.put<{ data: EngineerResponseDtoType }>(`/api/engineers/${engineerId}`, data)

      const returnData = response.data.data

      reset(returnData)
      setData(returnData)

      console.log(`info saved: `, returnData)
      handleSuccess(`설비인력 정보가 수정되었습니다.`)
      reloadData()
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (isDirty) {
      setShowAlertModal(true)
    } else {
      setOpen(false)
    }
  }

  return (
    <form id='submit-engineer-form' onSubmit={handleSubmit(handleSaveUser)}>
      <DefaultModal
        size='sm'
        open={open}
        setOpen={setOpen}
        title={<Typography variant='h3'>{data.name}</Typography>}
        onClose={handleClose}
        headerDescription={data.engineerLicenseNum}
        primaryButton={
          <div className='flex justify-end gap-2 w-full'>
            <div className='flex items-end gap-1'>
              {!isDirty && <Typography color='error.main'>변경사항이 없습니다</Typography>}
              <Button variant='contained' type='submit' disabled={!isDirty || loading} form={'submit-engineer-form'}>
                저장
              </Button>
            </div>
            <Button variant='contained' color='secondary' onClick={handleClose}>
              닫기
            </Button>
          </div>
        }
        modifyButton={
          <Button
            variant='contained'
            color='error'
            type='reset'
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            삭제
          </Button>
        }
      >
        <DialogContent className={`flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4 ${styles.container}`}>
          <table style={{ fontSize: 18 }}>
            <tbody>
              <tr>
                <th style={{ width: '1%', whiteSpace: 'nowrap' }}>이름</th>
                <td colSpan={4}>
                  <TextField
                    slotProps={{ input: { sx: { fontSize: 'inherit' } } }}
                    {...register('name')}
                    fullWidth
                    size='small'
                    variant='standard'
                    placeholder='이름을 입력하세요'
                  />
                </td>
              </tr>
              <tr>
                <th style={{ width: 1, whiteSpace: 'nowrap' }}>이메일</th>
                <td colSpan={4}>
                  <TextField
                    slotProps={{ input: { sx: { fontSize: 'inherit' } } }}
                    {...register('email')}
                    fullWidth
                    size='small'
                    variant='standard'
                    placeholder='이메일을 입력하세요'
                  />
                </td>
              </tr>
              <tr>
                <th style={{ width: 1, whiteSpace: 'nowrap' }}>휴대폰 번호</th>
                <td colSpan={4}>
                  <TextField
                    slotProps={{ input: { sx: { fontSize: 'inherit' } } }}
                    {...register('phoneNumber')}
                    fullWidth
                    size='small'
                    variant='standard'
                    placeholder='휴대폰 번호를 입력하세요'
                  />
                </td>
              </tr>
              <tr>
                <th style={{ width: 1, whiteSpace: 'nowrap' }}>등급</th>
                <td colSpan={4}>
                  <Controller
                    control={control}
                    name='grade'
                    render={({ field }) => (
                      <TextField
                        slotProps={{ input: { sx: { paddingInlineEnd: 5, fontSize: 'inherit' } } }}
                        value={field.value}
                        onChange={field.onChange}
                        select
                        size='small'
                        variant='standard'
                        placeholder='등급을 입력하세요'
                      >
                        {gradeOption.map(v => (
                          <MenuItem key={v.value} value={v.value}>
                            {v.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </td>
              </tr>
              <tr>
                <th style={{ width: 1, whiteSpace: 'nowrap' }}>수첩발급번호</th>
                <td colSpan={4}>
                  <TextField
                    slotProps={{ input: { sx: { fontSize: 'inherit' } } }}
                    {...register('engineerLicenseNum')}
                    fullWidth
                    size='small'
                    variant='standard'
                    placeholder='수첩발급번호를 입력하세요'
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className='flex flex-col gap-1 text-[18px]'>
            <span className='font-extrabold'>{ENGINEER_INPUT_INFO.remark?.label}</span>
            <TextField
              slotProps={{ input: { sx: { fontSize: 'inherit' } } }}
              {...register('remark')}
              fullWidth
              multiline
              minRows={3}
              size='small'
              placeholder='비고를 입력하세요'
            />
          </div>
          {showDeleteModal && (
            <DeleteModal
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              onDelete={handleDeleteUser}
            />
          )}
          {
            <Dialog open={showAlertModal}>
              <DialogTitle variant='h4'>
                변경사항을 저장하지 않았습니다
                <DialogContentText>나가시면 변경사항이 폐기됩니다</DialogContentText>
              </DialogTitle>
              <DialogActions>
                <Button variant='contained' color='error' type='button' onClick={() => setOpen(false)}>
                  저장하지 않음
                </Button>
                <Button variant='contained' color='secondary' type='button' onClick={() => setShowAlertModal(false)}>
                  취소
                </Button>
              </DialogActions>
            </Dialog>
          }
        </DialogContent>
      </DefaultModal>
    </form>
  )
}

export default UserModal
