'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import { DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import { toast } from 'react-toastify'

import type { MachineProjectCreateRequestDtoType } from '@/@core/types'
import { MachineProjectInitialData } from '@/app/_constants/MachineProjectSeed'
import DefaultModal from '@/@core/components/custom/DefaultModal'
import { InputBox } from '@/@core/components/custom/InputBox'
import { MACHINE_CREATE_INFO } from '@/app/_constants/input/MachineInputInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { auth } from '@/lib/auth'

type AddMachineProjectModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

export default function AddMachineProjectModal({ open, setOpen, reloadPage }: AddMachineProjectModalProps) {
  const [newData, setNewData] = useState<MachineProjectCreateRequestDtoType>(MachineProjectInitialData)
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async () => {
    try {
      if (newData.machineProjectName === '') {
        toast.error('현장명은 필수입력입니다.')

        return
      }

      setLoading(true)
      const response = await auth.post<{ data: MachineProjectCreateRequestDtoType }>(`/api/machine-projects`, newData)

      console.log('new machine project added', response.data.data)
      handleSuccess('새 기계설비현장이 추가되었습니다.')

      reloadPage()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title='신규 기계설비현장 추가'
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit' disabled={loading}>
          추가
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setOpen(false)}>
          취소
        </Button>
      }
    >
      <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
        <TableContainer sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px' }}>
          <Table size='small'>
            <TableBody>
              {Object.keys(newData).map(value => {
                const key = value as keyof typeof newData

                return (
                  <TableRow key={key}>
                    <TableCell
                      width={'30%'}
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'lightgray',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: 'medium'
                      }}
                    >
                      <span>
                        {MACHINE_CREATE_INFO[key]?.label}
                        {(key === 'companyName' || key === 'machineProjectName') && (
                          <sup style={{ fontSize: '16px', color: 'red' }}>*</sup>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InputBox
                        tabInfos={MACHINE_CREATE_INFO}
                        tabFieldKey={key}
                        value={newData[key]}
                        onChange={value => setNewData({ ...newData, [key]: value })}
                        showLabel={false}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </DefaultModal>
  )
}
