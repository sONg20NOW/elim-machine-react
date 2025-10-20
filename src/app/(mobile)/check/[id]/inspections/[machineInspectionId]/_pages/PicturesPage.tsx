import type { Dispatch, RefObject, SetStateAction } from 'react'
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'

import TabPanel from '@mui/lab/TabPanel'
import { Box, Checkbox, InputLabel, MenuItem, TextField, Typography } from '@mui/material'

import { useForm, type UseFormRegister } from 'react-hook-form'

import PictureTable from '../_components/PictureTable'
import { isMobileContext } from '@/app/_components/ProtectedPage'
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType
} from '@/app/_type/types'
import type { InspectionformType } from '../page'
import { checklistItemsContext } from '../page'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'
import { useParams } from 'next/navigation'

interface formType {
  deficiencies: string
  actionRequired: string
}

export interface Form1ComponentHandle {
  submit: () => Promise<boolean>
  isDirty: () => boolean
}

// ! 전역 상태 관리로 props 줄이기.

interface PicturesPageProps {
  scrollableAreaRef: RefObject<HTMLElement>
  TabListRef: RefObject<HTMLElement>
  inspection?: MachineInspectionDetailResponseDtoType
  getInspectionData: () => void
  category: string
  setCategory: Dispatch<SetStateAction<string>>
  saveButtonRef: RefObject<HTMLElement>
}

const PicturesPage = forwardRef<Form1ComponentHandle, PicturesPageProps>((props, ref) => {
  const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

  const isMobile = useContext(isMobileContext)
  const checklistItems = useContext(checklistItemsContext)
  const { scrollableAreaRef, TabListRef, inspection, getInspectionData, category, setCategory, saveButtonRef } = props

  const {
    register,
    getValues,
    reset,
    formState: { isDirty }
  } = useForm<formType>({ defaultValues: { deficiencies: '', actionRequired: '' } })

  const checklistMeta = useRef({ id: 0, version: 0 })

  const [emptyMode, setEmptyMode] = useState(false)

  const checklistItem = checklistItems.find(v => v.machineChecklistItemId === Number(category))

  // form 초기화
  const getChecklistResult = useCallback(async () => {
    if (category === '전체') {
      return
    }

    try {
      const response = await auth
        .get<{
          data: MachineInspectionChecklistItemResultResponseDtoType
        }>(
          `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-inspection-checklist-item-results/${checklistItem?.machineInspectionChecklistItemResultBasicResponseDto.id}`
        )
        .then(v => v.data.data)
      checklistMeta.current = response
      reset({ deficiencies: response.deficiencies ?? '', actionRequired: response.actionRequired ?? '' })
      console.log('checklist result:', response)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionId, category, checklistItem])

  useEffect(() => {
    getChecklistResult()
  }, [getChecklistResult])

  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        const response = await auth
          .put<{
            data: {
              machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultResponseDtoType[]
            }
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-inspection-checklist-item-results`,
            {
              machineInspectionChecklistItemResultUpdateRequestDtos: [
                {
                  id: checklistMeta.current.id,
                  version: checklistMeta.current.version,
                  ...getValues(),
                  inspectionResult: 'FAIL'
                }
              ]
            }
          )
          .then(v => v.data.data.machineInspectionChecklistItemResultUpdateResponseDtos[0])
        checklistMeta.current = response
        reset({ deficiencies: response.deficiencies ?? '', actionRequired: response.actionRequired ?? '' })
        return true
      } catch (e) {
        handleApiError(e)
        return false
      }
    },
    isDirty: () => {
      console.log('dirty', isDirty)
      return isDirty
    }
  }))

  useEffect(() => {
    if (!saveButtonRef) {
      console.log('no ref!')
      return
    }

    if (isDirty) {
      saveButtonRef.current?.classList.add('animate-ring')
    } else {
      saveButtonRef.current?.classList.remove('animate-ring')
    }
  }, [isDirty])

  return (
    <TabPanel
      value={'pictures'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: !isMobile ? 8 : 5
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between items-center'>
            <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
            <div className='flex items-center'>
              <Typography variant='body2'>사진 없음</Typography>
              <Checkbox size='small' value={emptyMode} onChange={() => setEmptyMode(prev => !prev)} />
            </div>
          </div>
          <TextField
            select
            size={isMobile ? 'small' : 'medium'}
            id='machineProjectName'
            fullWidth
            hiddenLabel
            slotProps={{
              input: {
                sx: {
                  fontSize: 18,
                  color: checklistItem?.totalMachinePicCount === 0 ? 'red' : ''
                }
              }
            }}
            value={category}
            onChange={e => {
              setCategory(e.target.value)
            }}
          >
            <MenuItem value='전체'>전체</MenuItem>
            {checklistItems.map(v =>
              v.machineChecklistItemName !== '기타' ? (
                <MenuItem
                  key={v.machineChecklistItemId}
                  value={v.machineChecklistItemId}
                  sx={{
                    color: v.totalMachinePicCount === 0 ? 'red' : ''
                  }}
                >
                  {v.machineChecklistItemName} [{v.checklistSubItems.filter(p => p.machinePicCount !== 0).length}/
                  {v.checklistSubItems.length}]
                </MenuItem>
              ) : (
                <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                  {v.machineChecklistItemName}
                </MenuItem>
              )
            )}
          </TextField>
        </div>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
          {category !== '전체' && (
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>미흡사항</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('deficiencies')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
          )}
          {category !== '전체' && (
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>조치필요사항</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                fullWidth
                {...register('actionRequired')}
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
          )}
        </Box>
      </Box>
      {/* {inspection && (
            <PictureTable
              machineChecklistItemId={checklistItem?.machineChecklistItemId ?? null}
              emptyMode={emptyMode}
              scrollableAreaRef={scrollableAreaRef}
              checklists={checklistItems}
              refetchChecklists={getInspectionData}
              tabHeight={TabListRef.current?.clientHeight ?? 0}
            />
          )} */}
    </TabPanel>
  )
})

export default PicturesPage
