'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { createContext, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { Box, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import axios from 'axios'

import DefaultModal from '@/app/_components/modal/DefaultModal'
import type { LicenseResponseDtoType } from '@/app/_type/types'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { LICENSE_INPUT_INFO } from '@/app/_schema/input/LicenseInputInfo'
import DeleteModal from '@/app/_components/modal/DeleteModal'

type DetailModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialData: LicenseResponseDtoType
  setInitialData: Dispatch<SetStateAction<LicenseResponseDtoType | undefined>>
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const groups = {
  dontShow: ['id', 'version', 'jibunAddress'],
  single: ['remark'],
  group1: ['companyName', 'companyNameAbbr', 'bizno', 'ceoName', 'managerName', 'managerEmail'],
  group2: ['contractDate', 'expireDate', 'homepageAddr', 'tel', 'fax', 'taxEmail'],

  addressGroup: ['roadAddress', 'detailAddress', 'businessType', 'businessCategory']
}

const DetailModal = ({ open, setOpen, initialData, setInitialData, reloadData }: DetailModalProps) => {
  const [editData, setEditData] = useState<LicenseResponseDtoType>(JSON.parse(JSON.stringify(initialData)))

  const [isEditing, setIsEditing] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const licenseId = editData.id

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses/${licenseId}`)

      handleSuccess('라이선스가 정상적으로 삭제되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleModifyData = async () => {
    try {
      const response = await axios.put<{ data: LicenseResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses/${licenseId}`,
        editData
      )

      const returnData = response.data.data

      setEditData(returnData)
      setInitialData(returnData)

      handleSuccess(`라이선스 정보가 수정되었습니다.`)
      setIsEditing(false)
      reloadData()
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      size='md'
      open={open}
      setOpen={setOpen}
      title={initialData.companyName}
      headerDescription={initialData.bizno}
      primaryButton={
        !isEditing ? (
          <Button variant='contained' onClick={() => setIsEditing(true)} type='submit'>
            수정하기
          </Button>
        ) : (
          <Button variant='contained' onClick={() => handleModifyData()} type='submit'>
            저장
          </Button>
        )
      }
      secondaryButton={
        isEditing ? (
          <Button
            variant='tonal'
            color='secondary'
            type='reset'
            onClick={() => {
              setIsEditing(false)
              setEditData(JSON.parse(JSON.stringify(initialData)))
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
      modifyButton={
        isEditing && (
          <Button variant='contained' color='error' type='reset' onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        )
      }
    >
      <DialogContent className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <div className='flex gap-0'>
          <TableContainer
            sx={{
              border: 'solid 1px',
              borderColor: 'lightgray',
              borderRadius: '8px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              flex: 1
            }}
          >
            <Table size='small'>
              <TableBody>
                {groups.group1.map(value => {
                  const key = value as keyof typeof editData

                  return (
                    <TableRow key={key}>
                      <TableCell
                        width={'30%'}
                        sx={{
                          borderRight: '1px solid',
                          borderColor: 'lightgray',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: 'medium',

                          // ! background color 주기
                          backgroundColor: ''
                        }}
                      >
                        {LICENSE_INPUT_INFO[key]?.label}
                      </TableCell>
                      <TableCell>
                        <InputBox
                          isEditing={isEditing}
                          tabInfos={LICENSE_INPUT_INFO}
                          tabFieldKey={key}
                          value={editData[key] as string}
                          onChange={value => setEditData({ ...editData, [key]: value })}
                          showLabel={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer
            sx={{
              border: 'solid 1px',
              borderColor: 'lightgray',
              borderRadius: '8px',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderLeft: 'none',
              flex: 1,
              height: '100%'
            }}
          >
            <Table size='small'>
              <TableBody>
                {groups.group2.map(value => {
                  const key = value as keyof typeof editData

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
                        {LICENSE_INPUT_INFO[key]?.label}
                      </TableCell>
                      <TableCell>
                        <InputBox
                          isEditing={isEditing}
                          tabInfos={LICENSE_INPUT_INFO}
                          tabFieldKey={key}
                          value={editData[key] as string}
                          onChange={value => setEditData({ ...editData, [key]: value })}
                          showLabel={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <TableContainer sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px' }}>
          <Table size='small'>
            <TableBody>
              {groups.addressGroup.map(value => {
                const key = value as keyof typeof editData

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
                      {LICENSE_INPUT_INFO[key]?.label}
                    </TableCell>
                    <TableCell>
                      <InputBox
                        isEditing={isEditing}
                        tabInfos={LICENSE_INPUT_INFO}
                        tabFieldKey={key}
                        value={editData[key] as string}
                        onChange={value => setEditData({ ...editData, [key]: value })}
                        showLabel={false}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div className='flex flex-col gap-0'>
          <span className='font-extrabold'>{LICENSE_INPUT_INFO.remark?.label}</span>
          {isEditing ? (
            <InputBox
              tabInfos={LICENSE_INPUT_INFO}
              tabFieldKey={'remark'}
              value={editData.remark}
              onChange={value => setEditData({ ...editData, remark: value })}
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
              {editData.remark}
            </Box>
          )}
        </div>
        {showDeleteModal && (
          <DeleteModal
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            onDelete={handleDeleteUser}
          />
        )}
      </DialogContent>
    </DefaultModal>
  )
}

export default DetailModal
