import type { MutableRefObject, RefObject } from 'react'
import { forwardRef, memo, useCallback, useContext, useEffect, useImperativeHandle, useState } from 'react'

import { useParams } from 'next/navigation'

import TabPanel from '@mui/lab/TabPanel'

import { InputLabel, MenuItem, TextField } from '@mui/material'

import { useForm } from 'react-hook-form'

import { isMobileContext } from '@/@core/components/custom/ProtectedPage'
import type { MachineInspectionDetailResponseDtoType, MachineInspectionResponseDtoType } from '@/app/_type/types'
import type { FormComponentHandle } from '../page'

// import { engineerListContext } from '../page'
// import EngineerCard from '../_components/EngineerCard'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'

export interface formType {
  machineInspectionName: string
  location: string
  purpose: string
  installedDate: string
  manufacturedDate: string
  usedDate: string
  checkDate: string
  remark: string
}

interface InspectionFormProps {
  saveButtonRef: RefObject<HTMLElement>
  inspectionVersion: MutableRefObject<number>
}

const InspectionForm = memo(
  forwardRef<FormComponentHandle, InspectionFormProps>(({ saveButtonRef, inspectionVersion }, ref) => {
    const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

    const isMobile = useContext(isMobileContext)

    const [dayType1, setDayType1] = useState<'installedDate' | 'manufacturedDate'>('installedDate')
    const [dayType2, setDayType2] = useState<'usedDate' | 'checkDate'>('usedDate')

    // const engineerList = useContext(engineerListContext)
    // const [newEngineerId, setNewEngineerId] = useState(-1)

    const {
      register,
      getValues,
      reset,
      formState: { isDirty }
    } = useForm<formType>()

    // 현재 선택된 inspection 데이터 가져오기
    const getInspectionData = useCallback(async () => {
      try {
        const response = await auth
          .get<{
            data: MachineInspectionDetailResponseDtoType
          }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}`)
          .then(v => v.data.data.machineInspectionResponseDto)

        inspectionVersion.current = response.version
        reset(response)
        console.log('initialize inspection form: ', response)
      } catch (error) {
        handleApiError(error)
      }
    }, [machineProjectId, inspectionId, reset, inspectionVersion])

    useEffect(() => {
      getInspectionData()
    }, [getInspectionData])

    useImperativeHandle(ref, () => ({
      submit: async () => {
        try {
          const response = await auth
            .put<{
              data: MachineInspectionResponseDtoType
            }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}`, {
              ...getValues(),
              version: inspectionVersion.current
            })
            .then(v => v.data.data)

          inspectionVersion.current = response.version
          reset(response)
          console.log('reset inspection form:', response)

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
      <TabPanel
        value={'info'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: !isMobile ? 2 : 1
        }}
      >
        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>설비명</InputLabel>
          <TextField
            size={isMobile ? 'small' : 'medium'}
            {...register('machineInspectionName')}
            id='machineInspectionName'
            fullWidth
            hiddenLabel
            slotProps={{ input: { sx: { fontSize: 18 } } }}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>위치</InputLabel>
          <TextField
            size={isMobile ? 'small' : 'medium'}
            {...register('location')}
            id='location'
            fullWidth
            hiddenLabel
            slotProps={{ input: { sx: { fontSize: 18 } } }}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>용도</InputLabel>
          <TextField
            size={isMobile ? 'small' : 'medium'}
            {...register('purpose')}
            id='purpose'
            fullWidth
            hiddenLabel
            slotProps={{ input: { sx: { fontSize: 18 } } }}
          />
        </div>
        {/* 설치/점검일 */}
        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>설치/제조일</InputLabel>
          <div className='flex gap-2'>
            <TextField
              value={dayType1}
              onChange={e => {
                if (e.target.value === 'installedDate' || e.target.value === 'manufacturedDate')
                  setDayType1(e.target.value)
              }}
              slotProps={{ input: { sx: { fontSize: 18 } } }}
              select
              sx={{ flex: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              {[
                { label: '설치일', value: 'installedDate' },
                { label: '제조일', value: 'manufacturedDate' }
              ].map(v => (
                <MenuItem value={v.value} key={v.value}>
                  {v.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              key={dayType1}
              type='date'
              sx={{ flex: isMobile ? 2 : 4 }}
              size={isMobile ? 'small' : 'medium'}
              fullWidth
              {...register(dayType1)}
              hiddenLabel
              slotProps={{
                input: { sx: { fontSize: 18, ...(isMobile ? { py: '8.5px', px: '14px' } : {}) } },
                htmlInput: { sx: { p: 0 } }
              }}
            />
          </div>
        </div>
        {/* 사용/점검일 */}
        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>사용/점검일</InputLabel>
          <div className='flex gap-2'>
            <TextField
              value={dayType2}
              onChange={e => {
                if (e.target.value === 'usedDate' || e.target.value === 'checkDate') setDayType2(e.target.value)
              }}
              slotProps={{ input: { sx: { fontSize: 18 } } }}
              select
              sx={{ flex: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              {[
                { label: '사용일', value: 'usedDate' },
                { label: '점검일', value: 'checkDate' }
              ].map(v => (
                <MenuItem value={v.value} key={v.value}>
                  {v.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              key={dayType2}
              type='date'
              sx={{ flex: isMobile ? 2 : 4 }}
              size={isMobile ? 'small' : 'medium'}
              fullWidth
              {...register(dayType2)}
              hiddenLabel
              slotProps={{
                input: { sx: { fontSize: 18, ...(isMobile ? { py: '8.5px', px: '14px' } : {}) } },
                ...(isMobile && { htmlInput: { sx: { p: 0 } } })
              }}
            />
          </div>
        </div>

        {/* <div className='flex flex-col gap-1'>
        <InputLabel>점검자 목록</InputLabel>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            border: '1px solid lightgray',
            borderRadius: 1
          }}
        >
          <div className='flex gap-1'>
            <TextField
              select
              value={newEngineerId}
              onChange={e => {
                const newId = Number(e.target.value)

                setNewEngineerId(newId)
              }}
              size={isMobile ? 'small' : 'medium'}
              id='requirement'
              fullWidth
              hiddenLabel
              slotProps={{ input: { sx: { fontSize: 18 } } }}
            >
              <MenuItem sx={{ fontSize: 18, display: 'none' }} disabled value={-1}>
                <Typography variant='inherit' color='warning'>
                  점검자를 추가하세요
                </Typography>
              </MenuItem>
              {engineerList.map(v => (
                <MenuItem
                  sx={{ fontSize: 18 }}
                  disabled={inspection?.engineerIds.includes(v.engineerId)}
                  value={v.engineerId}
                  key={v.engineerId}
                >{`[${v.gradeDescription}] ${v.engineerName}`}</MenuItem>
              ))}
            </TextField>
            <IconButton
              onClick={() => {
                setInspection(
                  prev =>
                    prev && {
                      ...prev,
                      engineerIds: prev.engineerIds.includes(newEngineerId)
                        ? prev.engineerIds
                        : prev.engineerIds.concat(newEngineerId)
                    }
                )
                setNewEngineerId(-1)
              }}
            >
              <i className='tabler-plus' />
            </IconButton>
          </div>
          <Box
            sx={{
              border: '1px dashed lightgray',
              borderRadius: 1,
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            {inspection?.engineerIds.length !== 0 ? (
              inspection?.engineerIds.map((id, index) => {
                const engineer = engineerList.find(i => i.engineerId === id)

                return (
                  engineer && (
                    <EngineerCard
                      key={index}
                      engineer={engineer}
                      handleDeleteEngineer={() =>
                        setInspection(
                          prev =>
                            prev && { ...prev, engineerIds: prev?.engineerIds.filter(id => id !== engineer.engineerId) }
                        )
                      }
                    />
                  )
                )
              })
            ) : (
              <Typography sx={{ textAlign: 'center' }}>참여 중인 점검자가 없습니다.</Typography>
            )}
          </Box>
        </Box>
      </div> */}

        <div className='flex flex-col gap-1'>
          <InputLabel sx={{ px: 2 }}>비고</InputLabel>
          <TextField
            size={isMobile ? 'small' : 'medium'}
            {...register('remark')}
            id='remark'
            fullWidth
            hiddenLabel
            multiline
            minRows={4}
            slotProps={{ input: { sx: { fontSize: 18 } } }}
          />
        </div>
      </TabPanel>
    )
  })
)

export default InspectionForm
