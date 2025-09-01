'use client'

// React Imports
import type { SyntheticEvent } from 'react'
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import axios from 'axios'

import DialogCloseButton from './DialogCloseButton'
import BasicContent from './BasicContent'
import CareerContent from './CareerContent'
import PrivacyContent from './PrivacyContent'
import MemberOfficeContent from './memberOfficeContent'
import type { EditUserInfoData } from '@/data/type/userInfoTypes'
import { initialData } from '@/data/initialData/userInfo'
import EtcContent from './etcContent'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: EditUserInfoData
}

const UserModal = ({ open, setOpen, data }: EditUserInfoProps) => {
  // States

  const [value, setValue] = useState<string>('1')
  const [userData, setUserData] = useState<EditUserInfoProps['data']>(data || initialData)
  const [tab, setTab] = useState<number>(1)

  const handleClose = () => {
    setOpen(false)
    setUserData(data || initialData)
  }

  const onSubmitHandler = async () => {
    // 주민번호에 *이 없을 때만 포함
    const basicDto = { ...userData?.memberBasicResponseDto }
    const privacyDto = { ...userData?.memberPrivacyResponseDto }

    if (privacyDto?.juminNum && privacyDto.juminNum.includes('*')) {
      // *이 있으면 주민번호를 빈 값으로 보냄
      privacyDto.juminNum = ''
    }

    switch (tab) {
      case 1:
        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}`,
            basicDto
          )

          console.log('Basic info saved:', response.data)
          alert('기본 정보가 저장되었습니다.')
        } catch (error) {
          console.error(error)
        }

        break

      case 2:
        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}/privacy`,
            privacyDto
          )

          console.log('Privacy info saved:', response.data)
          alert('개인 정보가 저장되었습니다.')
        } catch (error) {
          console.error(error)
        }

        break

      case 3:
        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}/office`,
            userData?.memberOfficeResponseDto
          )

          console.log('Office info saved:', response.data)
          alert('재직 정보가 저장되었습니다.')
        } catch (error) {
          console.error(error)
        }

        break

      case 4:
        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}/career`,
            userData?.memberCareerResponseDto
          )

          console.log('Career info saved:', response.data)
          alert('경력 정보가 저장되었습니다.')
        } catch (error) {
          console.error(error)
        }

        break

      case 5:
        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}/etc`,
            userData?.memberEtcResponseDto
          )

          console.log('Etc info saved:', response.data)
          alert('기타 정보가 저장되었습니다.')
        } catch (error) {
          console.error(error)
        }

        break
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
        {data?.memberBasicResponseDto?.name || '사용자 정보 수정'}
        <Typography component='span' className='flex flex-col text-center'>
          {data?.memberBasicResponseDto?.companyName || '사용자 정보 수정'}
        </Typography>
      </DialogTitle>

      <div>
        <TabContext value={value}>
          <TabList centered onChange={handleChange} aria-label='centered tabs example'>
            <Tab value='1' label='기본정보' onClick={() => setTab(1)} />
            <Tab value='2' label='개인정보' onClick={() => setTab(2)} />
            <Tab value='3' label='재직정보' onClick={() => setTab(3)} />
            <Tab value='4' label='경력' onClick={() => setTab(4)} />
            <Tab value='5' label='기타' onClick={() => setTab(5)} />
          </TabList>
          <TabPanel value='1'>
            <BasicContent userData={userData} setUserData={setUserData} />
          </TabPanel>
          <TabPanel value='2'>
            <PrivacyContent userData={userData} setUserData={setUserData} />
          </TabPanel>
          <TabPanel value='3'>
            <MemberOfficeContent userData={userData} setUserData={setUserData} />
          </TabPanel>
          <TabPanel value='4'>
            <CareerContent userData={userData} setUserData={setUserData} />
          </TabPanel>
          <TabPanel value='5'>
            <EtcContent userData={userData} setUserData={setUserData} />
          </TabPanel>
        </TabContext>
      </div>
      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
          수정하기
        </Button>
        <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserModal
