'use client'

// React Imports
import { useContext, useEffect, useState } from 'react'

import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import axios from 'axios'

import MultiSelectBox from '@/app/_components/selectbox/MultiSelectBox'
import CustomTextField from '@/@core/components/mui/TextField'
import InspectionDetailModal from './insepctionDetailModal'
import { EngineerOptionContext } from '../page'
import type { MachineInspectionDetailResponseDtoType } from '@/app/_type/types'

type EditUserInfoProps = {
  machineProjectId: string
  open: boolean
  setOpen: (open: boolean) => void
  selectedMachine: MachineInspectionDetailResponseDtoType
}

const MachineDetailModal = ({ machineProjectId, open, setOpen, selectedMachine }: EditUserInfoProps) => {
  const engineerOption = useContext(EngineerOptionContext)

  // 성능점검표 모달
  const [inspectionData, setInspectionData] = useState<MachineInspectionDetailResponseDtoType>()
  const [selectedInspection, setSelectedInspection] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<any>(null)

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    if (!selectedMachine) return

    const fetchData = async () => {
      const response = await axios.get<{ data: MachineInspectionDetailResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachine.machineInspectionResponseDto.machineCateId}`
      )

      setInspectionData(response.data.data)
    }

    fetchData()
  }, [open, selectedMachine, machineProjectId])

  // 사진 업로드 후 데이터 새로고침 함수
  const handlePhotoUploadSuccess = async () => {
    if (!selectedMachine || !selectedMachine.machineInspectionResponseDto.machineInspectionId) return

    try {
      const response = await axios.get<{ data: MachineInspectionDetailResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachine.machineInspectionResponseDto.machineInspectionId}`
      )

      setInspectionData(response.data.data)
      console.log('Data refreshed after photo upload - 점검결과 즉시 업데이트됨')
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const machineInfo = inspectionData?.machineInspectionResponseDto
  const picCates = inspectionData?.picCates || []

  if (!inspectionData || !inspectionData.machineInspectionResponseDto) return null

  return (
    machineInfo && (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
        style={{ zIndex: 1300 }}
        hideBackdrop={selectedInspection}
      >
        <DialogTitle>
          <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 20 }}>
            {machineInfo.machineInspectionName || ''} 성능점검표
          </span>
        </DialogTitle>
        <DialogContent>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 15 }}>
            <tbody>
              <tr>
                <th style={{ width: 100, background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>설비명</th>
                <td style={{ padding: '8px' }}>{machineInfo.machineInspectionName}</td>
                <th style={{ width: 100, background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>설치일</th>
                <td style={{ padding: '8px' }}>
                  <div className='flex gap-1 align-center items-center'>
                    {/* <div style={{ width: '25%' }}>
                    <MultiSelectBox
                      machineProjectId={'projectStatusDescription'}
                      value={'설치'}
                      loading={false}
                      onChange={(e: any) => console.log('hey')}
                      options={[
                        { value: '설치', label: '설치' },
                        { value: '제조', label: '제조' },
                        { value: '사용', label: '사용' },
                        { value: '삭제', label: '삭제' }
                      ]}
                    />
                  </div> */}
                    <div style={{ width: '75%' }}>{machineInfo.installedDate}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <th style={{ background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>종류</th>
                <td style={{ padding: '8px' }}>{machineInfo.machineCateName}</td>
                <th style={{ background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>점검일</th>
                <td style={{ padding: '8px' }}>{machineInfo.checkDate}</td>
              </tr>
              <tr>
                <th style={{ background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>용도</th>
                <td style={{ padding: '8px' }}>{machineInfo.purpose}</td>
                <th style={{ background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>위치</th>
                <td style={{ padding: '8px' }}>{machineInfo.location}</td>
              </tr>
              <tr>
                <th style={{ background: '#f3f4f6', padding: '8px', textAlign: 'left' }}>점검자</th>
                <td style={{ padding: '8px' }} colSpan={3}>
                  <div className='grid grid-cols-4 gap-1'>
                    {(selectedMachine.engineerInfos || []).map((eng: any, idx: number) => (
                      <MultiSelectBox
                        key={idx}
                        machineProjectId={'engineerNames'}
                        value={eng.machineEngineerId || ''}
                        // eslint-disable-next-line lines-around-comment
                        // onChange={(e: any) => handleEngineerChange(idx, 'engineerId', e.target.value)}
                        options={engineerOption.map((eng: any) => ({
                          value: eng.engineerId,
                          label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
                        }))}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ width: 180, padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}></th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'left' }}>점검내용</th>
                <th style={{ width: 80, padding: '8px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                  점검결과
                </th>
              </tr>
            </thead>
            <tbody>
              {picCates.map((cate: any, idx: number) => {
                return (
                  <tr key={cate.machinePicCateSeq}>
                    {idx === 0 && (
                      <td
                        rowSpan={picCates.length}
                        style={{ padding: '8px', border: '1px solid #d1d5db', verticalAlign: 'top' }}
                      >
                        점검항목
                      </td>
                    )}
                    <td
                      style={{ padding: '8px', border: '1px solid #d1d5db', verticalAlign: 'top', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedInspection(true)
                        setClickedPicCate(cate)
                      }}
                    >
                      {idx + 1}. {cate.machinePicCateName}
                      {cate.totalMachinePicCount ? ` (${cate.totalMachinePicCount})` : '(0)'}
                    </td>
                    <td
                      style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'center', verticalAlign: 'top' }}
                    >
                      {cate.totalMachinePicCount > 0 ? 'O' : '/'}
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #d1d5db', verticalAlign: 'top' }} rowSpan={17}>
                  비고
                </td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db', verticalAlign: 'top' }} colSpan={2}>
                  <CustomTextField
                    fullWidth
                    rows={4}
                    multiline
                    label=''
                    placeholder='참고 사항을 입력해 주세요'
                    value={''}
                    onChange={e => console.log(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginBottom: 16, color: '#888', fontSize: 14 }}>점검대상 하단에 표시됩니다.</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Button variant='contained' color='primary'>
              저장
            </Button>
            <Button variant='contained' color='info'>
              갤러리 (82)
            </Button>
            <Button variant='contained' color='success'>
              보고서
            </Button>
            <Button variant='contained' color='error'>
              삭제
            </Button>
            <Button variant='contained' onClick={handleClose}>
              닫기
            </Button>
          </div>
        </DialogContent>
        <InspectionDetailModal
          machineProjectId={machineProjectId}
          open={selectedInspection}
          setOpen={setSelectedInspection}
          selectedMachine={selectedMachine}
          clickedPicCate={clickedPicCate}
          onPhotoUploadSuccess={handlePhotoUploadSuccess}
        />
      </Dialog>
    )
  )
}

export default MachineDetailModal
