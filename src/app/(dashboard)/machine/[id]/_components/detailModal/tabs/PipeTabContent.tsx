import type { Dispatch, SetStateAction } from 'react'

import { Divider, MenuItem, TextField } from '@mui/material'

import type { MachineInspectionDetailResponseDtoType, pipeTypeType } from '@core/types'
import { pipeTypeOption } from '@/@core/data/options'

interface WindTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export default function PipeTabContent({
  editData,
  setEditData,
  isEditing
}: WindTabContentProps<MachineInspectionDetailResponseDtoType>) {
  return (
    <div className='flex-col flex gap-5'>
      {!isEditing
        ? editData.pipeMeasurementResponseDtos.map((info, idx) => (
            <div key={idx} className='flex-col flex gap-4'>
              {idx !== 0 && <Divider />}
              <div className='flex flex-col gap-1'>
                <span className='ps-1 font-bold'>배관 두께 측정 {idx + 1}</span>
                <table aria-label={`배관 두께 측정 ${idx + 1}`} style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <th>배관종류</th>
                      <td colSpan={2}>{pipeTypeOption.find(opt => opt.value === info.pipeType)?.label}</td>
                      <th>외경</th>
                      <th>공칭두께</th>
                      <th colSpan={5}>측정두께 (mm)</th>
                    </tr>
                    <tr>
                      <th>배관구분</th>
                      <td colSpan={2}>{info.pipePosition}</td>
                      <td>{info.outerDiameter}</td>
                      <td>{info.nominalThickness}</td>
                      <td>{info.measuredThickness1}</td>
                      <td>{info.measuredThickness2}</td>
                      <td>{info.measuredThickness3}</td>
                      <td>{info.measuredThickness4}</td>
                      <td>{info.measuredThickness5}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        : editData.pipeMeasurementResponseDtos.map((editInfo, idx) => (
            <div key={idx} className='flex-col flex gap-4'>
              {idx !== 0 && <Divider />}
              <div className='flex flex-col gap-1'>
                <span className='ps-1 font-bold'>배관 두께 측정 {idx + 1}</span>
                <table
                  aria-label={`배관 두께 측정 ${idx + 1}`}
                  className='[&>tbody>tr>td]:py-0'
                  style={{ tableLayout: 'fixed' }}
                >
                  <tbody>
                    <tr>
                      <th>배관종류</th>
                      <td colSpan={2}>
                        <TextField
                          size='small'
                          value={editInfo.pipeType ?? ''}
                          select
                          fullWidth
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, pipeType: e.target.value as pipeTypeType } : p
                              )
                            }))
                          }
                          variant='standard'
                        >
                          {pipeTypeOption.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </td>
                      <th>외경</th>
                      <th>공칭두께</th>
                      <th colSpan={5}>측정두께 (mm)</th>
                    </tr>
                    <tr>
                      <th>배관구분</th>
                      <td colSpan={2}>
                        <TextField
                          size='small'
                          value={editInfo.pipePosition ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, pipePosition: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.outerDiameter ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, outerDiameter: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.nominalThickness ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, nominalThickness: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.measuredThickness1 ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, measuredThickness1: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.measuredThickness2 ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, measuredThickness2: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.measuredThickness3 ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, measuredThickness3: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.measuredThickness4 ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, measuredThickness4: e.target.value } : p
                              )
                            }))
                          }
                          variant='standard'
                        />
                      </td>
                      <td>
                        <TextField
                          size='small'
                          value={editInfo.measuredThickness5 ?? ''}
                          onChange={e =>
                            setEditData(prev => ({
                              ...prev,
                              pipeMeasurementResponseDtos: prev.pipeMeasurementResponseDtos.map((p, i) =>
                                i === idx ? { ...p, measuredThickness5: e.target.value } : p
                              )
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
          ))}
    </div>
  )
}
