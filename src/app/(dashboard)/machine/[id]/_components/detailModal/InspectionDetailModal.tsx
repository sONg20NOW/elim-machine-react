'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, Tab } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import type {
  GasMeasurementResponseDtoType,
  MachineInspectionChecklistItemResultUpdateRequestDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionResponseDtoType,
  PipeMeasurementResponseDtoType,
  WindMeasurementResponseDtoType
} from '@/@core/types'

import DefaultModal from '@/@core/components/custom/DefaultModal'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

// style
import styles from '@/app/_style/Table.module.css'
import DisabledTabWithTooltip from '@/@core/components/custom/DisabledTabWithTooltip'
import AlertModal from '@/@core/components/custom/AlertModal'
import BasicTabContent from './tabs/BasicTabContent'
import { GasTabContent } from './tabs/GasTabContent'
import { WindTabContent } from './tabs/WindTabContent'
import PipeTabContent from './tabs/PipeTabContent'
import PicTabContent from './tabs/PicTabContent'
import PictureListModal from '../pictureUpdateModal/PictureListModal'
import { useGetSingleInspection } from '@/@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@/@core/utils/useCurrentInspectionIdStore'
import { auth } from '@/lib/auth'

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

type InspectionDetailModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const InspectionDetailModal = ({ open, setOpen }: InspectionDetailModalProps) => {
  const machineProjectId = useParams().id?.toString() as string
  const currentInspectionId = useCurrentInspectionIdStore(set => set.currentInspectionId)

  const { data: selectedInspection, refetch: refetchSelectedInspection } = useGetSingleInspection(
    machineProjectId,
    currentInspectionId.toString()
  )

  if (!selectedInspection) {
    throw new Error('selecteMachine is undefined')
  }

  // 수정 시 변경되는 데이터 (저장되기 전) - 깊은 복사
  const [editData, setEditData] = useState<MachineInspectionDetailResponseDtoType>(
    JSON.parse(JSON.stringify(selectedInspection))
  )

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showPictureListModal, setShowPictureListModal] = useState(false)

  // 탭
  const [tabValue, setTabValue] = useState('BASIC')
  const thisTabInfo = TabInfo[selectedInspection.checklistExtensionType]

  const [isEditing, setIsEditing] = useState(false)

  // 저장되었을 경우(selectedMachineData가 바뀐 경우) 최신화
  useEffect(() => setEditData(JSON.parse(JSON.stringify(selectedInspection))), [selectedInspection])

  // ? 미흡사항이 변경되었을 때도 version이 달라서 차이가 발생하므로 version 제외하고 비교.
  const existChange =
    JSON.stringify(stripVersion(selectedInspection)) !==
    JSON.stringify(stripVersion({ ...editData, engineerIds: editData.engineerIds.filter(id => id > 0) }))

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  // 1. PUT 보내고 -> 2. selectedMachine, editData 최신화
  const handleSave = useCallback(async () => {
    if (existChange) {
      try {
        switch (tabValue) {
          case 'BASIC':
            await auth.put<{ data: MachineInspectionResponseDtoType }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}`,
              editData.machineInspectionResponseDto
            )

            // 참여기술진 변경사항이 있다면 POST.
            if (
              JSON.stringify(editData.engineerIds.filter(id => id > 0)) !==
              JSON.stringify(selectedInspection.engineerIds)
            ) {
              await auth.put<{ data: { engineerIds: number[] } }>(
                `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/machine-inspection-engineers`,
                { engineerIds: editData.engineerIds.filter(id => id > 0) }
              )
            }

            refetchSelectedInspection()

            break

          case 'PIC':
            await auth.put<{
              data: {
                machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultUpdateRequestDtoType[]
              }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/machine-inspection-checklist-item-results`,
              {
                machineInspectionChecklistItemResultUpdateRequestDtos:
                  editData.machineChecklistItemsWithPicCountResponseDtos.map(
                    v => v.machineInspectionChecklistItemResultBasicResponseDto
                  )
              }
            )
            refetchSelectedInspection()

            break
          case 'GAS':
            await auth.put<{
              data: GasMeasurementResponseDtoType
            }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/gasMeasurement`,
              editData.gasMeasurementResponseDto
            )

            refetchSelectedInspection()
            break
          case 'WIND':
            await auth.put<{
              data: { windMeasurementUpdateResponseDtos: WindMeasurementResponseDtoType[] }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/windMeasurements`,
              { windMeasurementUpdateRequestDtos: editData.windMeasurementResponseDtos }
            )
            refetchSelectedInspection()
            break
          case 'PIPE':
            await auth.put<{
              data: { pipeMeasurementUpdateResponseDtos: PipeMeasurementResponseDtoType[] }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${selectedInspection.machineInspectionResponseDto.id}/pipeMeasurements`,
              { pipeMeasurementUpdateRequestDtos: editData.pipeMeasurementResponseDtos }
            )
            refetchSelectedInspection()
            break
          default:
            break
        }

        setIsEditing(prev => !prev)
        handleSuccess(`${thisTabInfo.find(tabInfo => tabInfo.value === tabValue)?.label ?? ''}이(가) 수정되었습니다.`)
      } catch (error) {
        handleApiError(error)
      }
    }
  }, [editData, existChange, machineProjectId, selectedInspection, refetchSelectedInspection, tabValue, thisTabInfo])

  return (
    selectedInspection && (
      <DefaultModal
        modifyButton={
          <Button variant='contained' color='error'>
            삭제
          </Button>
        }
        value={tabValue}
        open={open}
        setOpen={setOpen}
        title={`${selectedInspection.machineInspectionResponseDto.machineInspectionName || ''}   성능점검표`}
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
            {thisTabInfo.map(tab =>
              existChange && tabValue !== tab.value ? (
                <DisabledTabWithTooltip key={tab.value} value={tab.value} label={tab.label} />
              ) : (
                <Tab key={tab.value} value={tab.value} label={tab.label} />
              )
            )}
          </TabList>
          <div className='flex gap-2 absolute right-0 top-0'>
            <Button variant='contained' color='info' onClick={() => setShowPictureListModal(true)}>
              갤러리 (
              {editData.machineChecklistItemsWithPicCountResponseDtos?.reduce(
                (sum, cate) => (sum += cate.totalMachinePicCount),
                0
              )}
              )
            </Button>
            {/* <Button variant='contained' color='success'>
              보고서
            </Button> */}
          </div>
          <TabPanel value={'BASIC'}>
            <BasicTabContent
              selectedMachineData={selectedInspection}
              editData={editData}
              setEditData={setEditData}
              isEditing={isEditing}
            />
          </TabPanel>
          <TabPanel value={'PIC'}>
            <PicTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
          </TabPanel>
          {editData.gasMeasurementResponseDto && (
            <TabPanel value={'GAS'}>
              <GasTabContent
                selectedMachineData={selectedInspection}
                editData={editData}
                setEditData={setEditData}
                isEditing={isEditing}
              />
            </TabPanel>
          )}
          {editData.windMeasurementResponseDtos && (
            <TabPanel value={'WIND'}>
              <WindTabContent
                selectedMachineData={selectedInspection}
                editData={editData}
                setEditData={setEditData}
                isEditing={isEditing}
              />
            </TabPanel>
          )}
          {editData.pipeMeasurementResponseDtos && (
            <TabPanel value={'PIPE'}>
              <PipeTabContent
                selectedMachineData={selectedInspection}
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
            originalData={selectedInspection}
          />
        )}
        {/* 갤러리 버튼 클릭 시 동작 */}
        {showPictureListModal && <PictureListModal open={showPictureListModal} setOpen={setShowPictureListModal} />}
      </DefaultModal>
    )
  )
}

export default InspectionDetailModal

// util 함수: 배열 안 객체에서 version 제거
const stripVersion = (data: MachineInspectionDetailResponseDtoType) => {
  return {
    ...data,
    machineChecklistItemsWithPicCountDtos: data.machineChecklistItemsWithPicCountResponseDtos?.map(
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
