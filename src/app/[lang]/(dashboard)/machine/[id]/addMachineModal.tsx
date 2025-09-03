'use client'

import { useState } from 'react'

import axios from 'axios'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem } from '@mui/material'

import DialogCloseButton from './DialogCloseButton'
import CustomTextField from '@/@core/components/mui/TextField'
import MultiSelectBox from '@/components/selectbox/MultiSelectBox'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  engineerOptions: any
  id: string
  onSuccess?: () => void // 성공 후 콜백 함수 추가
}

const AddMachineModal = ({ open, setOpen, engineerOptions, id, onSuccess }: EditUserInfoProps) => {
  const [formData, setFormData] = useState({
    category: '1', // MACHINE_CATE_SEQ
    type: '', // MACHINE_SUB_CATE_SEQ
    inspector1: '정성일 (특급)',
    inspector2: '선택',
    inspector3: '선택',
    inspector4: '선택',
    purpose: '',
    location: '',
    quantity: '1',
    engineerId1: '',
    engineerId2: '',
    engineerId3: '',
    engineerId4: ''
  })

  const handleClose = () => {
    setOpen(false)
  }

  const handleEngineerChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // 분류가 변경되면 종류도 초기화
      if (field === 'category') {
        newData.type = ''
      }

      console.log('newData', newData)

      return newData
    })
  }

  const handleSubmit = async () => {
    // 종류 선택 유효성 검사
    if (!formData.type) {
      alert('종류를 선택해주세요.')

      return
    }

    try {
      const requestData = {
        inspections: [
          {
            machineCateSeq: parseInt(formData.type),
            purpose: formData.purpose,
            location: formData.location,
            cnt: parseInt(formData.quantity)
          }
        ]
      }

      console.log('전송할 데이터:', requestData)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${id}/machine-inspections`,
        requestData
      )

      console.log('설비 추가 성공:', response.data)

      // 성공 후 콜백 실행 (데이터 새로고침)
      if (onSuccess) {
        onSuccess()
      }

      handleClose()
    } catch (error) {
      console.error('API 요청 오류:', error)
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {'설비 추가'}
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pli-16'>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              select
              fullWidth
              label='분류'
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
            >
              <MenuItem value='1'>냉동기</MenuItem>
              <MenuItem value='2'>냉각탑</MenuItem>
              <MenuItem value='3'>축열조</MenuItem>
              <MenuItem value='4'>보일러</MenuItem>
              <MenuItem value='5'>열교환기</MenuItem>
              <MenuItem value='6'>산업펌프</MenuItem>
              <MenuItem value='7'>신재생</MenuItem>
              <MenuItem value='8'>공기조화기</MenuItem>
              <MenuItem value='9'>멸균기</MenuItem>
              <MenuItem value='10'>급수급탕설비</MenuItem>
              <MenuItem value='11'>배수설비</MenuItem>
              <MenuItem value='12'>배관설비</MenuItem>
              <MenuItem value='13'>특수설비</MenuItem>
              <MenuItem value='14'>덕트설비</MenuItem>
              <MenuItem value='15'>자동제어설비</MenuItem>
              <MenuItem value='16'>방화방연내진설비</MenuItem>
              <MenuItem value='17'>기타설비</MenuItem>
            </CustomTextField>
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              select
              fullWidth
              label='종류'
              value={formData.type}
              onChange={e => handleInputChange('type', e.target.value)}
            >
              {/* 냉동기 종류 */}
              {formData.category === '1' && [
                <MenuItem key='2' value='2'>
                  흡수식냉온수기
                </MenuItem>,
                <MenuItem key='3' value='3'>
                  터보냉동기
                </MenuItem>,
                <MenuItem key='4' value='4'>
                  스크류냉동기
                </MenuItem>,
                <MenuItem key='5' value='5'>
                  흡수식냉동기
                </MenuItem>,
                <MenuItem key='6' value='6'>
                  흡수식냉동기(중저온수)
                </MenuItem>
              ]}

              {/* 냉각탑 종류 */}
              {formData.category === '2' && [
                <MenuItem key='7' value='7'>
                  개방형냉각탑
                </MenuItem>,
                <MenuItem key='8' value='8'>
                  밀폐형냉각탑
                </MenuItem>
              ]}

              {/* 축열조 종류 */}
              {formData.category === '3' && [
                <MenuItem key='9' value='9'>
                  물축열조
                </MenuItem>,
                <MenuItem key='10' value='10'>
                  빙축열조
                </MenuItem>
              ]}

              {/* 보일러 종류 */}
              {formData.category === '4' && [
                <MenuItem key='11' value='11'>
                  노통연관보일러
                </MenuItem>,
                <MenuItem key='12' value='12'>
                  관류보일러
                </MenuItem>,
                <MenuItem key='13' value='13'>
                  전열온수보일러
                </MenuItem>,
                <MenuItem key='14' value='14'>
                  캐스케이드보일러
                </MenuItem>
              ]}

              {/* 열교환기 종류 */}
              {formData.category === '5' && [
                <MenuItem key='15' value='15'>
                  Shell & Tube 열교환기(증기식)
                </MenuItem>,
                <MenuItem key='16' value='16'>
                  판형열교환기
                </MenuItem>
              ]}

              {/* 신재생 종류 */}
              {formData.category === '7' && [
                <MenuItem key='17' value='17'>
                  신재생(지열)
                </MenuItem>,
                <MenuItem key='18' value='18'>
                  신재생(태양열)
                </MenuItem>,
                <MenuItem key='19' value='19'>
                  신재생(바이오가스)
                </MenuItem>
              ]}

              {/* 기본 옵션 (분류 선택 안됨) */}
              {!formData.category && <MenuItem value=''>분류를 먼저 선택하세요</MenuItem>}
            </CustomTextField>
          </Grid>

          <Grid item xs={12}>
            <MultiSelectBox
              label='점검자 1'
              id={'engineerNames'}
              value={formData.engineerId1 || ''}
              onChange={(e: any) => handleEngineerChange('engineerId1', e.target.value)}
              options={engineerOptions.map((eng: any) => ({
                value: eng.engineerId,
                label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
              }))}
            />
          </Grid>

          <Grid item xs={12}>
            <MultiSelectBox
              label='점검자 2'
              id={'engineerNames'}
              value={formData.engineerId2 || ''}
              onChange={(e: any) => handleEngineerChange('engineerId2', e.target.value)}
              options={engineerOptions.map((eng: any) => ({
                value: eng.engineerId,
                label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
              }))}
            />
          </Grid>

          <Grid item xs={12}>
            <MultiSelectBox
              label='점검자 3'
              id={'engineerNames'}
              value={formData.engineerId3 || ''}
              onChange={(e: any) => handleEngineerChange('engineerId3', e.target.value)}
              options={engineerOptions.map((eng: any) => ({
                value: eng.engineerId,
                label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
              }))}
            />
          </Grid>

          <Grid item xs={12}>
            <MultiSelectBox
              label='점검자 4'
              id={'engineerNames'}
              value={formData.engineerId4 || ''}
              onChange={(e: any) => handleEngineerChange('engineerId4', e.target.value)}
              options={engineerOptions.map((eng: any) => ({
                value: eng.engineerId,
                label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
              }))}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='용도'
              value={formData.purpose}
              onChange={e => handleInputChange('purpose', e.target.value)}
              placeholder='용도를 입력하세요'
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='위치'
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder='위치를 입력하세요'
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              select
              fullWidth
              label='수량'
              value={formData.quantity}
              onChange={e => handleInputChange('quantity', e.target.value)}
            >
              <MenuItem value='1'>1</MenuItem>
              <MenuItem value='2'>2</MenuItem>
              <MenuItem value='3'>3</MenuItem>
              <MenuItem value='4'>4</MenuItem>
              <MenuItem value='5'>5</MenuItem>
              <MenuItem value='6'>6</MenuItem>
              <MenuItem value='7'>7</MenuItem>
              <MenuItem value='8'>8</MenuItem>
              <MenuItem value='9'>9</MenuItem>
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='11'>11</MenuItem>
              <MenuItem value='12'>12</MenuItem>
              <MenuItem value='13'>13</MenuItem>
              <MenuItem value='14'>14</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='16'>16</MenuItem>
              <MenuItem value='17'>17</MenuItem>
              <MenuItem value='18'>18</MenuItem>
              <MenuItem value='19'>19</MenuItem>
              <MenuItem value='20'>20</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='contained' onClick={handleSubmit} sx={{ mr: 1 }}>
          추가
        </Button>
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddMachineModal
