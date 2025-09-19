'use client'

// React Imports
import { createContext, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { toast } from 'react-toastify'

import axios from 'axios'

import DefaultModal from '@/app/_components/modal/DefaultModal'
import MemberTabContent from './memberTabContent'
import type { memberDetailDtoType } from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import AlertModal from '@/app/_components/modal/AlertModal'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import DisabledTabWithTooltip from '@/app/_components/DisabledTabWithTooltip'

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
  selectedUserData: memberDetailDtoType
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, selectedUserData, reloadData }: EditUserInfoProps) => {
  const [value, setValue] = useState<tabType>('1')
  const [editData, setEditData] = useState<memberDetailDtoType>(JSON.parse(JSON.stringify(selectedUserData)))
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

  // 수정사항 여부
  const existChange = JSON.stringify(editData) !== JSON.stringify(selectedUserData)

  const memberId = { ...editData?.memberBasicResponseDto }.memberId
  const juminNum = { ...editData?.memberPrivacyResponseDto }.juminNum

  const handleDeleteUser = async () => {
    const version = editData.memberBasicResponseDto?.version

    if (version !== undefined && memberId !== undefined) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members`, {
          // @ts-ignore
          data: { memberDeleteRequestDtos: [{ memberId: memberId, version: version }] }
        })

        console.log(`memberId: ${memberId} user is deleted successfully`)
        handleSuccess('해당 직원이 삭제되었습니다.')
        setOpen(false)
      } catch (error) {
        handleApiError(error)
      }
    } else {
      handleApiError(version, '버전 혹은 memberId가 없습니다.')
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
      setEditData({
        ...editData,
        memberPrivacyResponseDto: {
          ...editData.memberPrivacyResponseDto,
          juminNum: ''
        }
      })
    }

    try {
      const response = await axios.put<{ data: memberDetailDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/members/${memberId}${requestRule[value].url}`,
        { ...editData[requestRule[value].dtoKey] }
      )

      const returnData = response.data.data

      setEditData({
        ...editData,
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
        onClose={() => {
          if (existChange) {
            setShowAlertModal(true)
          } else {
            setOpen(false)
          }
        }}
        open={open}
        setOpen={setOpen}
        title={selectedUserData?.memberBasicResponseDto?.name || '사용자 정보 수정'}
        headerDescription={selectedUserData?.memberBasicResponseDto?.companyName || '사용자 정보 수정'}
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
          isEditing ? (
            <Button
              variant='contained'
              color='secondary'
              type='reset'
              onClick={() => {
                if (existChange) {
                  setShowAlertModal(true)
                } else {
                  setIsEditing(false)
                }
              }}
            >
              취소
            </Button>
          ) : (
            <Button variant='contained' color='secondary' onClick={() => setOpen(false)}>
              닫기
            </Button>
          )
        }
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

            return existChange && value !== key ? (
              <DisabledTabWithTooltip key={key} value={key} label={requestRule[key].label} />
            ) : (
              <Tab key={key} value={key} label={requestRule[key].label} />
            )
          })}
        </TabList>
        <TabPanel value='1'>
          <MemberTabContent isEditing={isEditing} tabName='basic' userData={editData} setUserData={setEditData} />
        </TabPanel>
        <TabPanel value='2'>
          <MemberTabContent isEditing={isEditing} tabName='privacy' userData={editData} setUserData={setEditData} />
        </TabPanel>
        <TabPanel value='3'>
          <MemberTabContent isEditing={isEditing} tabName='office' userData={editData} setUserData={setEditData} />
        </TabPanel>
        <TabPanel value='4'>
          <MemberTabContent isEditing={isEditing} tabName='career' userData={editData} setUserData={setEditData} />
        </TabPanel>
        <TabPanel value='5'>
          <MemberTabContent isEditing={isEditing} tabName='etc' userData={editData} setUserData={setEditData} />
        </TabPanel>
        {showDeleteModal && (
          <DeleteModal
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            onDelete={onDeleteUserConfirm}
          />
        )}
        {showAlertModal && (
          <AlertModal<memberDetailDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            setIsEditing={setIsEditing}
            originalData={selectedUserData}
          />
        )}
      </DefaultModal>
    </MemberIdContext.Provider>
  )
}

export default UserModal
