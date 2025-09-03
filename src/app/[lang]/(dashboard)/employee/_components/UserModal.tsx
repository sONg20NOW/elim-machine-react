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

import BasicContent from './BasicContent'
import CareerContent from './CareerContent'
import PrivacyContent from './PrivacyContent'
import MemberOfficeContent from './memberOfficeContent'
import type { EditUserInfoData } from '@/data/type/userInfoTypes'
import { initialData } from '@/data/initialData/userInfo'
import EtcContent from './etcContent'
import DefaultModal from '@/app/_components/DefaultModal'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: EditUserInfoData
  handlePageChange: () => void
}

const requestRule = {
  basic: {
    url: '',
    text: '기본정보',
    value: 1
  },
  privacy: {
    url: '/member-privacy',
    text: '개인정보',
    value: 2
  },
  office: {
    url: '/member-office',
    text: '재직정보',
    value: 3
  },
  career: {
    url: '/member-career',
    text: '경력정보',
    value: 4
  },
  etc: {
    url: '/memeber-etc',
    text: '기타정보',
    value: 5
  }
}

const UserModal = ({ open, setOpen, data, handlePageChange }: EditUserInfoProps) => {
  // States

  const [value, setValue] = useState<string>('1')
  const [userData, setUserData] = useState<EditUserInfoData>(data ?? initialData)

  const handleClose = () => {
    setOpen(false)
    setUserData(data || initialData)
  }

  const onSubmitHandler = async () => {
    // 주민번호에 *이 없을 때만 포함
    const basicDto = { ...userData?.memberBasicResponseDto }
    const privacyDto = { ...userData?.memberPrivacyResponseDto }
    const officeDto = { ...userData?.memberOfficeResponseDto }
    const careerDto = { ...userData?.memberCareerResponseDto }
    const etcDto = { ...userData?.memberEtcResponseDto }

    if (privacyDto?.juminNum && privacyDto.juminNum.includes('*')) {
      // *이 있으면 주민번호를 빈 값으로 보냄
      privacyDto.juminNum = ''
    }

    try {
      let infoType: keyof typeof requestRule | '' = ''
      let bodyData = {}

      switch (value) {
        case '1':
          infoType = 'basic'
          bodyData = basicDto
          break

        case '2':
          infoType = 'privacy'
          bodyData = privacyDto
          break

        case '3':
          infoType = 'office'
          bodyData = officeDto
          break

        case '4':
          infoType = 'career'
          bodyData = careerDto
          break

        case '5':
          infoType = 'etc'
          bodyData = etcDto
          break
      }

      if (infoType === '') {
        throw new Error('invalid post request')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${basicDto?.memberId}${requestRule[infoType].url}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        }
      )

      const result = await response.json()

      if (response.ok) {
        console.log(`${infoType} info saved: `, result.data)
        toast.success(`${requestRule[infoType].text}가 수정되었습니다.`)
      } else {
        toast.error(result.message)
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
      title={data?.memberBasicResponseDto?.name || '사용자 정보 수정'}
      headerDescription={data?.memberBasicResponseDto?.companyName || '사용자 정보 수정'}
      primaryButton={
        <Button variant='contained' onClick={onSubmitHandler} type='submit'>
          수정하기
        </Button>
      }
      secondaryButton={
        <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
          취소
        </Button>
      }
      handleClose={() => handleClose()}
    >
      <TabList centered onChange={handleChange} aria-label='centered tabs example'>
        {Object.keys(requestRule).map(key => {
          return (
            <Tab
              key={key}
              value={requestRule[key as keyof typeof requestRule].value.toString()}
              label={requestRule[key as keyof typeof requestRule].text}
              onClick={() => setValue(requestRule[key as keyof typeof requestRule].value.toString())}
            />
          )
        })}
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
    </DefaultModal>
  )
}

export default UserModal
