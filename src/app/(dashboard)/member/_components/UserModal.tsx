'use client'

// React Imports
import { createContext, useCallback, useRef, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { toast } from 'react-toastify'

import type { MemberDetailResponseDtoType } from '@/@core/types'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import { auth } from '@/lib/auth'
import type { MemberType } from '@/@core/hooks/customTanstackQueries'
import useCurrentUserStore from '@/@core/utils/useCurrentUserStore'
import ProgressedAlertModal from '@/@core/components/custom/ProgressedAlertModal'
import BasicTabContent from './tabs/BasicTabContent'
import PrivacyTabContent from './tabs/PrivacyTabContent'
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import { IconX } from '@tabler/icons-react'
import OfficeTabContent from './tabs/OfficeTabContent'
import CareerTabContent from './tabs/CareerTabContent'
import EtcTabContent from './tabs/EtcTabContent'

export type refType = {
  handleSave: () => void
  handleDontSave: () => void
  dirty: boolean
}

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
  onDelete?: () => void
  reloadPages?: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, selectedUserData, onDelete, reloadPages }: EditUserInfoProps) => {
  const changedEvenOnce = useRef(false)

  const [tabValue, setTabValue] = useState<tabType>('1')
  const [editData, setEditData] = useState<MemberDetailResponseDtoType>(structuredClone(selectedUserData))
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const [loading, setLoading] = useState(false)

  const basicTabRef = useRef<refType>(null)
  const privacyTabRef = useRef<refType>(null)
  const officeTabRef = useRef<refType>(null)
  const careerTabRef = useRef<refType>(null)
  const etcTabRef = useRef<refType>(null)

  const getIsDirty = useCallback(() => {
    return (
      basicTabRef.current?.dirty ||
      privacyTabRef.current?.dirty ||
      officeTabRef.current?.dirty ||
      careerTabRef.current?.dirty ||
      etcTabRef.current?.dirty
    )
  }, [])

  const memberId = { ...editData?.memberBasicResponseDto }.memberId
  const juminNum = { ...editData?.memberPrivacyResponseDto }.juminNum

  // 로그인한 사용자의 userModal인지 파악
  const currentuserId = useCurrentUserStore(set => set.currentUser)?.memberId
  const isYours = selectedUserData.memberBasicResponseDto.memberId === currentuserId

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
        onDelete && onDelete()
        changedEvenOnce.current = true
        onClose()
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
      const savedTabs: string[] = []

      if (basicTabRef.current?.dirty) {
        basicTabRef.current?.handleSave()
        savedTabs.push('기본정보')
      }

      if (privacyTabRef.current?.dirty) {
        privacyTabRef.current.handleSave()
        savedTabs.push('개인정보')
      }

      if (officeTabRef.current?.dirty) {
        officeTabRef.current.handleSave()
        savedTabs.push('재직정보')
      }

      if (careerTabRef.current?.dirty) {
        careerTabRef.current.handleSave()
        savedTabs.push('경력정보')
      }

      if (etcTabRef.current?.dirty) {
        etcTabRef.current.handleSave()
        savedTabs.push('기타정보')
      }
      if (savedTabs.length > 0) {
        handleSuccess(`${savedTabs.join(', ')}가 수정되었습니다`)

        changedEvenOnce.current = true
      }
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  // 실제로 창이 닫힐 때 동작하는 함수
  const onClose = useCallback(() => {
    if (changedEvenOnce.current) {
      reloadPages && reloadPages()
    }

    setOpen(false)
  }, [setOpen, reloadPages])

  // 창을 닫으려 할 때 동작하는 함수 - 변경사항이 있으면 경고창 출력
  const handleClose = useCallback(() => {
    if (getIsDirty()) {
      setShowAlertModal(true)
    } else {
      onClose()
    }
  }, [getIsDirty, onClose])

  const handleDontSave = useCallback(() => {
    setEditData(structuredClone(selectedUserData))
    setShowAlertModal(false)
    onClose()
  }, [onClose, selectedUserData])

  return (
    <MemberIdContext.Provider value={memberId ?? 0}>
      <Dialog
        onClose={(event, reason) => {
          if (reason === 'backdropClick') return
          handleClose()
        }}
        open={open}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle sx={{ position: 'relative' }}>
          <div className='flex flex-col w-full grid place-items-center'>
            <Typography variant='h3'>{selectedUserData?.memberBasicResponseDto?.name || '사용자 정보 수정'}</Typography>
            <Typography variant='subtitle1'>{selectedUserData?.memberBasicResponseDto?.companyName || ''}</Typography>
          </div>
          <div className='absolute left-8 top-6'>
            {isYours ? (
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
            )}
          </div>
          <IconButton type='button' onClick={handleClose} className='absolute right-4 top-4'>
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TabContext value={tabValue}>
            <div className='h-[60dvh] flex flex-col'>
              <TabList
                centered
                onChange={(event, newValue) => {
                  setTabValue(newValue)
                }}
                aria-label='centered tabs example'
              >
                {Object.keys(requestRule).map(item => {
                  const key = item as keyof typeof requestRule

                  return <Tab key={key} value={key} label={requestRule[key].label} />
                })}
              </TabList>
              <div className='flex-1 overflow-y-auto pt-5'>
                <TabPanel value='1' keepMounted>
                  {/* <MemberTabContent isEditing={true} tabName='basic' userData={editData} setUserData={setEditData} /> */}
                  <BasicTabContent ref={basicTabRef} defaultData={editData.memberBasicResponseDto} />
                </TabPanel>
                <TabPanel value='2' keepMounted>
                  <PrivacyTabContent ref={privacyTabRef} defaultData={editData.memberPrivacyResponseDto} />
                  {/* <MemberTabContent isEditing={true} tabName='privacy' userData={editData} setUserData={setEditData} /> */}
                </TabPanel>
                <TabPanel value='3' keepMounted>
                  <OfficeTabContent ref={officeTabRef} defaultData={editData.memberOfficeResponseDto} />
                  {/* <MemberTabContent isEditing={true} tabName='office' userData={editData} setUserData={setEditData} /> */}
                </TabPanel>
                <TabPanel value='4' keepMounted>
                  <CareerTabContent ref={careerTabRef} defaultData={editData.memberCareerResponseDto} />
                  {/* <MemberTabContent isEditing={true} tabName='career' userData={editData} setUserData={setEditData} /> */}
                </TabPanel>
                <TabPanel value='5' keepMounted>
                  <EtcTabContent ref={etcTabRef} defaultData={editData.memberEtcResponseDto} />
                  {/* <MemberTabContent isEditing={true} tabName='etc' userData={editData} setUserData={setEditData} /> */}
                </TabPanel>
              </div>
            </div>
          </TabContext>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 10 }}>
          <Button variant='contained' onClick={onSubmitHandler} type='submit' color='success' disabled={loading}>
            저장
          </Button>
          <Button variant='contained' color='secondary' onClick={handleClose}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {showDeleteModal && (
        <DeleteModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onDelete={onDeleteUserConfirm}
        />
      )}
      {showAlertModal && (
        <ProgressedAlertModal
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          handleDontSave={handleDontSave}
        />
      )}
    </MemberIdContext.Provider>
  )
}

export default UserModal
