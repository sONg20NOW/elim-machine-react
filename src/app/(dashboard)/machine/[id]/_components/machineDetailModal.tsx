'use client'

// React Imports
import { useCallback, useContext, useEffect, useState } from 'react'

import { Button, Typography, Tooltip, Tab, Divider, TextField } from '@mui/material'
import axios from 'axios'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import InspectionDetailModal from './insepctionDetailModal'
import { EngineerOptionContext } from '../page'
import type { MachineInspectionDetailResponseDtoType, machineProjectEngineerDetailDtoType } from '@/app/_type/types'
import DefaultModal from '@/app/_components/DefaultModal'
import { handleApiError } from '@/utils/errorHandler'

// style
import styles from '@/app/_style/Table.module.css'
import { picCateInspectionStatusOption } from '@/app/_constants/options'

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
  selectedMachine: MachineInspectionDetailResponseDtoType
}

const MachineDetailModal = ({ machineProjectId, open, setOpen, selectedMachine }: EditUserInfoProps) => {
  const engineerOption = useContext(EngineerOptionContext)

  // 데이터
  const [unChangedData, setUnChangedData] = useState<MachineInspectionDetailResponseDtoType>(selectedMachine)

  // 수정 시 변경되는 데이터 (저장되기 전)
  const [machineInfo, setMachineInfo] = useState(selectedMachine.machineInspectionResponseDto)
  const [picCates, setPicCates] = useState(selectedMachine.picCates)
  const [gasInfo, setGasInfo] = useState(selectedMachine.gasMeasurementResponseDto)
  const [windInfo, setWindInfo] = useState(selectedMachine.windMeasurementResponseDtos)
  const [pipeInfo, setPipeInfo] = useState(selectedMachine.pipeMeasurementResponseDtos)
  const [engineerIds, setEngineerIds] = useState(selectedMachine.engineerIds)

  // 성능점검표 모달
  const [openPicModal, setOpenPicModal] = useState<boolean>(false)
  const [clickedPicCate, setClickedPicCate] = useState<any>(null)

  // 탭
  const [tabValue, setTabValue] = useState('BASIC')
  const thisTabInfo = TabInfo[selectedMachine.checklistExtensionType]

  // 참여기술진 목록
  const [participatedEngineers, setParticipatedEngineers] = useState<machineProjectEngineerDetailDtoType[]>([])

  const [isEditing, setIsEditing] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  // 사진 업로드 후 데이터 새로고침 함수
  const handlePhotoUploadSuccess = async () => {
    if (!selectedMachine || !selectedMachine.machineInspectionResponseDto.id) return

    try {
      const response = await axios.get<{ data: MachineInspectionDetailResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-inspections/${selectedMachine.machineInspectionResponseDto.id}`
      )

      setUnChangedData(response.data.data)
      console.log('Data refreshed after photo upload - 점검결과 즉시 업데이트됨')
    } catch (error) {
      handleApiError(error)
    }
  }

  // 참여기술진 목록 가져오기
  const getParticipatedEngineers = useCallback(async () => {
    try {
      const response = await axios.get<{
        data: { machineProjectEngineerResponseDtos: machineProjectEngineerDetailDtoType[] }
      }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}/machine-project-engineers`
      )

      setParticipatedEngineers(response.data.data.machineProjectEngineerResponseDtos)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId])

  useEffect(() => {
    getParticipatedEngineers()
  }, [getParticipatedEngineers])

  // 저장 시 각 탭에 따라 다르게 동작 (! 기본 정보 수정 시 )
  const handleSave = useCallback(async () => {
    try {
      let postURL = ''

      switch (tabValue) {
        case 'BASIC':
          postURL = ''
          break
        case 'PIC':
          postURL = ''
          break
        case 'GAS':
          postURL = '/gasMeasurement'
          break
        case 'WIND':
          postURL
          break
        case 'PIPE':
          break

        default:
          break
      }

      const response = axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}${postURL}`
      )
    } catch (error) {
      handleApiError(error)
    }
  }, [])

  return (
    machineInfo && (
      <DefaultModal
        modifyButton={
          <Button variant='contained' color='error'>
            삭제
          </Button>
        }
        value={tabValue}
        open={open}
        setOpen={setOpen}
        title={`${unChangedData.machineInspectionResponseDto.machineInspectionName || ''}   성능점검표`}
        primaryButton={
          <div style={{ display: 'flex', gap: 1 }}>
            <Button variant='contained' color='primary' onClick={() => setIsEditing(prev => !prev)}>
              {!isEditing ? '수정' : '저장'}
            </Button>

            <Button variant='contained' color='secondary' onClick={handleClose}>
              닫기
            </Button>
          </div>
        }
      >
        <div className={styles.container}>
          <TabList
            className='relative'
            onChange={(event, newValue) => {
              // if (existChange) {
              //   setShowAlertModal(true)
              // } else {
              //   setValue(newValue)
              // }
              setTabValue(newValue)
            }}
          >
            {unChangedData.checklistExtensionType === 'NONE'
              ? null
              : thisTabInfo.map(tab => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
            {}
            <div className='flex gap-2 absolute right-0'>
              <Button variant='contained' color='info'>
                갤러리 ({picCates.reduce((sum, cate) => (sum += cate.totalMachinePicCount), 0)})
              </Button>
              <Button variant='contained' color='success'>
                보고서
              </Button>
            </div>
          </TabList>
          <TabPanel value={'BASIC'}>
            <div className='flex flex-col gap-5'>
              <table style={{ tableLayout: 'fixed' }}>
                <tbody>
                  <tr>
                    <th>설비명</th>
                    <td colSpan={2}>
                      {!isEditing ? (
                        machineInfo.machineInspectionName
                      ) : (
                        <TextField
                          size='small'
                          slotProps={{
                            htmlInput: { sx: { padding: 0 } }
                          }}
                          value={machineInfo.machineInspectionName}
                          onChange={e => setMachineInfo(prev => ({ ...prev, machineInspectionName: e.target.value }))}
                          variant='standard'
                        />
                      )}
                    </td>
                    <th>설치일</th>
                    <td colSpan={2}>{machineInfo.installedDate}</td>
                  </tr>
                  <tr>
                    <th>종류</th>
                    <td colSpan={2}>{machineInfo.machineCateName}</td>
                    <th>점검일</th>
                    <td colSpan={2}>{machineInfo.checkDate}</td>
                  </tr>
                  <tr>
                    <th>용도</th>
                    <td colSpan={2}>{machineInfo.purpose}</td>
                    <th>위치</th>
                    <td colSpan={2}>{machineInfo.location}</td>
                  </tr>
                </tbody>
              </table>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>이름 / 등급</th>
                    <th>라이선스번호</th>

                    <th>투입기간</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {(unChangedData.engineerIds || []).map((id, idx) => {
                    const engineer = participatedEngineers.find(value => value.engineerId === id)

                    return (
                      <tr key={idx}>
                        <th>점검자 {idx + 1}</th>
                        <td>{`${engineer?.engineerName} [${engineer?.gradeDescription}]`}</td>
                        <td>{`${engineer?.engineerLicenseNum}`}</td>
                        <td>{`${engineer?.beginDate} ~ ${engineer?.endDate}`}</td>
                        <td>{`${engineer?.note ?? ''}`}</td>
                      </tr>
                    )
                  })}
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
                {picCates.map((cate, idx) => {
                  return (
                    <tr key={cate.machinePicCateId}>
                      {idx === 0 && (
                        <th rowSpan={picCates.length} style={{ verticalAlign: 'top' }}>
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
                          title={cate.subCates.map((subCate, index) => (
                            <Typography sx={{ bgcolor: 'white' }} key={index}>
                              {index + 1}. {subCate.subCateName}
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
                            {idx + 1}. {cate.machinePicCateName}
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
                <tr>
                  <th>비고</th>
                  <td colSpan={2} rowSpan={4}>
                    {machineInfo.remark ?? '　'}
                  </td>
                </tr>
              </tbody>
            </table>
          </TabPanel>
          {gasInfo && (
            <TabPanel value={'GAS'}>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1'>
                  <span className='ps-1 font-bold'>종류 및 용량</span>
                  <table aria-label='종류 및 용량' style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      <tr>
                        <th style={{ width: 80 }}>연료</th>
                        <td>{gasInfo.fuelType}</td>
                        <th style={{ width: 100 }}>보일러용량</th>
                        <td>{gasInfo.capacity}</td>
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
                        <td>{gasInfo.o2}</td>
                        <th>CO</th>
                        <td>{gasInfo.co}</td>
                      </tr>
                      <tr>
                        <th>XAir</th>
                        <td>{gasInfo.xair}</td>
                        <th>CO₂ Ratio</th>
                        <td>{gasInfo.co2Ratio}</td>
                      </tr>
                      <tr>
                        <th>Eff.</th>
                        <td>{gasInfo.eff}</td>
                        <th>NO</th>
                        <td>{gasInfo.no}</td>
                      </tr>
                      <tr>
                        <td style={{ borderLeft: 'none', borderBottom: 'none' }} colSpan={2}></td>
                        <th>NOx</th>
                        <td>{gasInfo.nox}</td>
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
                        <td>{gasInfo.standardUsage ?? '　'}</td>
                        <td>{gasInfo.startTime}</td>
                        <td>{gasInfo.startMeterValue}</td>
                        <td>{gasInfo.endTime}</td>
                        <td>{gasInfo.endMeterValue}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPanel>
          )}
          {windInfo && (
            <TabPanel value={'WIND'}>
              <div className='flex flex-col gap-8'>
                {windInfo.map((info, idx) => (
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
          {pipeInfo && (
            <TabPanel value={'PIPE'}>
              <div className='flex-col flex gap-5'>
                {pipeInfo.map((info, idx) => (
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
          inspectionData={unChangedData}
          clickedPicCate={clickedPicCate}
          onPhotoUploadSuccess={handlePhotoUploadSuccess}
        />
      </DefaultModal>
    )
  )
}

export default MachineDetailModal
