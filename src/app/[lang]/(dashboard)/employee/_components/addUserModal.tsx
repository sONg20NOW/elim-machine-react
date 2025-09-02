'use client'

// React Imports
import type { SyntheticEvent } from 'react'
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import { IconButton } from '@mui/material'

import BasicContent from './BasicContent'
import { initialData } from '@/data/initialData/userInfo'
import type { EditUserInfoData } from '@/data/type/userInfoTypes'
import DefaultModal from '@/@layouts/components/DefaultModal'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AddUserModal = ({ open, setOpen }: EditUserInfoProps) => {
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
        body: {}
      })

      console.log('Basic info saved:', response.data)
      alert('기본 정보가 저장되었습니다.')
    } catch (error) {
      console.error(error)
    }
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
        <BasicContent userData={userData} setUserData={setUserData} />
      </TabPanel>
    </DefaultModal>
  )
}

export default AddUserModal
