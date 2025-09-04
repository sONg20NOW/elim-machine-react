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
import type { EditUserInfoData } from '@/app/_schema/types'
import MemberTabContent from './memberTabContent'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  handlePageChange: () => void
}

const AddUserModal = ({ open, setOpen, handlePageChange }: EditUserInfoProps) => {
  // States

  const [value, setValue] = useState<string>('1')
  const [userData, setUserData] = useState<EditUserInfoData>(initialData)

  const handleClose = () => {
    setOpen(false)
    setUserData(initialData)
  }

  const onSubmitHandler = async () => {
    const basicDto = { ...userData?.memberBasicResponseDto }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicDto)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('new employee added', result.data)
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
