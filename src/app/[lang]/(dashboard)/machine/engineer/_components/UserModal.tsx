'use client'

// React Imports
import { createContext, useEffect, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { Box, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import axios from 'axios'

import { initialData } from '@/data/initialData/userInfo'
import DefaultModal from '@/app/_components/DefaultModal'
import type { EngineerResponseDtoType } from '@/app/_type/types'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { ENGINEER_INPUT_INFO } from '@/app/_schema/input/EngineerInputInfo'

type UserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: EngineerResponseDtoType
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, data, reloadData }: UserModalProps) => {
  const [userData, setUserData] = useState(data)

  const [isEditing, setIsEditing] = useState(false)
  const [unsavedUserData, setUnsavedUserData] = useState(data ?? initialData)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 수정할 때마다 unsavedUserData를 userData와 동기화
  useEffect(() => {
    setUnsavedUserData(userData)
  }, [isEditing])

  const engineerId = userData.id

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/${engineerId}`)

      handleSuccess('설비인력이 정상적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleModifyUser = async () => {
    try {
      console.log(userData)

      const response = await axios.put<{ data: EngineerResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/${engineerId}`,
        userData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

      const returnData = response.data.data

      setUserData(returnData)

      console.log(`info saved: `, returnData)
      handleSuccess(`설비인력 정보가 수정되었습니다.`)
      setIsEditing(false)
      reloadData()
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title={unsavedUserData.name}
      headerDescription={unsavedUserData.engineerLicenseNum}
      primaryButton={
        !isEditing ? (
          <Button variant='contained' onClick={() => setIsEditing(true)} type='submit'>
            수정하기
          </Button>
        ) : (
          <Button variant='contained' onClick={() => handleModifyUser()} type='submit'>
            저장
          </Button>
        )
      }
      secondaryButton={
        isEditing && (
          <Button
            variant='tonal'
            color='secondary'
            type='reset'
            onClick={() => {
              setIsEditing(false)
              setUserData(unsavedUserData)
            }}
          >
            취소
          </Button>
        )
      }
      modifyButton={
        isEditing && (
          <Button variant='contained' color='error' type='reset' onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        )
      }
    >
      <DialogContent className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <TableContainer sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px' }}>
          <Table size='small'>
            <TableBody>
              {Object.keys(userData).map(value => {
                if (['id', 'version', 'remark'].includes(value)) return null
                const key = value as keyof typeof userData

                return (
                  <TableRow key={key}>
                    <TableCell
                      width={'30%'}
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'lightgray',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: 'medium'
                      }}
                    >
                      {ENGINEER_INPUT_INFO[key]?.label}
                    </TableCell>
                    <TableCell>
                      <InputBox
                        isEditing={isEditing}
                        tabInfos={ENGINEER_INPUT_INFO}
                        tabFieldKey={key}
                        value={userData[key] as string}
                        onChange={value => setUserData({ ...unsavedUserData, [key]: value })}
                        showLabel={false}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div className='flex flex-col gap-1'>
          <span className='font-extrabold'>{ENGINEER_INPUT_INFO.remark.label}</span>
          {isEditing ? (
            <InputBox
              tabInfos={ENGINEER_INPUT_INFO}
              tabFieldKey={'remark'}
              value={userData.remark}
              onChange={value => setUserData({ ...userData, remark: value })}
              showLabel={false}
            />
          ) : (
            <Box
              sx={{
                border: 'solid 1px',
                borderColor: 'lightgray',
                borderRadius: '8px',
                padding: 3,
                whiteSpace: 'pre-wrap',
                minHeight: 110
              }}
            >
              {userData.remark}
            </Box>
          )}
        </div>
        {showDeleteModal && (
          <DefaultModal
            size='xs'
            open={showDeleteModal}
            setOpen={setShowDeleteModal}
            title={'정말 삭제하시겠습니까?'}
            headerDescription='삭제 후에는 되돌리지 못합니다.'
            primaryButton={
              <Button variant='contained' color='error' onClick={handleDeleteUser} type='submit'>
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
      </DialogContent>
    </DefaultModal>
  )
}

export default UserModal
