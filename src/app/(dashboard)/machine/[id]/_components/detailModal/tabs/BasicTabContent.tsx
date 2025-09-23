'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useContext } from 'react'

import { Button, Card, MenuItem, TextField, Tooltip } from '@mui/material'

import { ParticipatedEngineersContext } from '../../machineContent'
import type { MachineInspectionDetailResponseDtoType } from '@/app/_type/types'

interface basicTabContentProps<T> {
  selectedMachineData: T
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export default function BasicTabContent({
  selectedMachineData,
  editData,
  setEditData,
  isEditing
}: basicTabContentProps<MachineInspectionDetailResponseDtoType>) {
  const participatedEngineers = useContext(ParticipatedEngineersContext)

  return (
    <div className='flex flex-col gap-5'>
      <table style={{ tableLayout: 'fixed' }}>
        <tbody>
          <tr>
            <th>설비명</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.machineInspectionName
              ) : (
                <TextField
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
            <th>설치일</th>
            <td colSpan={2}>
              {!isEditing ? (
                editData.machineInspectionResponseDto.installedDate
              ) : (
                <TextField
                  type='date'
                  size='small'
                  value={editData.machineInspectionResponseDto.installedDate ?? ''}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      machineInspectionResponseDto: {
                        ...prev.machineInspectionResponseDto,
                        installedDate: e.target.value
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

      <div>
        <span className='font-bold ps-1'>점검자 목록</span>
        <div className='grid grid-cols-4 gap-2'>
          {!isEditing
            ? (selectedMachineData.engineerIds || []).map((id, idx) => {
                const engineer = participatedEngineers.find(value => value.engineerId === id)

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
                  const engineer = participatedEngineers.find(value => value.engineerId === id)

                  return (
                    <Card key={idx} variant='outlined' sx={{ px: 2, py: 2, border: '1px solid #d1d5db' }}>
                      <TextField
                        slotProps={{
                          htmlInput: { sx: { padding: 0 } }
                        }}
                        fullWidth
                        SelectProps={{ IconComponent: () => null }}
                        value={engineer?.engineerId ?? ''}
                        select
                        variant='standard'
                        onChange={e => {
                          editData.engineerIds.splice(idx, 1, Number(e.target.value))

                          setEditData(prev => ({
                            ...prev,
                            engineerIds: prev.engineerIds
                          }))
                        }}
                      >
                        {participatedEngineers.map(engineer => (
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
                    </Card>
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
