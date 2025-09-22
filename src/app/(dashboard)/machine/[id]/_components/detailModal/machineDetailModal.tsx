'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { Button, Tab } from '@mui/material'
import axios from 'axios'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import type {
  GasMeasurementResponseDtoType,
  machineInspectionChecklistItemResultBasicResponseDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionResponseDtoType,
  PipeMeasurementResponseDtoType,
  WindMeasurementResponseDtoType
} from '@/app/_type/types'
import DefaultModal from '@/app/_components/modal/DefaultModal'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

// style
import styles from '@/app/_style/Table.module.css'
import DisabledTabWithTooltip from '@/app/_components/DisabledTabWithTooltip'
import AlertModal from '@/app/_components/modal/AlertModal'
import BasicTabContent from './tabs/BasicTabContent'
import { GasTabContent } from './tabs/GasTabContent'
import { WindTabContent } from './tabs/WindTabContent'
import PipeTabContent from './tabs/PipeTabContent'
import PicTabContent from './tabs/PicTabContent'

const TabInfo: Record<
  MachineInspectionDetailResponseDtoType['checklistExtensionType'],
  { value: string; label: string }[]
> = {
  NONE: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용/사진' }
  ],
  GAS_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용/사진' },
    { value: 'GAS', label: '가스점검내용' }
  ],
  WIND_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용/사진' },
    { value: 'WIND', label: '풍량점검내용' }
  ],
  WIND_MEASUREMENT_SA_RA: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용/사진' },
    { value: 'WIND', label: '풍량점검내용' }
  ],
  PIPE_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용/사진' },
    { value: 'PIPE', label: '배관점검내용' }
  ]
}

type MachineDetailModalProps = {
  machineProjectId: string
  open: boolean
  setOpen: (open: boolean) => void
  selectedMachineData: MachineInspectionDetailResponseDtoType
  setSelectedMachineData: Dispatch<SetStateAction<MachineInspectionDetailResponseDtoType | undefined>>
  reloadData: () => Promise<void>
}

