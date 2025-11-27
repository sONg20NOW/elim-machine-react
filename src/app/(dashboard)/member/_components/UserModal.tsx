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

import DefaultModal from '@/@core/components/custom/DefaultModal'
import MemberTabContent from './memberTabContent'
import type {
  MemberBasicDtoType,
  MemberCareerDtoType,
  MemberEtcDtoType,
  MemberOfficeDtoType,
  MemberPrivacyDtoType,
  MemberDetailResponseDtoType
} from '@/@core/types'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import AlertModal from '@/@core/components/custom/AlertModal'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import DisabledTabWithTooltip from '@/@core/components/custom/DisabledTabWithTooltip'
import { auth } from '@/lib/auth'
import type { MemberType } from '@/@core/hooks/customTanstackQueries'
import { useMutateSingleMember } from '@/@core/hooks/customTanstackQueries'
import useCurrentUserStore from '@/@core/utils/useCurrentUserStore'

type requestRuleBodyType = {
  url: string
  value: MemberType
  label: string
  dtoKey: keyof MemberDetailResponseDtoType
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
  selectedUserData: MemberDetailResponseDtoType
  reloadData?: (offset?: number) => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, selectedUserData, reloadData }: EditUserInfoProps) => {
  const [tabValue, setTabValue] = useState<tabType>('1')
  const [editData, setEditData] = useState<MemberDetailResponseDtoType>(structuredClone(selectedUserData))
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

  const [loading, setLoading] = useState(false)

  const [onQuit, setOnQuit] = useState<() => void>()

  // 수정사항 여부
  const existChange = JSON.stringify(editData) !== JSON.stringify(selectedUserData)

  const memberId = { ...editData?.memberBasicResponseDto }.memberId
  const juminNum = { ...editData?.memberPrivacyResponseDto }.juminNum

  // 로그인한 사용자의 userModal인지 파악
  const currentuserId = useCurrentUserStore(set => set.currentUser)?.memberId
  const isYours = selectedUserData.memberBasicResponseDto.memberId === currentuserId

  // const { mutateAsync: mutateBasicAsync } = useMutateSingleMemberBasic(memberId.toString())
  const { mutateAsync: mutateBasicAsync } = useMutateSingleMember<MemberBasicDtoType>(memberId.toString(), 'basic')

  const { mutateAsync: mutatePrivacyAsync } = useMutateSingleMember<MemberPrivacyDtoType>(
    memberId.toString(),
    'privacy'
  )

  const { mutateAsync: mutateOfficeAsync } = useMutateSingleMember<MemberOfficeDtoType>(memberId.toString(), 'office')
  const { mutateAsync: mutateCareerAsync } = useMutateSingleMember<MemberCareerDtoType>(memberId.toString(), 'career')
  const { mutateAsync: mutateEtcAsync } = useMutateSingleMember<MemberEtcDtoType>(memberId.toString(), 'etc')

  const { currentUser, setCurrentUserName } = useCurrentUserStore()

  const handleDeleteUser = async () => {
    const version = editData.memberBasicResponseDto?.version

    if (version !== undefined && memberId !== undefined) {
      try {
        await auth.delete(`/api/members`, {
          // @ts-ignore
          data: { memberDeleteRequestDtos: [{ memberId: memberId, version: version }] }
        })

        console.log(`memberId: ${memberId} user is deleted successfully`)
        handleSuccess('해당 직원이 삭제되었습니다.')
        handleClose(-1)
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
      setLoading(true)
      const requestInfo = requestRule[tabValue]

      switch (tabValue) {
        case '1':
          const newBasic = await mutateBasicAsync(editData.memberBasicResponseDto)

          setEditData({ ...editData, memberBasicResponseDto: newBasic })
          console.log(`${requestInfo.value} info saved: `, newBasic)
          handleSuccess(`${requestInfo.label}가 수정되었습니다.`)

          // 헤더에서 사용하는 정보 업데이트 (현재 로그인 중인 사용자의 정보라면)
          if (currentUser && currentUser.memberId === newBasic.memberId) {
            setCurrentUserName(newBasic.name)
          }

          setIsEditing(false)
          break
        case '2':
          const newPrivacy = await mutatePrivacyAsync(editData.memberPrivacyResponseDto)

          setEditData({ ...editData, memberPrivacyResponseDto: newPrivacy })
          console.log(`${requestInfo.value} info saved: `, newPrivacy)
          handleSuccess(`${requestInfo.label}가 수정되었습니다.`)
          setIsEditing(false)
          break
        case '3':
          const newOffice = await mutateOfficeAsync(editData.memberOfficeResponseDto)

          setEditData({ ...editData, memberOfficeResponseDto: newOffice })
          console.log(`${requestInfo.value} info saved: `, newOffice)
          handleSuccess(`${requestInfo.label}가 수정되었습니다.`)
          setIsEditing(false)
          break
        case '4':
          const newCareer = await mutateCareerAsync(editData.memberCareerResponseDto)

          setEditData({ ...editData, memberCareerResponseDto: newCareer })
          console.log(`${requestInfo.value} info saved: `, newCareer)
          handleSuccess(`${requestInfo.label}가 수정되었습니다.`)
          setIsEditing(false)
          break
        case '5':
          const newEtc = await mutateEtcAsync(editData.memberEtcResponseDto)

          setEditData({ ...editData, memberEtcResponseDto: newEtc })
          console.log(`${requestInfo.value} info saved: `, newEtc)
          handleSuccess(`${requestInfo.label}가 수정되었습니다.`)
          setIsEditing(false)
          break
        default:
          break
      }
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  function handleClose(offset?: number) {
    reloadData && reloadData(offset)
    setOpen(false)
  }

  return (
    <MemberIdContext.Provider value={memberId ?? 0}>
      <DefaultModal
        value={tabValue}
        onClose={() => {
          if (existChange) {
            setOnQuit(handleClose)
            setShowAlertModal(true)
          } else {
            handleClose()
          }
        }}
        open={open}
        setOpen={setOpen}
        title={selectedUserData?.memberBasicResponseDto?.name || '사용자 정보 수정'}
        headerDescription={selectedUserData?.memberBasicResponseDto?.companyName || '사용자 정보 수정'}
        primaryButton={
          isEditing ? (
            <Button variant='contained' onClick={onSubmitHandler} type='submit' color='success' disabled={loading}>
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
          isYours ? (
            <Button
              color='warning'
              onClick={() => {
                toast.warning('곧 추가될 기능입니다')
              }}
            >
              비밀번호 변경
            </Button>
          ) : (
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
                  setOnQuit(undefined)
                  setShowAlertModal(true)
                } else {
                  setIsEditing(false)
                }
              }}
            >
              취소
            </Button>
          ) : (
            <Button variant='contained' color='secondary' onClick={() => handleClose()}>
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
              setTabValue(newValue)
            }
          }}
          aria-label='centered tabs example'
        >
          {Object.keys(requestRule).map(item => {
            const key = item as keyof typeof requestRule

            return existChange && tabValue !== key ? (
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
          <AlertModal<MemberDetailResponseDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            setIsEditing={setIsEditing}
            originalData={selectedUserData}
            onQuit={onQuit}
          />
        )}
      </DefaultModal>
    </MemberIdContext.Provider>
  )
}

export default UserModal
