import type { Dispatch, RefObject, SetStateAction } from 'react'
import { forwardRef, memo, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react'

import { useParams } from 'next/navigation'

import { Box, Checkbox, InputLabel, MenuItem, TextField, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import type { MachineInspectionChecklistItemResultResponseDtoType } from '@/@core/types'
import type { FormComponentHandle } from '../page'
import { checklistItemsContext } from '../page'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'

interface formType {
  deficiencies: string
  actionRequired: string
}

interface ChecklistFormProps {
  category: string
  setCategory: Dispatch<SetStateAction<string>>
  saveButtonRef: RefObject<HTMLElement>
}

const ChecklistForm = memo(
  forwardRef<FormComponentHandle, ChecklistFormProps>((props, ref) => {
    const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

    const isMobile = useContext(isMobileContext)
    const checklistItems = useContext(checklistItemsContext)
    const { category, setCategory, saveButtonRef } = props

    const {
      register,
      getValues,
      reset,
      formState: { isDirty }
    } = useForm<formType>({ defaultValues: { deficiencies: '', actionRequired: '' } })

    const checklistMeta = useRef({ id: 0, version: 0 })

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
        console.log('initialize checklist result form:', response)
      } catch (error) {
        handleApiError(error)
      }
    }, [machineProjectId, inspectionId, category, checklistItem, reset])

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
          console.log('reset checklist result form:', response)

          return true
        } catch (e) {
          handleApiError(e)

          return false
        }
      },
      isDirty: () => {
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
    }, [isDirty, saveButtonRef])

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between items-center'>
            <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
            <div className='flex items-center'>
              <Typography variant='body2'>사진 없음</Typography>
              <Checkbox size='small' sx={{ opacity: 0 }} />
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
    )
  })
)

export default ChecklistForm
