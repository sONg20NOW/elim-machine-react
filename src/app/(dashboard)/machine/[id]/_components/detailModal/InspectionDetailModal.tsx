'use client'

// React Imports
import { useCallback, useContext, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, MenuItem, Select, Tab, Typography } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import type { MachineInspectionDetailResponseDtoType, MachineInspectionSimpleResponseDtoType } from '@core/types'

import DefaultModal from '@/@core/components/elim-modal/DefaultModal'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'

// style
import styles from '@/app/_style/Table.module.css'
import DisabledTabWithTooltip from '@/app/(dashboard)/machine/[id]/_components/DisabledTabWithTooltip'
import BasicTabContent from './tabs/BasicTabContent'
import { GasTabContent } from './tabs/GasTabContent'
import { WindTabContent } from './tabs/WindTabContent'
import PipeTabContent from './tabs/PipeTabContent'
import PicTabContent from './tabs/PicTabContent'
import PictureListModal from '../pictureUploadModal/PictureListModal'
import {
  useGetInspectionsSimple,
  useGetSingleInspection,
  useMutateEngineerIds,
  useMutateGasMeasurementResponseDto,
  useMutateMachineInspectionChecklistItemResultUpdateRequestDto,
  useMutateMachineInspectionResponseDto,
  useMutatePipeMeasurementResponseDto,
  useMutateWindMeasurementResponseDto
} from '@core/hooks/customTanstackQueries'
import useCurrentInspectionIdStore from '@core/utils/useCurrentInspectionIdStore'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'
import deleteInspection from '../../_utils/deleteInspection'
import { setOffsetContext } from '../tabs/InspectionListTabContent'
import AlertModal from '@/@core/components/elim-modal/AlertModal'

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
  const inspectionId = useCurrentInspectionIdStore(set => set.currentInspectionId)

  const { data: selectedInspection } = useGetSingleInspection(machineProjectId, inspectionId.toString())
  const { data: inspectionsSimple } = useGetInspectionsSimple(machineProjectId)

  return (
    selectedInspection &&
    inspectionsSimple && (
      <InspectionDetailModalInner
        open={open}
        setOpen={setOpen}
        selectedInspection={selectedInspection}
        inspectionsSimple={inspectionsSimple}
      />
    )
  )
}

type InspectionDetailModalInnerProps = {
  open: boolean
  setOpen: (open: boolean) => void
  selectedInspection: MachineInspectionDetailResponseDtoType
  inspectionsSimple: MachineInspectionSimpleResponseDtoType[]
}

