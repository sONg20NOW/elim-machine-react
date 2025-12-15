'use client'

// React Imports
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Tab,
  Typography
} from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import { IconX } from '@tabler/icons-react'

import TabContext from '@mui/lab/TabContext'

import type {
  MachineInspectionChecklistItemResultBasicResponseDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionSimpleResponseDtoType
} from '@core/types'

import { handleApiError, handleSuccess } from '@core/utils/errorHandler'

// style
import styles from '@core/styles/customTable.module.css'
import DisabledTabWithTooltip from '@/app/(dashboard)/machine/[id]/_components/DisabledTabWithTooltip'
import BasicTabContent from './tabs/BasicTabContent'
import { GasTabContent } from './tabs/GasTabContent'
import { WindTabContent } from './tabs/WindTabContent'
import PipeTabContent from './tabs/PipeTabContent'
import ChecklistPicTabContent from './tabs/ChecklistPicTabContent'
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
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'
import deleteInspection from '../../_utils/deleteInspection'
import { setOffsetContext, useSetInspectionIdContext } from '../tabs/InspectionListTabContent'
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

interface InspectionDetailModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedInspectionId: number
}

const InspectionDetailModal = ({ open, setOpen, selectedInspectionId }: InspectionDetailModalProps) => {
  const machineProjectId = useParams().id?.toString() as string

  const { data: selectedInspection } = useGetSingleInspection(machineProjectId, selectedInspectionId.toString())
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

/* -------------------- inner -------------------- */
const handleSaveChecklistContext = createContext<
  ((data: MachineInspectionChecklistItemResultBasicResponseDtoType[]) => void) | null
>(null)

export function useHandleSaveChecklistContext() {
  const handleSaveChecklist = useContext(handleSaveChecklistContext)

  if (!handleSaveChecklist) {
    throw new Error('no handleSaveChecklistContext')
  }

  return handleSaveChecklist
}

interface InspectionDetailModalInnerProps {
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
  const setInspectionId = useSetInspectionIdContext()

  const currentInspectionId = selectedInspection.machineInspectionResponseDto.id

  const { mutateAsync: mutateInspectionAsync } = useMutateMachineInspectionResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutateAsync: mutateEngineerIdsAsync } = useMutateEngineerIds(machineProjectId, currentInspectionId.toString())

  const { mutateAsync: mutateChecklistAsync } = useMutateMachineInspectionChecklistItemResultUpdateRequestDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutateAsync: mutateGasAsync } = useMutateGasMeasurementResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutateAsync: mutateWindAsync } = useMutateWindMeasurementResponseDto(
    machineProjectId,
    currentInspectionId.toString()
  )

  const { mutateAsync: mutatePipeAsync } = useMutatePipeMeasurementResponseDto(
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

  // 사진 업로드 시 editData 사진 개수, 점검결과 최신화
  useEffect(() => {
    setEditData(prev => {
      const newDtos = prev.machineChecklistItemsWithPicCountResponseDtos.map(v => {
        const matchedDto = selectedInspection.machineChecklistItemsWithPicCountResponseDtos.find(
          p => p.machineProjectChecklistItemId === v.machineProjectChecklistItemId
        )!

        return {
          ...v,
          totalMachinePicCount: matchedDto.totalMachinePicCount,
          checklistSubItems: matchedDto.checklistSubItems,
          machineInspectionChecklistItemResultBasicResponseDto:
            matchedDto.machineInspectionChecklistItemResultBasicResponseDto
        }
      })

      return { ...prev, machineChecklistItemsWithPicCountResponseDtos: newDtos }
    })
  }, [selectedInspection.machineChecklistItemsWithPicCountResponseDtos])

  // ? 미흡사항이 변경되었을 때도 version이 달라서 차이가 발생하므로 version 제외하고 비교.
  const existChange =
    JSON.stringify(selectedInspection) !==
    JSON.stringify({ ...editData, engineerIds: editData.engineerIds.filter(id => id > 0) })

  const updateEditDataUsingChecklistResponse = useCallback(
    (response: MachineInspectionChecklistItemResultBasicResponseDtoType[]) =>
      setEditData(prev => {
        const newMachineChecklistItemsWithPicCountResponseDtos = prev.machineChecklistItemsWithPicCountResponseDtos.map(
          v => ({
            ...v,
            machineInspectionChecklistItemResultBasicResponseDto:
              response.find(p => p.id === v.machineInspectionChecklistItemResultBasicResponseDto.id) ??
              v.machineInspectionChecklistItemResultBasicResponseDto
          })
        )

        return {
          ...prev,
          machineChecklistItemsWithPicCountResponseDtos: newMachineChecklistItemsWithPicCountResponseDtos
        }
      }),
    []
  )

  const handleSaveChecklist = useCallback(
    async (data: MachineInspectionChecklistItemResultBasicResponseDtoType[]) => {
      const response = await mutateChecklistAsync(data)

      updateEditDataUsingChecklistResponse(response)
    },
    [mutateChecklistAsync, updateEditDataUsingChecklistResponse]
  )

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  // 1. PUT 보내고 -> 2. selectedMachine, editData 최신화
  const handleSave = async () => {
    if (existChange) {
      try {
        switch (tabValue) {
          case 'BASIC':
            const basicResponse = await mutateInspectionAsync(editData.machineInspectionResponseDto)

            setEditData(prev => ({ ...prev, machineInspectionResponseDto: basicResponse }))

            // 참여기술진 변경사항이 있다면 POST.
            if (
              JSON.stringify(editData.engineerIds.filter(id => id > 0)) !==
              JSON.stringify(selectedInspection.engineerIds)
            ) {
              const engineerResponse = await mutateEngineerIdsAsync(editData.engineerIds.filter(id => id > 0))

              setEditData(prev => ({ ...prev, engineerIds: engineerResponse }))
            }

            break

          case 'PIC':
            const changedChecklists = editData.machineChecklistItemsWithPicCountResponseDtos
              .filter(v => {
                const originalChecklists = selectedInspection.machineChecklistItemsWithPicCountResponseDtos.find(
                  p =>
                    p.machineInspectionChecklistItemResultBasicResponseDto.id ===
                    v.machineInspectionChecklistItemResultBasicResponseDto.id
                )?.machineInspectionChecklistItemResultBasicResponseDto

                return (
                  JSON.stringify(originalChecklists) !==
                  JSON.stringify(v.machineInspectionChecklistItemResultBasicResponseDto)
                )
              })
              .map(v => v.machineInspectionChecklistItemResultBasicResponseDto)

            handleSaveChecklist(changedChecklists)

            break
          case 'GAS':
            const gasResponse = await mutateGasAsync(editData.gasMeasurementResponseDto)

            setEditData(prev => ({ ...prev, gasMeasurementResponseDto: gasResponse }))
            break
          case 'WIND':
            const windResponse = await mutateWindAsync(editData.windMeasurementResponseDtos)

            setEditData(prev => ({ ...prev, windMeasurementResponseDtos: windResponse }))
            break
          case 'PIPE':
            const pipeResponse = await mutatePipeAsync(editData.pipeMeasurementResponseDtos)

            setEditData(prev => ({ ...prev, pipeMeasurementResponseDtos: pipeResponse }))
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
  }

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

  const onClose = () => {
    if (existChange) {
      setShowAlertModal(true)
    } else {
      setOpen(false)
      setEditData(prev => ({ ...prev, engineerIds: prev.engineerIds.filter(id => id > 0) }))
    }
  }

  return (
    selectedInspection && (
      <Dialog
        fullWidth
        open={open}
        onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
        maxWidth={'md'}
        scroll='paper' // ✅ DialogContent 안에서만 스크롤
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}

        // slotProps={{ container: { sx: { alignItems: 'start', mt: '20dvh' } } }}
      >
        {/* 닫기 버튼 */}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={theme => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          })}
        >
          <IconX />
        </IconButton>

        {/* 수정/삭제 버튼 */}
        <div className='absolute left-4 top-4 sm:left-8 sm:top-8 flex gap-2'>
          <Button variant='contained' color='error' onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        </div>

        {/* 제목 */}
        <DialogTitle
          sx={{ pt: '1.5rem !important' }}
          variant='h4'
          className={
            'text-lg sm:text-xl flex items-center gap-0 sm:gap-2 whitespace-pre-wrap flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'
          }
        >
          <Typography component={'div'} variant='h3'>
            <div className='flex items-center'>
              <Select
                IconComponent={() => null}
                variant='standard'
                value={currentInspectionId}
                onChange={e => {
                  setInspectionId(Number(e.target.value))
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
          </Typography>
        </DialogTitle>

        {/* ✅ 스크롤 처리되는 본문 */}
        <DialogContent>
          <TabContext value={tabValue}>
            <div className={`${styles.container} relative pt-1`}>
              <TabList
                onChange={(_, newValue) => {
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
              <Button
                sx={{ position: 'absolute', right: 0, top: 0 }}
                variant='contained'
                color='info'
                onClick={() => setShowPictureListModal(true)}
              >
                갤러리 (
                {editData.machineChecklistItemsWithPicCountResponseDtos?.reduce(
                  (sum, cate) => (sum += cate.totalMachinePicCount),
                  0
                )}
                )
              </Button>
              <div className='overflow-y-auto pt-5'>
                <TabPanel value={'BASIC'}>
                  <BasicTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
                </TabPanel>
                <TabPanel value={'PIC'}>
                  <handleSaveChecklistContext.Provider value={handleSaveChecklist}>
                    <ChecklistPicTabContent editData={editData} setEditData={setEditData} isEditing={isEditing} />
                  </handleSaveChecklistContext.Provider>
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
          </TabContext>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
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
        </DialogActions>
      </Dialog>
    )
  )
}

export default InspectionDetailModal
