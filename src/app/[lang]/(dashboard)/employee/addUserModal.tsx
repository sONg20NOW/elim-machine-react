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

import axios from 'axios'

import DialogCloseButton from './DialogCloseButton'
import BasicContent from './BasicContent'
import { initialData } from '@/data/initialData/userInfo'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AddUserModal = ({ open, setOpen }: EditUserInfoProps) => {
  // States

  const [value, setValue] = useState<string>('1')
  const [userData, setUserData] = useState<any>(initialData)

  const handleClose = () => {
    setOpen(false)
    setUserData(initialData)
  }

  const onSubmitHandler = async () => {
    const basicDto = { ...userData?.memberBasicResponseDto }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, basicDto)

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
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {'사용자 정보 추가'}
      </DialogTitle>

      <div>
        <TabContext value={value}>
          <TabList centered onChange={handleChange} aria-label='centered tabs example'>
            <Tab value='1' label='기본정보' />
          </TabList>
          <TabPanel value='1'>
            <BasicContent userData={userData} setUserData={setUserData} />
          </TabPanel>
        </TabContext>
      </div>
      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
          추가하기
        </Button>
        <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddUserModal
