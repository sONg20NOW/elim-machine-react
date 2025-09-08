'use client'

// React Imports
import type { SyntheticEvent } from 'react'
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { toast } from 'react-toastify'

import { initialData } from '@/data/initialData/userInfo'
import DefaultModal from '@/app/_components/DefaultModal'
import type { memberDetailDtoType } from '@/app/_type/types'
import MemberTabContent from './memberTabContent'
import { MEMBER_INPUT_INFO } from '@/app/_schema/input/MemberInputInfo'

type AddUserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

const AddUserModal = ({ open, setOpen, handlePageChange }: AddUserModalProps) => {
  // 선택된 탭
  const [value, setValue] = useState<string>('1')

  // 직원 데이터
  const [userData, setUserData] = useState<memberDetailDtoType>(initialData)

  const handleClose = () => {
    setOpen(false)
    setUserData(initialData)
  }

  const onSubmitHandler = async () => {
    const basicDto = { ...userData?.memberBasicResponseDto }

    // 비고란을 제외한 칸이 하나라도 안 채워져있으면 경고 문구 표시 (basic만)
    const NotAllFull = Object.keys(MEMBER_INPUT_INFO.basic).some(key => {
      if (key === 'note') {
        return false
      }

      return !basicDto[key as keyof typeof basicDto]
    })

    if (NotAllFull) {
      toast.error('비고를 제외한 모든 정보를 입력해주세요.')

      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicDto)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('new member added', result.data)
        toast.success('새 직원이 추가되었습니다.')
      } else {
        toast.error(`${result.statusCode}:\n${result.message}`)
      }
    } catch (error: any) {
      toast.error(error)
    }

    handlePageChange()
    setOpen(false)
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <DefaultModal
      value={value}
      open={open}
      setOpen={setOpen}
      title='사용자 정보 추가'
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
          추가하기
        </Button>
      }
      secondaryButton={
        <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
          취소
        </Button>
      }
    >
      <TabList centered onChange={handleChange} aria-label='centered tabs example'>
        <Tab value='1' label='기본정보' />
      </TabList>
      <TabPanel value='1'>
        <MemberTabContent tabName='basic' userData={userData} setUserData={setUserData} />
      </TabPanel>
    </DefaultModal>
  )
}

export default AddUserModal