const InspectionDetailModalInner = ({
  open,
  setOpen,
  selectedInspection,
  inspectionsSimple
}: InspectionDetailModalInnerProps) => {
  const machineProjectId = useParams().id?.toString() as string

  const setOffset = useContext(setOffsetContext)

  const { currentInspectionId, setCurrentInspectionId } = useCurrentInspectionIdStore()

  const { mutate: mutateMachineInspectionResponseDto } = useMutateMachineInspectionResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutate: mutateEngineerIds } = useMutateEngineerIds(machineProjectId, currentInspectionId.toString())

  const { mutate: mutateMachineInspectionChecklistItemResultUpdateRequestDto } =
    useMutateMachineInspectionChecklistItemResultUpdateRequestDto(machineProjectId, currentInspectionId.toString())

  const { mutate: mutateGasMeasurementResponseDto } = useMutateGasMeasurementResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutate: mutateWindMeasurementResponseDto } = useMutateWindMeasurementResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutate: mutatePipeMeasurementResponseDto } = useMutatePipeMeasurementResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  if (!selectedInspection) {
    throw new Error('selecteMachine is undefined')
  }

  // 수정 시 변경되는 데이터 (저장되기 전) - 깊은 복사
  const [editData, setEditData] = useState<MachineInspectionDetailResponseDtoType>(structuredClone(selectedInspection))

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPictureListModal, setShowPictureListModal] = useState(false)

  // 탭
  const [tabValue, setTabValue] = useState('BASIC')
  const thisTabInfo = TabInfo[selectedInspection.checklistExtensionType]

  const [isEditing, setIsEditing] = useState(false)

  // 저장되었을 경우(selectedMachineData가 바뀐 경우) 최신화
  useEffect(() => setEditData(structuredClone(selectedInspection)), [selectedInspection])

  // ? 미흡사항이 변경되었을 때도 version이 달라서 차이가 발생하므로 version 제외하고 비교.
  const existChange =
    JSON.stringify(selectedInspection) !==
    JSON.stringify({ ...editData, engineerIds: editData.engineerIds.filter(id => id > 0) })

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  // 1. PUT 보내고 -> 2. selectedMachine, editData 최신화
  const handleSave = useCallback(async () => {
    if (existChange) {
      try {
        switch (tabValue) {
          case 'BASIC':
            mutateMachineInspectionResponseDto(editData.machineInspectionResponseDto)

            // 참여기술진 변경사항이 있다면 POST.
            if (
              JSON.stringify(editData.engineerIds.filter(id => id > 0)) !==
              JSON.stringify(selectedInspection.engineerIds)
            ) {
              mutateEngineerIds(editData.engineerIds.filter(id => id > 0))
            }

            break

          case 'PIC':
            const changedBasics = editData.machineChecklistItemsWithPicCountResponseDtos
              .filter(v => {
                const originalBasic = selectedInspection.machineChecklistItemsWithPicCountResponseDtos.find(
                  p =>
                    p.machineInspectionChecklistItemResultBasicResponseDto.id ===
                    v.machineInspectionChecklistItemResultBasicResponseDto.id
                )?.machineInspectionChecklistItemResultBasicResponseDto

                return (
                  JSON.stringify(originalBasic) !==
                  JSON.stringify(v.machineInspectionChecklistItemResultBasicResponseDto)
                )
              })
              .map(v => v.machineInspectionChecklistItemResultBasicResponseDto)

            mutateMachineInspectionChecklistItemResultUpdateRequestDto(changedBasics)

            break
          case 'GAS':
            mutateGasMeasurementResponseDto(editData.gasMeasurementResponseDto)

            break
          case 'WIND':
            mutateWindMeasurementResponseDto(editData.windMeasurementResponseDtos)

            break
          case 'PIPE':
            mutatePipeMeasurementResponseDto(editData.pipeMeasurementResponseDtos)

            break
          default:
            break
        }

        setIsEditing(prev => !prev)
        handleSuccess(`${thisTabInfo.find(tabInfo => tabInfo.value === tabValue)?.label ?? ''}이(가) 수정되었습니다.`)
        setOffset && setOffset(0)
      } catch (error) {
        handleApiError(error)
      }
    }
  }, [
    editData,
    existChange,
    mutateMachineInspectionResponseDto,
    mutateEngineerIds,
    mutateMachineInspectionChecklistItemResultUpdateRequestDto,
    mutateGasMeasurementResponseDto,
    mutateWindMeasurementResponseDto,
    mutatePipeMeasurementResponseDto,
    selectedInspection,
    tabValue,
    thisTabInfo,
    setOffset
  ])

  const handleDelete = async () => {
    const inspectionInfo = selectedInspection.machineInspectionResponseDto

    const result = await deleteInspection(
      Number(machineProjectId),
      inspectionInfo.id,
      inspectionInfo.version,
      inspectionInfo.machineInspectionName
    )

    if (result) {
      setOffset && setOffset(1)
      setOpen(false)
    }
  }

  const handleDontSave = () => {
    setEditData(structuredClone(selectedInspection))
    setIsEditing(false)
    setShowAlertModal(false)
  }

  return (
    selectedInspection && (
      <DefaultModal
        modifyButton={
          <Button variant='contained' color='error' onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        }
        value={tabValue}
        open={open}
        setOpen={setOpen}
        title={
          <div className='flex items-center'>
            <Select
              IconComponent={() => null}
              variant='standard'
              value={currentInspectionId}
              onChange={e => {
                setCurrentInspectionId(Number(e.target.value))
              }}
              renderValue={value => (
                <Typography variant='h3'>{inspectionsSimple.find(v => v.id === value)!.name}</Typography>
              )}
            >
              {inspectionsSimple.map(v => (
                <MenuItem key={v.id} value={v.id}>
                  <Typography>{v.name}</Typography>
                </MenuItem>
              ))}
            </Select>
            <Typography variant='inherit'>{'성능점검표'}</Typography>
          </div>
        }
        primaryButton={
          <div style={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <Button
                variant='contained'
                color='success'
                disabled={!existChange}
                onClick={() => {
                  handleSave()
                }}
              >
                저장
              </Button>
            ) : (
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  setIsEditing(prev => !prev)
                }}
              >
                수정
              </Button>
            )}

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
            <BasicTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
          </TabPanel>
          <TabPanel value={'PIC'}>
            <PicTabContent
              editData={editData}
              setEditData={setEditData}
              isEditing={isEditing}
              handleChangeChecklistItemResult={mutateMachineInspectionChecklistItemResultUpdateRequestDto}
            />
          </TabPanel>
          {editData.gasMeasurementResponseDto && (
            <TabPanel value={'GAS'}>
              <GasTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
            </TabPanel>
          )}
          {editData.windMeasurementResponseDtos && (
            <TabPanel value={'WIND'}>
              <WindTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
            </TabPanel>
          )}
          {editData.pipeMeasurementResponseDtos && (
            <TabPanel value={'PIPE'}>
              <PipeTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
            </TabPanel>
          )}
        </div>

        <AlertModal open={showAlertModal} setOpen={setShowAlertModal} handleConfirm={handleDontSave} />
        <DeleteModal open={showDeleteModal} setOpen={setShowDeleteModal} onDelete={handleDelete} />
        {/* 갤러리 버튼 클릭 시 동작 */}
        {showPictureListModal && (
          <PictureListModal
            open={showPictureListModal}
            setOpen={setShowPictureListModal}
            defaultPicInspectionId={currentInspectionId}
          />
        )}
      </DefaultModal>
    )
  )
}

export default InspectionDetailModal
