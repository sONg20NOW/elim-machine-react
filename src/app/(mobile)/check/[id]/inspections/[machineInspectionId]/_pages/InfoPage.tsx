import type { Dispatch, SetStateAction } from 'react'
import { useContext, useState } from 'react'

import TabPanel from '@mui/lab/TabPanel'

import { InputLabel, MenuItem, TextField } from '@mui/material'

import { isMobileContext } from '@/app/_components/ProtectedPage'
import type { MachineInspectionDetailResponseDtoType } from '@/app/_type/types'

interface InfoPageProps {
  inspection?: MachineInspectionDetailResponseDtoType
  setInspection: Dispatch<SetStateAction<MachineInspectionDetailResponseDtoType | undefined>>
}

export default function InfoPage({ inspection, setInspection }: InfoPageProps) {
  const isMobile = useContext(isMobileContext)

  const [dayType1, setDayType1] = useState<'installedDate' | 'manufacturedDate'>('installedDate')
  const [dayType2, setDayType2] = useState<'usedDate' | 'checkDate'>('usedDate')

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
          id='requirement'
          fullWidth
          value={inspection?.machineInspectionResponseDto.machineInspectionName ?? ''}
          onChange={e =>
            setInspection(
              prev =>
                prev && {
                  ...prev,
                  machineInspectionResponseDto: {
                    ...prev.machineInspectionResponseDto,
                    machineInspectionName: e.target.value
                  }
                }
            )
          }
          hiddenLabel
          slotProps={{ input: { sx: { fontSize: 18 } } }}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <InputLabel sx={{ px: 2 }}>위치</InputLabel>
        <TextField
          size={isMobile ? 'small' : 'medium'}
          id='requirement'
          fullWidth
          value={inspection?.machineInspectionResponseDto.location ?? ''}
          onChange={e =>
            setInspection(
              prev =>
                prev && {
                  ...prev,
                  machineInspectionResponseDto: {
                    ...prev.machineInspectionResponseDto,
                    location: e.target.value
                  }
                }
            )
          }
          hiddenLabel
          slotProps={{ input: { sx: { fontSize: 18 } } }}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <InputLabel sx={{ px: 2 }}>용도</InputLabel>
        <TextField
          size={isMobile ? 'small' : 'medium'}
          id='requirement'
          fullWidth
          value={inspection?.machineInspectionResponseDto.purpose ?? ''}
          onChange={e =>
            setInspection(
              prev =>
                prev && {
                  ...prev,
                  machineInspectionResponseDto: {
                    ...prev.machineInspectionResponseDto,
                    purpose: e.target.value
                  }
                }
            )
          }
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
            type='date'
            sx={{ flex: isMobile ? 2 : 4 }}
            size={isMobile ? 'small' : 'medium'}
            fullWidth
            value={inspection?.machineInspectionResponseDto[dayType1] ?? ''}
            onChange={e =>
              setInspection(
                prev =>
                  prev && {
                    ...prev,
                    machineInspectionResponseDto: {
                      ...prev.machineInspectionResponseDto,
                      [dayType1]: e.target.value
                    }
                  }
              )
            }
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
            type='date'
            sx={{ flex: isMobile ? 2 : 4 }}
            size={isMobile ? 'small' : 'medium'}
            fullWidth
            value={inspection?.machineInspectionResponseDto[dayType2] ?? ''}
            onChange={e =>
              setInspection(
                prev =>
                  prev && {
                    ...prev,
                    machineInspectionResponseDto: {
                      ...prev.machineInspectionResponseDto,
                      [dayType2]: e.target.value
                    }
                  }
              )
            }
            hiddenLabel
            slotProps={{
              input: { sx: { fontSize: 18, ...(isMobile ? { py: '8.5px', px: '14px' } : {}) } },
              ...(isMobile && { htmlInput: { sx: { p: 0 } } })
            }}
          />
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <InputLabel sx={{ px: 2 }}>점검자</InputLabel>
        <TextField
          size={isMobile ? 'small' : 'medium'}
          id='requirement'
          fullWidth
          value={inspection?.engineerIds ?? ''}
          onChange={e =>
            setInspection(
              prev =>
                prev && {
                  ...prev,
                  machineInspectionResponseDto: {
                    ...prev.machineInspectionResponseDto,
                    engineerIds: e.target.value
                  }
                }
            )
          }
          hiddenLabel
          slotProps={{ input: { sx: { fontSize: 18 } } }}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <InputLabel sx={{ px: 2 }}>비고</InputLabel>
        <TextField
          size={isMobile ? 'small' : 'medium'}
          id='requirement'
          fullWidth
          value={inspection?.machineInspectionResponseDto.remark ?? ''}
          onChange={e =>
            setInspection(
              prev =>
                prev && {
                  ...prev,
                  machineInspectionResponseDto: {
                    ...prev.machineInspectionResponseDto,
                    remark: e.target.value
                  }
                }
            )
          }
          hiddenLabel
          multiline
          minRows={4}
          slotProps={{ input: { sx: { fontSize: 18 } } }}
        />
      </div>
    </TabPanel>
  )
}
