'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { toast } from 'react-toastify'

import { DialogContent, Grid2 } from '@mui/material'

import DefaultModal from '@/app/_components/DefaultModal'
import type { MemberCreateRequestDtoType } from '@/app/_type/types'
import { MEMBER_INPUT_INFO } from '@/app/_schema/input/MemberInputInfo'
import { MemberInitialData } from '@/app/_constants/MemberSeed'
import { InputBox } from '@/app/_components/selectbox/InputBox'

type AddUserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

const AddUserModal = ({ open, setOpen, handlePageChange }: AddUserModalProps) => {
  const [userData, setUserData] = useState<MemberCreateRequestDtoType>(MemberInitialData)

  const onSubmitHandler = async () => {
    try {
      // 비고란을 제외한 칸이 하나라도 안 채워져있으면 경고 문구 표시 (basic만)
      const NotAllFull = Object.keys(userData).some(key => {
        if (key === 'note') {
          return false
        }

        return !userData[key as keyof typeof userData]
      })

      if (NotAllFull) {
        throw new Error(`비고를 제외한 모든 정보를 입력해주세요.`)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('new member added', result.data)
        toast.success('새 직원이 추가되었습니다.')

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
      open={open}
      setOpen={setOpen}
      title='사용자 정보 추가'
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
        <Grid2 container spacing={3}>
          {Object.keys(userData).map(property => {
            const key = property as keyof typeof userData

            return (
              <InputBox
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
