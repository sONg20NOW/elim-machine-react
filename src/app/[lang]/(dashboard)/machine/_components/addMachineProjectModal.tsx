'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import axios from 'axios'

import { DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import type { MachineProjectCreateRequestDtoType } from '@/app/_type/types'
import { MachineProjectInitialData } from '@/app/_constants/MachineProjectSeed'
import DefaultModal from '@/app/_components/DefaultModal'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { MACHINE_CREATE_INFO } from '@/app/_schema/input/MachineInputInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

type AddMachineProjectModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

export default function AddMachineProjectModal({ open, setOpen, reloadPage }: AddMachineProjectModalProps) {
  const [newData, setNewData] = useState<MachineProjectCreateRequestDtoType>(MachineProjectInitialData)

  const onSubmitHandler = async () => {
    try {
      const response = await axios.post<{ data: MachineProjectCreateRequestDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects`,
        newData
      )

      console.log('new machine project added', response.data.data)
      handleSuccess('새 기계설비현장이 추가되었습니다.')

      reloadPage()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title='신규 기계설비현장 추가'
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
          추가하기
        </Button>
      }
      secondaryButton={
        <Button variant='tonal' color='secondary' type='reset' onClick={() => setOpen(false)}>
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
                      {MACHINE_CREATE_INFO[key]?.label}
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
