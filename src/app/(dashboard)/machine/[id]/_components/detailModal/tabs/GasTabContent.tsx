import type { Dispatch, SetStateAction } from 'react'

import { MenuItem, TextField } from '@mui/material'

import { LocalizationProvider, TimeField } from '@mui/x-date-pickers'

import dayjs from 'dayjs'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type { MachineInspectionDetailResponseDtoType } from '@/@core/types'
import { fuelTypeOption } from '@/app/_constants/options'

interface GasTabContentProps<T> {
  selectedMachineData: T
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export function GasTabContent({
  selectedMachineData,
  editData,
  setEditData,
  isEditing
}: GasTabContentProps<MachineInspectionDetailResponseDtoType>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='flex flex-col gap-5'>
        {/* 종류 및 용량 */}
        <div className='flex flex-col gap-1'>
          <span className='ps-1 font-bold'>종류 및 용량</span>
          <table aria-label='종류 및 용량' style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <th style={{ width: 80 }}>연료</th>
                <td>
                  {!isEditing ? (
                    fuelTypeOption.find(opt => opt.value === selectedMachineData.gasMeasurementResponseDto.fuelType)
                      ?.label
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.fuelType ?? ''}
                      sx={{ width: '50%' }}
                      select
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            fuelType: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    >
                      {fuelTypeOption.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </td>
                <th style={{ width: 100 }}>보일러용량</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.capacity
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.capacity ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            capacity: e.target.value
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
        </div>

        {/* 연소가스 측정값 */}
        <div className='flex flex-col gap-1'>
          <span className='ps-1 font-bold'>연소가스 측정값</span>
          <table aria-label='연소가스 측정값' style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <th style={{ width: 120 }}></th>
                <th>단위: %</th>
                <th style={{ width: 120 }}></th>
                <th>단위: ppm</th>
              </tr>
              <tr>
                <th>O₂</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.o2
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.o2 ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            o2: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <th>CO</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.co
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.co ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            co: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>XAir</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.xair
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.xair ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            xair: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <th>CO₂ Ratio</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.co2Ratio
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.co2Ratio ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            co2Ratio: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>Eff.</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.eff
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.eff ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            eff: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <th>NO</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.no
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.no ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            no: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ borderLeft: 'none', borderBottom: 'none' }} colSpan={2}></td>
                <th>NOx</th>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.nox
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.nox ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            nox: e.target.value
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
        </div>

        {/* 가스사용량 측정 및 분석결과 */}
        <div className='flex flex-col gap-1'>
          <span className='ps-1 font-bold'>가스사용량 측정 및 분석결과 (N㎥/h)</span>
          <table aria-label='가스사용량 측정 및 분석결과 (N㎥/h)' style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <th rowSpan={2}>기준사용량</th>
                <th colSpan={2}>측정시작</th>
                <th colSpan={2}>측정종료</th>
              </tr>
              <tr>
                <th>시:분:초</th>
                <th>계량기 표시</th>
                <th>시:분:초</th>
                <th>계량기 표시</th>
              </tr>
              <tr>
                <td>
                  {!isEditing ? (
                    (selectedMachineData.gasMeasurementResponseDto.standardUsage ?? '　')
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.standardUsage ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            standardUsage: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.startTime
                  ) : (
                    <TimeField
                      size='small'
                      value={
                        editData.gasMeasurementResponseDto.startTime
                          ? dayjs(editData.gasMeasurementResponseDto.startTime, 'HH:mm:ss')
                          : null
                      }
                      format='HH:mm:ss'
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            startTime: value ? value.format('HH:mm:ss') : ''
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.startMeterValue
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.startMeterValue ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            startMeterValue: e.target.value
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.endTime
                  ) : (
                    <TimeField
                      size='small'
                      value={
                        editData.gasMeasurementResponseDto.endTime
                          ? dayjs(editData.gasMeasurementResponseDto.endTime, 'HH:mm:ss')
                          : null
                      }
                      format='HH:mm:ss'
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            endTime: value ? value.format('HH:mm:ss') : ''
                          }
                        }))
                      }
                      variant='standard'
                    />
                  )}
                </td>
                <td>
                  {!isEditing ? (
                    selectedMachineData.gasMeasurementResponseDto.endMeterValue
                  ) : (
                    <TextField
                      size='small'
                      value={editData.gasMeasurementResponseDto.endMeterValue ?? ''}
                      onChange={e =>
                        setEditData(prev => ({
                          ...prev,
                          gasMeasurementResponseDto: {
                            ...prev.gasMeasurementResponseDto,
                            endMeterValue: e.target.value
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
        </div>
      </div>
    </LocalizationProvider>
  )
}
