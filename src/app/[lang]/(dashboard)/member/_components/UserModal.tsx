'use client'

// React Imports
import { createContext, useEffect, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { toast } from 'react-toastify'

import axios from 'axios'

import DefaultModal from '@/app/_components/DefaultModal'
import MemberTabContent from './memberTabContent'
import type { memberDetailDtoType } from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

type requestRuleBodyType = {
  url: string
  value: string
  label: string
  dtoKey: keyof memberDetailDtoType
}

type tabType = '1' | '2' | '3' | '4' | '5'

const requestRule: Record<tabType, requestRuleBodyType> = {
  '1': {
    url: '',
    label: '기본정보',
    value: 'basic',
    dtoKey: 'memberBasicResponseDto'
  },
  '2': {
    url: '/member-privacy',
    label: '개인정보',
    value: 'privacy',
    dtoKey: 'memberPrivacyResponseDto'
  },
  '3': {
    url: '/member-office',
    label: '재직정보',
    value: 'office',
    dtoKey: 'memberOfficeResponseDto'
  },
  '4': {
    url: '/member-career',
    label: '경력정보',
    value: 'career',
    dtoKey: 'memberCareerResponseDto'
  },
  '5': {
    url: '/member-etc',
    label: '기타정보',
    value: 'etc',
    dtoKey: 'memberEtcResponseDto'
  }
}

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: memberDetailDtoType
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, data, reloadData }: EditUserInfoProps) => {
  const [value, setValue] = useState<tabType>('1')
  const [userData, setUserData] = useState(data)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [unsavedUserData, setUnsavedUserData] = useState(data)

  // 수정할 때마다 unsavedUserData를 userData와 동기화
  useEffect(() => {
    setUnsavedUserData(userData)
  }, [isEditing])

  // 수정사항 여부
  const existChange = JSON.stringify(userData) !== JSON.stringify(unsavedUserData)

  const memberId = { ...userData?.memberBasicResponseDto }.memberId
  const juminNum = { ...userData?.memberPrivacyResponseDto }.juminNum

  const handleDeleteUser = async () => {
    const version = userData.memberBasicResponseDto?.version

    if (version !== undefined && memberId !== undefined) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberDeleteList: [{ memberId: memberId, version: version }] })
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`memberId: ${memberId} user is deleted successfully`)
        toast.info('해당 직원이 삭제되었습니다.')
      } else {
        throw new Error(result.message)
      }

      setOpen(false)
    } else {
      throw new Error('delete fail!')
    }
  }

  const onDeleteUserConfirm = async () => {
    try {
      await handleDeleteUser()
      reloadData()
    } catch (error: any) {
      toast.error(`${error.message}`)
    }
  }

  const onSubmitHandler = async () => {
    // 주민번호에 *이 있으면 빈 값으로 변경
    if (juminNum && juminNum.includes('*')) {
      setUserData({
        ...userData,
        memberPrivacyResponseDto: {
          ...userData.memberPrivacyResponseDto,
          juminNum: ''
        }
      })
    }

    try {
      const response = await axios.put<{ data: memberDetailDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${memberId}${requestRule[value].url}`,
        { ...userData[requestRule[value].dtoKey] },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

      const returnData = response.data.data

      setUserData({
        ...userData,
        [requestRule[value].dtoKey]: returnData
      })
      console.log(`${requestRule[value].value} info saved: `, returnData)
      handleSuccess(`${requestRule[value].label}가 수정되었습니다.`)
      setIsEditing(false)
      reloadData()
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <MemberIdContext.Provider value={memberId ?? 0}>
      <DefaultModal
        value={value}
        open={open}
        setOpen={setOpen}
        title={unsavedUserData?.memberBasicResponseDto?.name || '사용자 정보 수정'}
        headerDescription={data?.memberBasicResponseDto?.companyName || '사용자 정보 수정'}
        primaryButton={
          isEditing ? (
            <Button variant='contained' onClick={onSubmitHandler} type='submit'>
              저장
            </Button>
          ) : (
            <Button
              variant='contained'
              color='primary'
              type='reset'
              onClick={() => {
                setIsEditing(true)
              }}
            >
              수정
            </Button>
          )
        }
        modifyButton={
          isEditing && (
            <Button
              variant='contained'
              color='error'
              type='reset'
              onClick={() => {
                setShowDeleteModal(true)
              }}
            >
              삭제
            </Button>
          )
        }
        secondaryButton={
          <Button variant='tonal' color='secondary' type='reset' onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
        }
        handleClose={() => setOpen(false)}
      >
        <TabList
          centered
          onChange={(event, newValue) => {
            if (existChange) {
              setShowAlertModal(true)
            } else {
              setValue(newValue)
            }
          }}
          aria-label='centered tabs example'
        >
          {Object.keys(requestRule).map(item => {
            const key = item as keyof typeof requestRule

            return <Tab disabled={existChange && value !== key} key={key} value={key} label={requestRule[key].label} />
          })}
        </TabList>
        <TabPanel value='1'>
          <MemberTabContent isEditing={isEditing} tabName='basic' userData={userData} setUserData={setUserData} />
        </TabPanel>
        <TabPanel value='2'>
          <MemberTabContent isEditing={isEditing} tabName='privacy' userData={userData} setUserData={setUserData} />
        </TabPanel>
        <TabPanel value='3'>
          <MemberTabContent isEditing={isEditing} tabName='office' userData={userData} setUserData={setUserData} />
        </TabPanel>
        <TabPanel value='4'>
          <MemberTabContent isEditing={isEditing} tabName='career' userData={userData} setUserData={setUserData} />
        </TabPanel>
        <TabPanel value='5'>
          <MemberTabContent isEditing={isEditing} tabName='etc' userData={userData} setUserData={setUserData} />
        </TabPanel>
        {showDeleteModal && (
          <DefaultModal
            size='xs'
            open={showDeleteModal}
            setOpen={setShowDeleteModal}
            title={'정말 삭제하시겠습니까?'}
            headerDescription='삭제 후에는 되돌리지 못합니다.'
            primaryButton={
              <Button
                variant='contained'
                className='bg-color-warning hover:bg-color-warning-light'
                onClick={onDeleteUserConfirm}
                type='submit'
              >
                삭제
              </Button>
            }
            secondaryButton={
              <Button variant='tonal' color='secondary' type='reset' onClick={() => setShowDeleteModal(false)}>
                취소
              </Button>
            }
          />
        )}
        {showAlertModal && (
          <DefaultModal
            size='xs'
            open={showAlertModal}
            setOpen={setShowAlertModal}
            title={'저장하지 않고 나가시겠습니까?'}
            headerDescription='지금까지 수정한 내용이 저장되지 않습니다. 그래도 나가시겠습니까?'
            primaryButton={
              <Button
                variant='contained'
                className='bg-color-warning hover:bg-color-warning-light'
                onClick={() => {
                  setUserData(unsavedUserData)
                  setShowAlertModal(false)
                  setIsEditing(false)
                }}
                type='submit'
              >
                저장하지 않음
              </Button>
            }
            secondaryButton={
              <Button variant='tonal' color='secondary' type='reset' onClick={() => setShowAlertModal(false)}>
                취소
              </Button>
            }
          />
        )}
      </DefaultModal>
    </MemberIdContext.Provider>
  )
}

export default UserModal
