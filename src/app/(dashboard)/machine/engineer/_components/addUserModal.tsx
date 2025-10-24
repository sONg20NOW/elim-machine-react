'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import {
  Autocomplete,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField
} from '@mui/material'

import axios from 'axios'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import { InputBox } from '@/@core/components/custom/InputBox'
import type { memberLookupResponseDtoType, MachineEngineerCreateRequestDtoType } from '@/@core/types'

import { EngineerInitialData } from '@/app/_constants/EngineerSeed'
import { ENGINEER_INPUT_INFO } from '@/app/_constants/input/EngineerInputInfo'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

type AddUserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

const AddUserModal = ({ open, setOpen, reloadPage }: AddUserModalProps) => {
  const [userData, setUserData] = useState<MachineEngineerCreateRequestDtoType>(EngineerInitialData)
  const [memberList, setMemberList] = useState<memberLookupResponseDtoType[]>([])

  // 멤버 리스트 가져오기
  const getMemberList = useCallback(async () => {
    try {
      const response = await axios.get<{ data: { memberLookupResponseDtos: memberLookupResponseDtoType[] } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/lookup`
      )

      const result = response.data.data.memberLookupResponseDtos

      setMemberList(result)
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  useEffect(() => {
    getMemberList()
  }, [getMemberList])

  // 추가 핸들러
  const onSubmitHandler = async () => {
    try {
      const response = await axios.post<{ data: MachineEngineerCreateRequestDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers`,
        userData
      )

      console.log('new member added', response.data.data)
      handleSuccess('새 직원이 추가되었습니다.')

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
      title={'신규 설비인력 추가'}
      primaryButton={
        <Button variant='contained' onClick={() => onSubmitHandler()} type='submit'>
          추가
        </Button>
      }
      secondaryButton={
        <Button variant='tonal' color='secondary' type='reset' onClick={() => setOpen(false)}>
          취소
        </Button>
      }
    >
      <DialogContent className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <TableContainer sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px' }}>
          <Table size='small'>
            <TableBody>
              {Object.keys(userData).map(value => {
                if (['remark'].includes(value)) return null
                const key = value as keyof typeof userData

                return (
                  <TableRow key={key}>
                    {key === 'memberId' ? (
                      <>
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
                            이름<sup style={{ color: 'red' }}>*</sup>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            onChange={(_, value) =>
                              setUserData({ ...userData, [key as keyof typeof userData]: value?.value })
                            }
                            size='small'
                            options={memberList.map(member => {
                              return { label: `${member.name} (${member.email})`, value: member.memberId }
                            })}
                            renderInput={params => <TextField {...params} />}
                          />
                        </TableCell>
                      </>
                    ) : (
                      <>
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
                          {ENGINEER_INPUT_INFO[key]?.label}
                        </TableCell>
                        <TableCell>
                          <InputBox
                            tabInfos={ENGINEER_INPUT_INFO}
                            tabFieldKey={key}
                            value={userData[key]}
                            onChange={value => setUserData({ ...userData, [key]: value })}
                            showLabel={false}
                          />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div className='flex flex-col gap-1'>
          <span className='font-extrabold'>{ENGINEER_INPUT_INFO.remark?.label}</span>
          <InputBox
            tabInfos={ENGINEER_INPUT_INFO}
            tabFieldKey={'remark'}
            value={userData.remark}
            onChange={value => setUserData({ ...userData, remark: value })}
            showLabel={false}
          />
        </div>
      </DialogContent>
    </DefaultModal>
  )
}

export default AddUserModal
