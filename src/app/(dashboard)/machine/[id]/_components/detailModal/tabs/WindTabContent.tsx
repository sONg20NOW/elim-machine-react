import type { Dispatch, SetStateAction } from 'react'

import { Divider, MenuItem, TextField } from '@mui/material'

import type { fanTypeType, MachineInspectionDetailResponseDtoType } from '@core/types'
import { fanTypeOption } from '@/@core/data/options'

interface WindTabContentProps<T> {
  editData: T
  setEditData: Dispatch<SetStateAction<T>>
  isEditing: boolean
}

export function WindTabContent({
  editData,
  setEditData,
  isEditing
}: WindTabContentProps<MachineInspectionDetailResponseDtoType>) {
  return (
    <div className='flex flex-col gap-8'>
      {!isEditing
        ? editData.windMeasurementResponseDtos.map((info, idx) => (
            <div key={info.windMeasurementId} className='flex-col flex gap-4'>
              {idx !== 0 && <Divider />}
              <div className='flex flex-col gap-1' key={info.windMeasurementId * 2}>
                <span className='ps-1 font-bold'>{info.fanType} 설계값</span>
                <table aria-label={`${info.fanType} 설계값`} style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <th style={{ width: 150 }}>설계 풍량(CMM)</th>
                      <td>{info.designAirVolumeCMM}</td>
                      <th style={{ width: 150 }}>설계 주파수 (Hz)</th>
                      <td>{info.designFrequency}</td>
                    </tr>
                    <tr>
                      <th>설계 회전수 </th>
                      <td>{info.designRpm}</td>
                      <th>설계 극수 (P)</th>
                      <td>{info.designPoles}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='flex flex-col gap-1' key={info.windMeasurementId * 2 + 1}>
                <span className='ps-1 font-bold'>{info.fanType} 풍량 측정 데이터</span>
                <table aria-label={`${info.fanType} 풍량 측정 데이터`} style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <th>FAN 타입</th>
                      <td>{fanTypeOption.find(opt => opt.value === info.fanType)?.label}</td>
                      <th rowSpan={2}>측정수위</th>
                      <th colSpan={3}>풍속 (m/s)</th>
                    </tr>
                    <tr>
                      <th>가로 (m)</th>
                      <td>{info.horizontal}</td>
                      <th>전</th>
                      <th>중</th>
                      <th>후</th>
                    </tr>
                    <tr>
                      <th>세로 (m)</th>
                      <td>{info.vertical}</td>
                      <th>상부</th>
                      <td>{info.topFront}</td>
                      <td>{info.topCenter}</td>
                      <td>{info.topRear}</td>
                    </tr>
                    <tr>
                      <th>측정기준</th>
                      <td>{info.measurementBasis}</td>
                      <th>중앙</th>
                      <td>{info.midFront}</td>
                      <td>{info.midCenter}</td>
                      <td>{info.midRear}</td>
                    </tr>
                    <tr>
                      <th>주파수 (Hz)</th>
                      <td>{info.frequency}</td>
                      <th>하부</th>
                      <td>{info.bottomFront}</td>
                      <td>{info.bottomCenter}</td>
                      <td>{info.bottomRear}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        : editData.windMeasurementResponseDtos.map((info, idx) => (
            <div key={info.windMeasurementId} className='flex-col flex gap-4 [&>div>table>tbody>tr>td]:py-0'>
              {idx !== 0 && <Divider />}
              {/* 설계값 */}
              <div className='flex flex-col gap-1' key={info.windMeasurementId * 2}>
                <span className='ps-1 font-bold'>{info.fanType} 설계값</span>
                <table aria-label={`${info.fanType} 설계값`} style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <th style={{ width: 150 }}>설계 풍량(CMM)</th>
                      <td>
                        {!isEditing ? (
                          info.designAirVolumeCMM
                        ) : (
                          <TextField
                            size='small'
                            value={info.designAirVolumeCMM ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, designAirVolumeCMM: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th style={{ width: 150 }}>설계 주파수 (Hz)</th>
                      <td>
                        {!isEditing ? (
                          info.designFrequency
                        ) : (
                          <TextField
                            size='small'
                            value={info.designFrequency ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, designFrequency: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>설계 회전수</th>
                      <td>
                        {!isEditing ? (
                          info.designRpm
                        ) : (
                          <TextField
                            size='small'
                            value={info.designRpm ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, designRpm: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th>설계 극수 (P)</th>
                      <td>
                        {!isEditing ? (
                          info.designPoles
                        ) : (
                          <TextField
                            size='small'
                            value={info.designPoles ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, designPoles: e.target.value } : w
                                )
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

              {/* 풍량 측정 데이터 */}
              <div className='flex flex-col gap-1' key={info.windMeasurementId * 2 + 1}>
                <span className='ps-1 font-bold'>{info.fanType} 풍량 측정 데이터</span>
                <table aria-label={`${info.fanType} 풍량 측정 데이터`} style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr>
                      <th>FAN 타입</th>
                      <td>
                        {!isEditing ? (
                          info.fanType === 'SA' ? (
                            '급기팬 (SA)'
                          ) : info.fanType === 'RA' ? (
                            '환기팬 (RA)'
                          ) : (
                            info.fanType
                          )
                        ) : (
                          <TextField
                            size='small'
                            select
                            fullWidth
                            value={info.fanType ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, fanType: e.target.value as fanTypeType } : w
                                )
                              }))
                            }
                            variant='standard'
                          >
                            {fanTypeOption.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </td>
                      <th rowSpan={2}>측정수위</th>
                      <th colSpan={3}>풍속 (m/s)</th>
                    </tr>
                    <tr>
                      <th>가로 (m)</th>
                      <td>
                        {!isEditing ? (
                          info.horizontal
                        ) : (
                          <TextField
                            size='small'
                            value={info.horizontal ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, horizontal: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th>전</th>
                      <th>중</th>
                      <th>후</th>
                    </tr>
                    <tr>
                      <th>세로 (m)</th>
                      <td>
                        {!isEditing ? (
                          info.vertical
                        ) : (
                          <TextField
                            size='small'
                            value={info.vertical ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, vertical: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th>상부</th>
                      <td>
                        {!isEditing ? (
                          info.topFront
                        ) : (
                          <TextField
                            size='small'
                            value={info.topFront ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, topFront: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.topCenter
                        ) : (
                          <TextField
                            size='small'
                            value={info.topCenter ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, topCenter: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.topRear
                        ) : (
                          <TextField
                            size='small'
                            value={info.topRear ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, topRear: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>측정기준</th>
                      <td>
                        {!isEditing ? (
                          info.measurementBasis
                        ) : (
                          <TextField
                            size='small'
                            value={info.measurementBasis ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, measurementBasis: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th>중앙</th>
                      <td>
                        {!isEditing ? (
                          info.midFront
                        ) : (
                          <TextField
                            size='small'
                            value={info.midFront ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, midFront: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.midCenter
                        ) : (
                          <TextField
                            size='small'
                            value={info.midCenter ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, midCenter: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.midRear
                        ) : (
                          <TextField
                            size='small'
                            value={info.midRear ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, midRear: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>주파수 (Hz)</th>
                      <td>
                        {!isEditing ? (
                          info.frequency
                        ) : (
                          <TextField
                            size='small'
                            value={info.frequency ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, frequency: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <th>하부</th>
                      <td>
                        {!isEditing ? (
                          info.bottomFront
                        ) : (
                          <TextField
                            size='small'
                            value={info.bottomFront ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, bottomFront: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.bottomCenter
                        ) : (
                          <TextField
                            size='small'
                            value={info.bottomCenter ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, bottomCenter: e.target.value } : w
                                )
                              }))
                            }
                            variant='standard'
                          />
                        )}
                      </td>
                      <td>
                        {!isEditing ? (
                          info.bottomRear
                        ) : (
                          <TextField
                            size='small'
                            value={info.bottomRear ?? ''}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                windMeasurementResponseDtos: prev.windMeasurementResponseDtos.map((w, i) =>
                                  i === idx ? { ...w, bottomRear: e.target.value } : w
                                )
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
          ))}
    </div>
  )
}
