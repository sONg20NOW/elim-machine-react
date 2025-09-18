'use client'

// React Imports
import { useCallback, useContext, useEffect, useState } from 'react'

import { Button, Typography, Tooltip, Tab, Divider, TextField, Card, MenuItem } from '@mui/material'
import axios from 'axios'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import InspectionDetailModal from './insepctionDetailModal'
import type { MachineInspectionDetailResponseDtoType } from '@/app/_type/types'
import DefaultModal from '@/app/_components/modal/DefaultModal'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

// style
import styles from '@/app/_style/Table.module.css'
import { picCateInspectionStatusOption } from '@/app/_constants/options'
import DisabledTabWithTooltip from '@/app/_components/DisabledTabWithTooltip'
import AlertModal from '@/app/_components/modal/AlertModal'
import { ParticipatedEngineersContext } from './machineContent'

const TabInfo: Record<
  MachineInspectionDetailResponseDtoType['checklistExtensionType'],
  { value: string; label: string }[]
> = {
  NONE: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용사진' }
  ],
  GAS_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용사진' },
    { value: 'GAS', label: '가스점검내용' }
  ],
  WIND_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용사진' },
    { value: 'WIND', label: '풍량점검내용' }
  ],
  WIND_MEASUREMENT_SA_RA: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용사진' },
    { value: 'WIND', label: '풍량점검내용' }
  ],
  PIPE_MEASUREMENT: [
    { value: 'BASIC', label: '기본정보' },
    { value: 'PIC', label: '점검내용사진' },
    { value: 'PIPE', label: '배관점검내용' }
  ]
}

type EditUserInfoProps = {
  machineProjectId: string
  open: boolean
  setOpen: (open: boolean) => void
  selectedMachineData: MachineInspectionDetailResponseDtoType
  reloadData: () => Promise<void>
}