const MachineDetailModal = ({
  machineProjectId,
  open,
  setOpen,
  selectedMachineData,
  setSelectedMachineData,
  reloadData
}: MachineDetailModalProps) => {
  // 수정 시 변경되는 데이터 (저장되기 전) - 깊은 복사
  const [editData, setEditData] = useState<MachineInspectionDetailResponseDtoType>(
    JSON.parse(JSON.stringify(selectedMachineData))
  )

  const [showAlertModal, setShowAlertModal] = useState(false)

  // 탭
  const [tabValue, setTabValue] = useState('BASIC')
  const thisTabInfo = TabInfo[selectedMachineData.checklistExtensionType]

  const [isEditing, setIsEditing] = useState(false)

  // 저장되었을 경우(selectedMachineData가 바뀐 경우) 최신화
  useEffect(() => setEditData(JSON.parse(JSON.stringify(selectedMachineData))), [selectedMachineData])

  // ? 미흡사항이 변경되었을 때도 version이 달라서 차이가 발생하므로 version 제외하고 비교.
  const existChange =
    JSON.stringify(stripVersion(selectedMachineData)) !==
    JSON.stringify(stripVersion({ ...editData, engineerIds: editData.engineerIds.filter(id => id > 0) }))

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  const handleSave = useCallback(async () => {
    if (existChange) {
      // 1. POST를 보내고
      try {
        switch (tabValue) {
          case 'BASIC':
            const basicResponse = await axios.put<{ data: MachineInspectionResponseDtoType }>(
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}`,
              editData.machineInspectionResponseDto
            )

            setEditData(prev => ({ ...prev, machineInspectionResponseDto: basicResponse.data.data }))
            setSelectedMachineData(prev => prev && { ...prev, machineInspectionResponseDto: basicResponse.data.data })

            // 참여기술진 변경사항이 있다면 POST.
            if (
              JSON.stringify(editData.engineerIds.filter(id => id > 0)) !==
              JSON.stringify(selectedMachineData.engineerIds)
            ) {
              const engineerResponse = await axios.put<{ data: { engineerIds: number[] } }>(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/machine-inspection-engineers`,
                { engineerIds: editData.engineerIds.filter(id => id > 0) }
              )

              setEditData(prev => ({ ...prev, engineerIds: engineerResponse.data.data.engineerIds }))
              setSelectedMachineData(prev => prev && { ...prev, engineerIds: engineerResponse.data.data.engineerIds })
            }

            break

          case 'PIC':
            // 점검결과(machineChecklistItemInspectionResult)에 변경이 감지되었을 때만 requestBody에 포함시키기.
            const changedCates: { id: number; version: number; inspectionResult: string }[] = []

            editData.machineChecklistItemsWithPicCountDtos.map((cate, idx) => {
              const originalCate = selectedMachineData.machineChecklistItemsWithPicCountDtos[idx]

              if (
                cate.machineInspectionChecklistItemResultBasicResponseDto !==
                originalCate.machineInspectionChecklistItemResultBasicResponseDto
              ) {
                changedCates.push(cate.machineInspectionChecklistItemResultBasicResponseDto)
              }
            })

            if (changedCates) {
              const picResponse = await axios.put<{
                data: {
                  machineInspectionChecklistItemResultUpdateResponseDtos: machineInspectionChecklistItemResultBasicResponseDtoType[]
                }
              }>(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/machine-inspection-checklist-item-results`,
                { machineInspectionChecklistItemResultUpdateRequestDtos: changedCates }
              )

              const responseResults = picResponse.data.data.machineInspectionChecklistItemResultUpdateResponseDtos

              if (
                responseResults.every(result =>
                  editData.machineChecklistItemsWithPicCountDtos.find(
                    v => v.machineInspectionChecklistItemResultBasicResponseDto.id === result.id
                  )
                )
              ) {
                setEditData(prev => ({
                  ...prev,
                  machineChecklistItemsWithPicCountDtos: prev.machineChecklistItemsWithPicCountDtos.map(picCate => ({
                    ...picCate,
                    machineInspectionChecklistItemResultBasicResponseDto: responseResults.find(
                      result => result.id === picCate.machineInspectionChecklistItemResultBasicResponseDto.id
                    )!
                  }))
                }))
                setSelectedMachineData(
                  prev =>
                    prev && {
                      ...prev,
                      machineChecklistItemsWithPicCountDtos: prev.machineChecklistItemsWithPicCountDtos.map(
                        picCate => ({
                          ...picCate,
                          machineInspectionChecklistItemResultBasicResponseDto: responseResults.find(
                            result => result.id === picCate.machineInspectionChecklistItemResultBasicResponseDto.id
                          )!
                        })
                      )
                    }
                )
              } else {
                throw new Error()
              }
            }

            break
          case 'GAS':
            const gasResponse = await axios.put<{
              data: GasMeasurementResponseDtoType
            }>(
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/gasMeasurement`,
              editData.gasMeasurementResponseDto
            )

            setEditData(prev => ({ ...prev, gasMeasurementResponseDto: gasResponse.data.data }))
            setSelectedMachineData(prev => prev && { ...prev, gasMeasurementResponseDto: gasResponse.data.data })

            break
          case 'WIND':
            const windResponse = await axios.put<{
              data: { windMeasurementUpdateResponseDtos: WindMeasurementResponseDtoType[] }
            }>(
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/windMeasurements`,
              { windMeasurementUpdateRequestDtos: editData.windMeasurementResponseDtos }
            )

            setEditData(prev => ({
              ...prev,
              windMeasurementResponseDtos: windResponse.data.data.windMeasurementUpdateResponseDtos
            }))
            setSelectedMachineData(
              prev =>
                prev && {
                  ...prev,
                  windMeasurementResponseDtos: windResponse.data.data.windMeasurementUpdateResponseDtos
                }
            )
            break
          case 'PIPE':
            const pipeResponse = await axios.put<{
              data: { pipeMeasurementUpdateResponseDtos: PipeMeasurementResponseDtoType[] }
            }>(
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/pipeMeasurements`,
              { pipeMeasurementUpdateRequestDtos: editData.pipeMeasurementResponseDtos }
            )

            console.log(pipeResponse.data.data.pipeMeasurementUpdateResponseDtos)

            setEditData(prev => ({
              ...prev,
              pipeMeasurementResponseDtos: pipeResponse.data.data.pipeMeasurementUpdateResponseDtos
            }))
            setSelectedMachineData(
              prev =>
                prev && {
                  ...prev,
                  pipeMeasurementResponseDtos: pipeResponse.data.data.pipeMeasurementUpdateResponseDtos
                }
            )

            break
          default:
            break
        }

        // 2. 리스트 데이터를 새로 받기.
        await reloadData()
        setIsEditing(prev => !prev)
        handleSuccess(`${thisTabInfo.find(tabInfo => tabInfo.value === tabValue)?.label ?? ''}이(가) 수정되었습니다.`)
      } catch (error) {
        handleApiError(error)
      }
    }
  }, [
    editData,
    existChange,
    machineProjectId,
    reloadData,
    selectedMachineData,
    setSelectedMachineData,
    tabValue,
    thisTabInfo
  ])

  return (
    selectedMachineData && (
      <DefaultModal
        modifyButton={
          <Button variant='contained' color='error'>
            삭제
          </Button>
        }
        value={tabValue}
        open={open}
        setOpen={setOpen}
        title={`${selectedMachineData.machineInspectionResponseDto.machineInspectionName || ''}   성능점검표`}
        primaryButton={
          <div style={{ display: 'flex', gap: 1 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                if (!isEditing || !existChange) {
                  setIsEditing(prev => !prev)
                } else {
                  handleSave()
                }
              }}
            >
              {!isEditing ? '수정' : '저장'}
            </Button>

            {isEditing ? (
              <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                  if (existChange) {
                    setShowAlertModal(true)
                  } else {
                    setIsEditing(false)
                    setEditData(prev => ({ ...prev, engineerIds: prev.engineerIds.filter(id => id > 0) }))
                  }
                }}
              >
                취소
              </Button>
            ) : (
              <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                  setOpen(false)
                }}
              >
                닫기
              </Button>
            )}
          </div>
        }
        onClose={() => {
          if (existChange) {
            setShowAlertModal(true)
          } else {
            setOpen(false)
            setEditData(prev => ({ ...prev, engineerIds: prev.engineerIds.filter(id => id > 0) }))
          }
        }}
      >
        <div className={`${styles.container} relative`}>
          <TabList
            onChange={(event, newValue) => {
              if (existChange) {
                setShowAlertModal(true)
              } else {
                setTabValue(newValue)
              }
            }}
          >
            {selectedMachineData.checklistExtensionType === 'NONE'
              ? null
              : thisTabInfo.map(tab =>
                  existChange && tabValue !== tab.value ? (
                    <DisabledTabWithTooltip key={tab.value} value={tab.value} label={tab.label} />
                  ) : (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                  )
                )}
          </TabList>
          <div className='flex gap-2 absolute right-0 top-0'>
            <Button variant='contained' color='info'>
              갤러리 (
              {editData.machineChecklistItemsWithPicCountDtos.reduce(
                (sum, cate) => (sum += cate.totalMachinePicCount),
                0
              )}
              )
            </Button>
            <Button variant='contained' color='success'>
              보고서
            </Button>
          </div>
          <TabPanel value={'BASIC'}>
            <BasicTabContent
              selectedMachineData={selectedMachineData}
              editData={editData}
              setEditData={setEditData}
              isEditing={isEditing}
            />
          </TabPanel>
          <TabPanel value={'PIC'}>
            <PicTabContent
              selectedMachineData={selectedMachineData}
              editData={editData}
              setEditData={setEditData}
              isEditing={isEditing}
              machineProjectId={machineProjectId}
              reloadData={reloadData}
            />
          </TabPanel>
          {editData.gasMeasurementResponseDto && (
            <TabPanel value={'GAS'}>
              <GasTabContent
                selectedMachineData={selectedMachineData}
                editData={editData}
                setEditData={setEditData}
                isEditing={isEditing}
              />
            </TabPanel>
          )}
          {editData.windMeasurementResponseDtos && (
            <TabPanel value={'WIND'}>
              <WindTabContent
                selectedMachineData={selectedMachineData}
                editData={editData}
                setEditData={setEditData}
                isEditing={isEditing}
              />
            </TabPanel>
          )}
          {editData.pipeMeasurementResponseDtos && (
            <TabPanel value={'PIPE'}>
              <PipeTabContent
                selectedMachineData={selectedMachineData}
                editData={editData}
                setEditData={setEditData}
                isEditing={isEditing}
              />
            </TabPanel>
          )}
        </div>

        {showAlertModal && (
          <AlertModal<MachineInspectionDetailResponseDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            setIsEditing={setIsEditing}
            originalData={selectedMachineData}
          />
        )}
      </DefaultModal>
    )
  )
}

export default MachineDetailModal

// util 함수: 배열 안 객체에서 version 제거
const stripVersion = (data: MachineInspectionDetailResponseDtoType) => {
  return {
    ...data,
    machineChecklistItemsWithPicCountDtos: data.machineChecklistItemsWithPicCountDtos.map(
      v => ({
        ...v,
        machineInspectionChecklistItemResultBasicResponseDto: {
          id: v.machineInspectionChecklistItemResultBasicResponseDto.id,
          inspectionResult: v.machineInspectionChecklistItemResultBasicResponseDto.inspectionResult
        }
      }) // version 제거
    )
  }
}
