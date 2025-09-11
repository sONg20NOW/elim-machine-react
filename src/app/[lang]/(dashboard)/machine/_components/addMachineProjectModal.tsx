'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import { DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import { toast } from 'react-toastify'

import type { MachineProjectCreateRequestDtoType } from '@/app/_type/types'
import { MachineProjectInitialData } from '@/app/_schema/seed/MachineProjectInitialData'
import DefaultModal from '@/app/_components/DefaultModal'
import { InputBox } from '@/components/selectbox/InputBox'
import { MACHINE_CREATE_INFO } from '@/app/_schema/input/MachineInputInfo'

type AddMachineProjectModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

export default function AddMachineProjectModal({ open, setOpen, handlePageChange }: AddMachineProjectModalProps) {
  const [newData, setNewData] = useState<MachineProjectCreateRequestDtoType>(MachineProjectInitialData)

  const onSubmitHandler = async () => {
    try {
      // 비고란을 제외한 칸이 하나라도 안 채워져있으면 경고 문구 표시 (basic만)
      const NotAllFull = Object.keys(newData).some(key => {
        if (key === 'note') {
          return false
        }

        return !newData[key as keyof typeof newData]
      })

      if (NotAllFull) {
        throw new Error(`비고를 제외한 모든 정보를 입력해주세요.`)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('new machine project added', result.data)
        toast.success('새 기계설비현장이 추가되었습니다.')

        handlePageChange()
        setOpen(false)
      } else {
        throw new Error(`${result.statusCode}:\n${result.message}`)
      }
    } catch (error: any) {
      toast.error(error.toString())
    }
  }

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title='기계설비현장 정보 추가'
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