const MachineDetailModal = ({
  machineProjectId,
  open,
  setOpen,
  selectedMachineData,
  reloadData
}: EditUserInfoProps) => {
  const participatedEngineers = useContext(ParticipatedEngineersContext)

  // 수정 시 변경되는 데이터 (저장되기 전) - 깊은 복사
  const [editData, setEditData] = useState<MachineInspectionDetailResponseDtoType>(
    JSON.parse(JSON.stringify(selectedMachineData))
  )

  // 성능점검표 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<any>(null)

  const [showAlertModal, setShowAlertModal] = useState(false)

  // 탭
  const [tabValue, setTabValue] = useState('BASIC')
  const thisTabInfo = TabInfo[selectedMachineData.checklistExtensionType]

  // 참여기술진 목록

  const [isEditing, setIsEditing] = useState(false)

  // 저장되었을 경우 최신화
  useEffect(() => setEditData(JSON.parse(JSON.stringify(selectedMachineData))), [selectedMachineData])

  const existChange =
    JSON.stringify(selectedMachineData) !==
    JSON.stringify({ ...editData, engineerIds: editData.engineerIds.filter(id => id > 0) })

  const handleLeaveWithoutSave = () => {
    if (existChange) {
      setEditData(JSON.parse(JSON.stringify(selectedMachineData)))
    }
  }

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  const handleSave = useCallback(async () => {
    if (existChange) {
      // 1. POST를 보내고
      try {
        let postURL = ''
        let requestBody = ''

        switch (tabValue) {
          case 'BASIC':
            postURL = ''
            requestBody = JSON.stringify(editData.machineInspectionResponseDto)
            break

          // ! 미흡사항 수정, 점검결과 수정
          // case 'PIC':
          //   postURL = ''
          //   requestBody = JSON.stringify(editData.picCates)
          //   break
          case 'GAS':
            postURL = '/gasMeasurements'
            requestBody = JSON.stringify(editData.gasMeasurementResponseDto)
            break
          case 'WIND':
            postURL = '/windMeasurements'
            requestBody = JSON.stringify({ windMeasurementUpdateRequestDtos: editData.windMeasurementResponseDtos })
            break
          case 'PIPE':
            postURL = '/pipeMeasurements'
            requestBody = JSON.stringify({ pipeMeasurementUpdateRequestDtos: editData.pipeMeasurementResponseDtos })
            break
          default:
            break
        }

        if (requestBody !== '') {
          await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}${postURL}`,
            JSON.parse(requestBody)
          )

          // tabValue가 BASIC이라면 참여기술진 변경사항도 POST.
          if (
            tabValue === 'BASIC' &&
            JSON.stringify(editData.engineerIds.filter(id => id > 0)) !==
              JSON.stringify(selectedMachineData.engineerIds)
          ) {
            await axios.put<{ data: { engineerIds: number[] } }>(
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachineData.machineInspectionResponseDto.id}/machine-inspection-engineers`,
              { engineerIds: editData.engineerIds.filter(id => id > 0) }
            )
          }
        } else {
          throw new Error()
        }

        // 2. 리스트 데이터를 새로 받기.
        await reloadData()
        handleSuccess(`${thisTabInfo.find(tabInfo => tabInfo.value === tabValue)?.label ?? ''}가 수정되었습니다.`)
      } catch (error) {
        handleApiError(error)
      }
    }

    setIsEditing(prev => !prev)
  }, [editData, existChange, machineProjectId, reloadData, selectedMachineData, tabValue, thisTabInfo])

  return (
    selectedMachineData && (
      <DefaultModal
        modifyButton={
          <Button variant='contained' color='error'>
            삭제
          </Button>
        }
        value={tabValue}
        open={open}
        setOpen={setOpen}
        title={`${selectedMachineData.machineInspectionResponseDto.machineInspectionName || ''}   성능점검표`}
        primaryButton={
          <div style={{ display: 'flex', gap: 1 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(prev => !prev)
                } else {
                  handleSave()
                }
              }}
            >
              {!isEditing ? '수정' : '저장'}
            </Button>

            {isEditing && (
              <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                  if (existChange) {
                    setShowAlertModal(true)
                  } else {
                    setIsEditing(false)
                    setEditData(prev => ({ ...prev, engineerIds: prev.engineerIds.filter(id => id > 0) }))
                  }
                }}
              >
                취소
              </Button>
            )}
          </div>
        }
      >
        <div className={`${styles.container} relative`}>
          <TabList
            onChange={(event, newValue) => {
              if (existChange) {
                setShowAlertModal(true)
              } else {
                setTabValue(newValue)
              }
            }}
          >
            {selectedMachineData.checklistExtensionType === 'NONE'
              ? null
              : thisTabInfo.map(tab =>
                  existChange && tabValue !== tab.value ? (
                    <DisabledTabWithTooltip key={tab.value} value={tab.value} label={tab.label} />
                  ) : (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                  )
                )}
          </TabList>
          <div className='flex gap-2 absolute right-0 top-0'>
            <Button variant='contained' color='info'>
              갤러리 ({editData.picCates.reduce((sum, cate) => (sum += cate.totalMachinePicCount), 0)})
            </Button>
            <Button variant='contained' color='success'>
              보고서
            </Button>
          </div>
          <TabPanel value={'BASIC'}>
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
                          value={editData.machineInspectionResponseDto.installedDate}
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
                          value={editData.machineInspectionResponseDto.checkDate}
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
                                value={engineer?.engineerId ?? -1}
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
                            onClick={() =>
                              setEditData(prev => ({ ...prev, engineerIds: editData.engineerIds.concat(0) }))
                            }
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
                    <td colSpan={8} height={100}>
                      {!isEditing ? (
                        editData.machineInspectionResponseDto.remark
                      ) : (
                        <TextField
                          slotProps={{ input: { sx: { height: '100%' } } }}
                          fullWidth
                          multiline
                          value={editData.machineInspectionResponseDto.remark}
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
          </TabPanel>
          <TabPanel value={'PIC'}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 100 }}></th>
                  <th>점검내용</th>
                  <th style={{ width: 80 }}>점검결과</th>
                </tr>
              </thead>
              <tbody>
                {editData.picCates.map((cate, idx) => {
                  return (
                    <tr key={cate.machineChecklistItemId}>
                      {idx === 0 && (
                        <th rowSpan={editData.picCates.length} style={{ verticalAlign: 'top' }}>
                          점검항목
                        </th>
                      )}
                      <td
                        style={{ verticalAlign: 'top', cursor: 'pointer' }}
                        onClick={() => {
                          setOpenPicModal(true)
                          setClickedPicCate(cate)
                        }}
                      >
                        <Tooltip
                          slotProps={{
                            tooltip: {
                              sx: {
                                bgcolor: 'white',
                                border: '1px solid black'
                              }
                            }
                          }}
                          arrow
                          placement='right'
                          title={cate.checklistSubItems.map((subCate, index) => (
                            <Typography sx={{ bgcolor: 'white' }} key={index}>
                              {index + 1}. {subCate.checklistSubItemName}
                              <Typography component={'span'} color='primary.main'>
                                {subCate.machinePicCount ? ` (${subCate.machinePicCount})` : ''}
                              </Typography>
                            </Typography>
                          ))}
                        >
                          <Typography
                            key={idx}
                            sx={{
                              '&:hover': {
                                textDecoration: 'underline'
                              },
                              width: 'fit-content'
                            }}
                          >
                            {idx + 1}. {cate.machineChecklistItemName}
                            <Typography component={'span'} color='primary.main'>
                              {cate.totalMachinePicCount ? ` (${cate.totalMachinePicCount})` : ''}
                            </Typography>
                          </Typography>
                        </Tooltip>
                      </td>
                      <td
                        style={{
                          textAlign: 'center'
                        }}
                      >
                        {
                          picCateInspectionStatusOption.find(value => value.value === cate.picCateInspectionStatus)
                            ?.label
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TabPanel>
          {editData.gasMeasurementResponseDto && (
            <TabPanel value={'GAS'}>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1'>
                  <span className='ps-1 font-bold'>종류 및 용량</span>
                  <table aria-label='종류 및 용량' style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      <tr>
                        <th style={{ width: 80 }}>연료</th>
                        <td>{editData.gasMeasurementResponseDto.fuelType}</td>
                        <th style={{ width: 100 }}>보일러용량</th>
                        <td>{editData.gasMeasurementResponseDto.capacity}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
            </TabPanel>
          )}
          {editData.windMeasurementResponseDtos && (
            <TabPanel value={'WIND'}>
              <div className='flex flex-col gap-8'>
                {editData.windMeasurementResponseDtos.map((info, idx) => (
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
                            <td>{info.fanType === 'SA' ? '급기팬 (SA)' : info.fanType === 'RA' && '환기팬 (RA)'}</td>
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
                ))}
              </div>
            </TabPanel>
          )}
          {editData.pipeMeasurementResponseDtos && (
            <TabPanel value={'PIPE'}>
              <div className='flex-col flex gap-5'>
                {editData.pipeMeasurementResponseDtos.map((info, idx) => (
                  <div key={idx} className='flex-col flex gap-4'>
                    {idx !== 0 && <Divider />}
                    <div className='flex flex-col gap-1'>
                      <span className='ps-1 font-bold'>배관 두께 측정 {idx + 1}</span>
                      <table aria-label={`배관 두께 측정 ${idx + 1}`} style={{ tableLayout: 'fixed' }}>
                        <tbody>
                          <tr>
                            <th>배관종류</th>
                            <td colSpan={2}>{info.pipeType}</td>
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
                ))}
              </div>
            </TabPanel>
          )}
        </div>
        <InspectionDetailModal
          machineProjectId={machineProjectId}
          open={openPicModal}
          setOpen={setOpenPicModal}
          inspectionData={selectedMachineData}
          clickedPicCate={clickedPicCate}
          onPhotoUploadSuccess={reloadData}
        />
        {showAlertModal && (
          <AlertModal<MachineInspectionDetailResponseDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            setIsEditing={setIsEditing}
            originalData={selectedMachineData}
          />
        )}
      </DefaultModal>
    )
  )
}

export default MachineDetailModal
