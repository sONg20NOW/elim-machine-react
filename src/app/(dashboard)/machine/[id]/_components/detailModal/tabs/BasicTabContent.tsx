'use client'

import { useCallback, useEffect, type Dispatch, type SetStateAction } from 'react'

import { useParams } from 'next/navigation'

import { Button, Card, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material'

import type { MachineInspectionDetailResponseDtoType } from '@/@core/types'
import { useGetParticipatedEngineerList } from '@/@core/hooks/customTanstackQueries'
import { equipmentPhaseOption } from '@/app/_constants/options'

interface basicTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export default function BasicTabContent({
  editData,
  setEditData,
  isEditing
}: basicTabContentProps<MachineInspectionDetailResponseDtoType>) {
  const params = useParams()
  const machineProjectId = params?.id as string

  const { data: participatedEngineerList } = useGetParticipatedEngineerList(machineProjectId)

  useEffect(() => {
    if (!isEditing) {
      setEditData(prev => ({ ...prev, engineerIds: prev.engineerIds.filter(id => id > 0) }))
    }
  }, [isEditing, setEditData])

  const AddEveryParticipatedEngs = useCallback(() => {
    if (!participatedEngineerList) return
    setEditData(prev => ({ ...prev, engineerIds: participatedEngineerList.map(v => v.engineerId) }))
  }, [participatedEngineerList, setEditData])

  return (
    <div className='flex flex-col gap-5'>
      <table style={{ tableLayout: 'fixed' }} className='[&>tbody>tr>td]:py-0'>
        <tbody>
          <tr>
            <th>설비명</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.machineInspectionName
              ) : (
                <TextField
                  slotProps={{ htmlInput: { sx: { p: 0 } } }}
                  size='small'
                  value={editData.machineInspectionResponseDto.machineInspectionName}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        machineInspectionName: e.target.value
                      }
                    }))
                  }
                  variant='standard'
                />
              )}
            </td>
            <th>
              {!isEditing ? (
                (equipmentPhaseOption.find(opt => opt.value === editData.machineInspectionResponseDto.equipmentPhase)
                  ?.label ?? '-')
              ) : (
                <Select
                  variant='standard'
                  size='small'
                  value={editData.machineInspectionResponseDto.equipmentPhase ?? ''}
                  sx={{ '& .MuiSelect-select': { p: '0px !important' } }}
                  IconComponent={() => null}
                  displayEmpty
                  renderValue={value => {
                    const found = equipmentPhaseOption.find(opt => opt.value === value)?.label

                    return found ? (
                      <Typography variant='inherit'>{found}</Typography>
                    ) : (
                      <Typography variant='inherit' sx={{ opacity: '60%' }}>
                        미정
                      </Typography>
                    )
                  }}
                  slotProps={{ input: { sx: { p: 0 } } }}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        equipmentPhase:
                          e.target.value !== '' ? (e.target.value as 'INSTALL' | 'MANUFACTURE' | 'USE') : null
                      }
                    }))
                  }
                >
                  {equipmentPhaseOption.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.equipmentPhaseDate
              ) : (
                <TextField
                  slotProps={{ htmlInput: { sx: { p: 0 }, max: '2999-01-01', min: '1900-01-01' } }}
                  type='date'
                  size='small'
                  value={editData.machineInspectionResponseDto.equipmentPhaseDate ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        equipmentPhaseDate: e.target.value
                      }
                    }))
                  }
                  variant='standard'
                />
              )}
            </td>
          </tr>
          <tr>
            <th>종류</th>
            <td colSpan={2}>
              <Tooltip arrow title='종류는 변경할 수 없습니다.'>
                <span>{editData.machineInspectionResponseDto.machineCategoryName}</span>
              </Tooltip>
            </td>
            <th>점검일</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.checkDate
              ) : (
                <TextField
                  slotProps={{ htmlInput: { sx: { p: 0 }, max: '2999-01-01', min: '1900-01-01' } }}
                  type='date'
                  size='small'
                  value={editData.machineInspectionResponseDto.checkDate ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        checkDate: e.target.value
                      }
                    }))
                  }
                  variant='standard'
                />
              )}
            </td>
          </tr>
          <tr>
            <th>용도</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.purpose
              ) : (
                <TextField
                  size='small'
                  slotProps={{ htmlInput: { sx: { p: 0 } } }}
                  value={editData.machineInspectionResponseDto.purpose}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        purpose: e.target.value
                      }
                    }))
                  }
                  variant='standard'
                />
              )}
            </td>
            <th>위치</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.location
              ) : (
                <TextField
                  slotProps={{ htmlInput: { sx: { p: 0 } } }}
                  size='small'
                  value={editData.machineInspectionResponseDto.location}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        location: e.target.value
                      }
                    }))
                  }
                  variant='standard'
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className='flex flex-col gap-2'>
        <div className='flex justify-between items-center'>
          <Typography variant='h5'>점검자 목록</Typography>
          {isEditing && (
            <Button type='button' color='success' onClick={AddEveryParticipatedEngs}>
              참여기술진 모두 추가
            </Button>
          )}
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {!isEditing
            ? (editData.engineerIds || []).map((id, idx) => {
                const engineer = participatedEngineerList?.find(value => value.engineerId === id)

                return (
                  <Card
                    key={idx}
                    variant='outlined'
                    sx={{ px: 4, py: 2, border: '1px solid #d1d5db' }}
                  >{`${engineer?.engineerName} [${engineer?.gradeDescription}]`}</Card>
                )
              })
            : editData.engineerIds
                .map((id, idx) => {
                  const engineer = participatedEngineerList?.find(value => value.engineerId === id)

                  return (
                    <TextField
                      key={idx}
                      sx={{ '& .MuiSelect-select': { px: '16px !important', py: '8px' } }}
                      fullWidth
                      SelectProps={{ IconComponent: () => null }}
                      value={engineer?.engineerId ?? ''}
                      select
                      onChange={e => {
                        editData.engineerIds.splice(idx, 1, Number(e.target.value))

                        setEditData(prev => ({
                          ...prev,
                          engineerIds: prev.engineerIds
                        }))
                      }}
                    >
                      {participatedEngineerList?.map(engineer => (
                        <MenuItem
                          key={engineer.engineerId}
                          value={engineer.engineerId}
                          disabled={editData.engineerIds.includes(engineer.engineerId)}
                        >{`${engineer?.engineerName} [${engineer?.gradeDescription}]`}</MenuItem>
                      ))}
                      <MenuItem
                        sx={{ color: 'white', bgcolor: 'error.light' }}
                        onClick={() =>
                          setEditData(prev => ({
                            ...prev,
                            engineerIds: prev.engineerIds.filter((id, index) => idx !== index)
                          }))
                        }
                      >
                        삭제
                      </MenuItem>
                    </TextField>
                  )
                })
                .concat(
                  <Card
                    key={'plus'}
                    sx={{ bgcolor: 'primary.light', border: 'solid 2px', borderColor: 'primary.main' }}
                    variant='outlined'
                    component={Button}
                    onClick={() => setEditData(prev => ({ ...prev, engineerIds: editData.engineerIds.concat(0) }))}
                  >
                    <i className='tabler-plus text-white' />
                  </Card>
                )}
        </div>
      </div>
      <table style={{ tableLayout: 'fixed' }}>
        <tbody>
          <tr>
            <th>비고</th>
            <td colSpan={8} height={100} style={{ verticalAlign: 'top' }}>
              {!isEditing ? (
                <span className='whitespace-pre-wrap'>{editData.machineInspectionResponseDto.remark}</span>
              ) : (
                <TextField
                  slotProps={{ input: { sx: { py: 1, px: 2 } } }}
                  fullWidth
                  multiline
                  minRows={4}
                  value={editData.machineInspectionResponseDto.remark ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        remark: e.target.value
                      }
                    }))
                  }
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
