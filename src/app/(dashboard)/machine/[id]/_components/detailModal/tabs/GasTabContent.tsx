import type { Dispatch, SetStateAction } from 'react'

import { MenuItem, TextField } from '@mui/material'
import { LocalizationProvider, TimeField } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type { MachineInspectionDetailResponseDtoType } from '@/@core/types'
import { fuelTypeOption } from '@/app/_constants/options'

interface GasTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export function GasTabContent({
  editData,
  setEditData,
  isEditing
}: GasTabContentProps<MachineInspectionDetailResponseDtoType>) {
  if (!isEditing) {
    // ----------------------- READ-ONLY MODE -----------------------
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
                    {fuelTypeOption.find(opt => opt.value === editData.gasMeasurementResponseDto.fuelType)?.label}
                  </td>
                  <th style={{ width: 100 }}>보일러용량</th>
                  <td>{editData.gasMeasurementResponseDto.capacity}</td>
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
                  <td>{editData.gasMeasurementResponseDto.o2}</td>
                  <th>CO</th>
                  <td>{editData.gasMeasurementResponseDto.co}</td>
                </tr>
                <tr>
                  <th>XAir</th>
                  <td>{editData.gasMeasurementResponseDto.xair}</td>
                  <th>CO₂ Ratio</th>
                  <td>{editData.gasMeasurementResponseDto.co2Ratio}</td>
                </tr>
                <tr>
                  <th>Eff.</th>
                  <td>{editData.gasMeasurementResponseDto.eff}</td>
                  <th>NO</th>
                  <td>{editData.gasMeasurementResponseDto.no}</td>
                </tr>
                <tr>
                  <td style={{ borderLeft: 'none', borderBottom: 'none' }} colSpan={2}></td>
                  <th>NOx</th>
                  <td>{editData.gasMeasurementResponseDto.nox}</td>
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
                  <td>{editData.gasMeasurementResponseDto.standardUsage ?? '　'}</td>
                  <td>{editData.gasMeasurementResponseDto.startTime}</td>
                  <td>{editData.gasMeasurementResponseDto.startMeterValue}</td>
                  <td>{editData.gasMeasurementResponseDto.endTime}</td>
                  <td>{editData.gasMeasurementResponseDto.endMeterValue}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </LocalizationProvider>
    )
  }

  // ----------------------- EDIT MODE -----------------------
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className='flex flex-col gap-5 [&>div>table>tbody>tr>td]:py-0'>
        {/* 종류 및 용량 */}
        <div className='flex flex-col gap-1'>
          <span className='ps-1 font-bold'>종류 및 용량</span>
          <table aria-label='종류 및 용량' style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <th style={{ width: 80 }}>연료</th>
                <td>
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
                </td>
                <th style={{ width: 100 }}>보일러용량</th>
                <td>
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
              {[
                ['O₂', 'o2', 'CO', 'co'],
                ['XAir', 'xair', 'CO₂ Ratio', 'co2Ratio'],
                ['Eff.', 'eff', 'NO', 'no'],
                ['', '', 'NOx', 'nox']
              ].map(([label1, key1, label2, key2], i) => (
                <tr key={i}>
                  {label1 ? <th>{label1}</th> : <th style={{ border: 'none', backgroundColor: 'inherit' }} />}
                  {key1 ? (
                    <td>
                      <TextField
                        size='small'
                        value={
                          editData.gasMeasurementResponseDto[key1 as keyof typeof editData.gasMeasurementResponseDto] ??
                          ''
                        }
                        onChange={e =>
                          setEditData(prev => ({
                            ...prev,
                            gasMeasurementResponseDto: {
                              ...prev.gasMeasurementResponseDto,
                              [key1]: e.target.value
                            }
                          }))
                        }
                        variant='standard'
                      />
                    </td>
                  ) : (
                    <td style={{ border: 'none', backgroundColor: 'inherit' }} />
                  )}
                  {label2 && <th>{label2}</th>}
                  {key2 && (
                    <td>
                      <TextField
                        size='small'
                        value={
                          editData.gasMeasurementResponseDto[key2 as keyof typeof editData.gasMeasurementResponseDto] ??
                          ''
                        }
                        onChange={e =>
                          setEditData(prev => ({
                            ...prev,
                            gasMeasurementResponseDto: {
                              ...prev.gasMeasurementResponseDto,
                              [key2]: e.target.value
                            }
                          }))
                        }
                        variant='standard'
                      />
                    </td>
                  )}
                </tr>
              ))}
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
              <tr className='[&>td]:!py-1'>
                <td>
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
                </td>
                <td>
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
                </td>
                <td>
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
                </td>
                <td>
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
                </td>
                <td>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </LocalizationProvider>
  )
}
