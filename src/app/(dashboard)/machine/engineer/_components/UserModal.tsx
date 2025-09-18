'use client'

// React Imports
import { createContext, useEffect, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'

import { Box, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import axios from 'axios'

import { initialData } from '@/data/initialData/userInfo'
import DefaultModal from '@/app/_components/modal/DefaultModal'
import type { EngineerResponseDtoType } from '@/app/_type/types'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { ENGINEER_INPUT_INFO } from '@/app/_schema/input/EngineerInputInfo'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import AlertModal from '@/app/_components/modal/AlertModal'

type UserModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data: EngineerResponseDtoType
  reloadData: () => void
}

export const MemberIdContext = createContext<number>(0)

const UserModal = ({ open, setOpen, data, reloadData }: UserModalProps) => {
  const [editData, setEditData] = useState<EngineerResponseDtoType>(JSON.parse(JSON.stringify(data)))

  const [isEditing, setIsEditing] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const existChange = JSON.stringify(editData) !== JSON.stringify(data)

  const engineerId = editData.id
  const version = editData.version

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers`, {
        // @ts-ignore
        data: { engineerDeleteRequestDtos: [{ engineerId: engineerId, version: version }] }
      })

      handleSuccess('설비인력이 정상적으로 삭제되었습니다.')
      setShowDeleteModal(false)
      setOpen(false)
      reloadData()
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleModifyUser = async () => {
    if (existChange) {
      try {
        const response = await axios.put<{ data: EngineerResponseDtoType }>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/${engineerId}`,
          editData
        )

        const returnData = response.data.data

        setEditData(returnData)

        console.log(`info saved: `, returnData)
        handleSuccess(`설비인력 정보가 수정되었습니다.`)
        setIsEditing(false)
        reloadData()
      } catch (error: any) {
        handleApiError(error)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleClose = () => {
    if (existChange) {
      setShowAlertModal(true)
    } else {
      setOpen(false)
    }
  }

  return (
    <DefaultModal
      size='sm'
      open={open}
      setOpen={setOpen}
      title={data.name}
      handleClose={handleClose}
      headerDescription={data.engineerLicenseNum}
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
              {Object.keys(editData).map(value => {
                if (['id', 'version', 'remark'].includes(value)) return null
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
                      {ENGINEER_INPUT_INFO[key]?.label}
                    </TableCell>
                    <TableCell>
                      <InputBox
                        isEditing={isEditing}
                        tabInfos={ENGINEER_INPUT_INFO}
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
        <div className='flex flex-col gap-1'>
          <span className='font-extrabold'>{ENGINEER_INPUT_INFO.remark?.label}</span>
          {isEditing ? (
            <InputBox
              tabInfos={ENGINEER_INPUT_INFO}
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
        {showAlertModal && (
          <AlertModal<EngineerResponseDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            setIsEditing={setIsEditing}
            originalData={data}
          />
        )}
      </DialogContent>
    </DefaultModal>
  )
}

export default UserModal
