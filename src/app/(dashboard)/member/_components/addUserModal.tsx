'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { DialogContent, Grid2 } from '@mui/material'

import axios from 'axios'

import DefaultModal from '@/app/_components/modal/DefaultModal'
import type { MemberCreateRequestDtoType } from '@/app/_type/types'
import { MEMBER_INPUT_INFO } from '@/app/_constants/input/MemberInputInfo'
import { MemberInitialData } from '@/app/_constants/MemberSeed'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

type AddUserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

const AddUserModal = ({ open, setOpen, handlePageChange }: AddUserModalProps) => {
  const [userData, setUserData] = useState<MemberCreateRequestDtoType>(MemberInitialData)

  const onSubmitHandler = async () => {
    try {
      const response = await axios.post<{ data: MemberCreateRequestDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`,
        userData
      )

      console.log('new member added', response.data.data)
      handleSuccess('새 직원이 추가되었습니다.')

      handlePageChange()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      open={open}
      setOpen={setOpen}
      title='신규 직원 추가'
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
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
        <Grid2 container spacing={3}>
          {Object.keys(userData).map(property => {
            const key = property as keyof typeof userData

            return (
              <InputBox
                required={key === 'name' || key === 'email'}
                key={key}
                tabInfos={MEMBER_INPUT_INFO.basic}
                tabFieldKey={key}
                value={userData[key] ?? ''}
                onChange={(value: string) => {
                  setUserData({
                    ...userData,
                    [key]: value
                  })
                }}
              />
            )
          })}
        </Grid2>
      </DialogContent>
    </DefaultModal>
  )
}

export default AddUserModal
