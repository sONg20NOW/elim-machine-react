import type { Dispatch, RefObject, SetStateAction } from 'react'
import { forwardRef, memo, useContext, useEffect, useImperativeHandle, useRef } from 'react'

import { useParams } from 'next/navigation'

import { Box, Checkbox, InputLabel, MenuItem, TextField, Typography } from '@mui/material'

import { useForm } from 'react-hook-form'

import { isMobileContext } from '@core/components/custom/ProtectedPage'
import type { MachineInspectionChecklistItemResultResponseDtoType } from '@core/types'
import type { FormComponentHandle } from '../page'
import { auth } from '@core/utils/auth'
import { useGetChecklistInfo, useGetChecklistResult } from '@core/hooks/customTanstackQueries'
import { printErrorSnackbar } from '@core/utils/snackbarHandler'

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
    const { id: machineProjectId, machineInspectionId } = useParams()

    const { data: checklistList } = useGetChecklistInfo(machineProjectId!.toString(), machineInspectionId!.toString())

    const isMobile = useContext(isMobileContext)
    const { category, setCategory, saveButtonRef } = props

    const {
      register,
      getValues,
      reset,
      formState: { isDirty }
    } = useForm<formType>({ defaultValues: { deficiencies: '', actionRequired: '' } })

    const checklistMeta = useRef({ id: 0, version: 0 })

    const checklistItem = checklistList?.find(v => v.machineChecklistItemId === Number(category))

    const { data: checklistResult, refetch } = useGetChecklistResult(
      `${machineProjectId}`,
      `${machineInspectionId}`,
      `${checklistItem?.machineInspectionChecklistItemResultBasicResponseDto.id}`
    )

    useEffect(() => {
      if (!checklistResult) return
      checklistMeta.current = checklistResult
      reset({ deficiencies: checklistResult.deficiencies ?? '', actionRequired: checklistResult.actionRequired ?? '' })
    }, [checklistResult, reset])

    useImperativeHandle(ref, () => ({
      submit: async () => {
        try {
          const response = await auth
            .put<{
              data: {
                machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultResponseDtoType[]
              }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-inspection-checklist-item-results`,
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

          refetch()
          console.log('reset checklist result form:', response.id)

          return true
        } catch (e) {
          printErrorSnackbar(e)

          return false
        }
      },
      isDirty: isDirty
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
            {checklistList?.map(v =>
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
