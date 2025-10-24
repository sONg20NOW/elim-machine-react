'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

import { DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'

import axios from 'axios'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import { InputBox } from '@/@core/components/custom/InputBox'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { LicenseInitialData } from '@/app/_constants/LicenseSeed'
import type { LicenseCreateRequestDto } from '@/@core/types'
import { LICENSE_INPUT_INFO } from '@/app/_constants/input/LicenseInputInfo'

type AddModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  reloadPage: () => void
}

const groups = {
  dontShow: ['id', 'version', 'jibunAddress'],
  single: ['remark'],
  group1: ['companyName', 'companyNameAbbr', 'bizno', 'ceoName', 'managerName', 'managerEmail', 'taxEmail'],
  group2: ['contractDate', 'expireDate', 'homepageAddr', 'tel', 'fax'],

  addressGroup: ['roadAddress', 'detailAddress', 'businessType', 'businessCategory']
}

const AddModal = ({ open, setOpen, reloadPage }: AddModalProps) => {
  const [data, setData] = useState<LicenseCreateRequestDto>(LicenseInitialData)

  // 추가 핸들러
  const onSubmitHandler = async () => {
    try {
      const response = await axios.post<{ data: { licenseId: number } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/licenses`,
        data
      )

      console.log(`LicenseId:${response.data.data.licenseId} new license added`)
      handleSuccess('새 라이선스가 추가되었습니다.')

      reloadPage()
      setOpen(false)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  return (
    <DefaultModal
      size='md'
      open={open}
      setOpen={setOpen}
      title={'신규 라이선스 추가'}
      primaryButton={
        <Button variant='contained' onClick={() => onSubmitHandler()} type='submit'>
          추가
        </Button>
      }
      secondaryButton={
        <Button variant='contained' color='secondary' type='reset' onClick={() => setOpen(false)}>
          취소
        </Button>
      }
    >
      <DialogContent className='flex flex-col overflow-visible pbs-0 sm:pli-16 gap-4'>
        <div className='flex gap-4'>
          <TableContainer sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px', flex: 1 }}>
            <Table size='small'>
              <TableBody>
                {groups.group1.map(value => {
                  const key = value as keyof typeof data

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
                        <span>
                          {LICENSE_INPUT_INFO[key]?.label}
                          {key === 'companyName' && <sup style={{ color: 'red' }}>*</sup>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <InputBox
                          tabInfos={LICENSE_INPUT_INFO}
                          tabFieldKey={key}
                          value={data[key] as string}
                          onChange={value => setData({ ...data, [key]: value })}
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
            sx={{ border: 'solid 1px', borderColor: 'lightgray', borderRadius: '8px', flex: 1, height: '100%' }}
          >
            <Table size='small'>
              <TableBody>
                {groups.group2.map(value => {
                  const key = value as keyof typeof data

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
                          tabInfos={LICENSE_INPUT_INFO}
                          tabFieldKey={key}
                          value={data[key] as string}
                          onChange={value => setData({ ...data, [key]: value })}
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
                const key = value as keyof typeof data

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
                        tabInfos={LICENSE_INPUT_INFO}
                        tabFieldKey={key}
                        value={data[key] as string}
                        onChange={value => setData({ ...data, [key]: value })}
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
          <InputBox
            tabInfos={LICENSE_INPUT_INFO}
            tabFieldKey={'remark'}
            value={data.remark}
            onChange={value => setData({ ...data, remark: value })}
            showLabel={false}
          />
        </div>
      </DialogContent>
    </DefaultModal>
  )
}

export default AddModal
