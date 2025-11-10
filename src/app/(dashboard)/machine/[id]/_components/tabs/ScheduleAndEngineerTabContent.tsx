import { useState } from 'react'

import { useParams } from 'next/navigation'

import { Box, Button, IconButton, MenuItem } from '@mui/material'

import type {
  machineProjectEngineerDetailDtoType,
  MachineProjectScheduleAndEngineerResponseDtoType
} from '@/@core/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { InputBox } from '@/@core/components/custom/InputBox'
import {
  MACHINE_PROJECT_ENGINEER_INPUT_INFO,
  MACHINE_SCHEDULE_INPUT_INFO
} from '@/app/_constants/input/MachineInputInfo'
import CustomTextField from '@/@core/components/mui/TextField'
import { gradeOption } from '@/app/_constants/options'
import { MachineProjectEngineerInitialData } from '@/app/_constants/MachineProjectSeed'
import AlertModal from '@/@core/components/custom/AlertModal'
import {
  useGetEngineerList,
  useGetParticipatedEngineerList,
  useGetScheduleTab
} from '@/@core/hooks/customTanstackQueries'
import useMachineIsEditingStore from '@/@core/utils/useMachineIsEditingStore'
import { auth } from '@/lib/auth'

const ScheduleAndEngineerTabContent = ({}: {}) => {
  const params = useParams()
  const machineProjectId = params?.id as string

  const { isEditing, setIsEditing } = useMachineIsEditingStore()

  const { data: scheduleData, refetch: refetchScheduleData } = useGetScheduleTab(machineProjectId)
  const { data: engineerList } = useGetEngineerList()
  const { refetch: refetchParticipatedEngineers } = useGetParticipatedEngineerList(machineProjectId)

  const [editData, setEditData] = useState<MachineProjectScheduleAndEngineerResponseDtoType>(
    JSON.parse(JSON.stringify(scheduleData))
  )

  const [showAlertModal, setShowAlertModal] = useState(false)

  const existChange = JSON.stringify(editData) !== JSON.stringify(scheduleData)

  const engineerMenuOption = engineerList?.map(engineer => {
    return { value: engineer.engineerId, label: `${engineer.engineerName}` }
  })

  // 실제 API 호출 부분 (PUT/PATCH 등)
  const handleSave = async () => {
    try {
      await auth.put(`/api/machine-projects/${machineProjectId}/schedule`, editData)

      await auth.put(`/api/machine-projects/${machineProjectId}/machine-project-engineers`, {
        engineers: editData.engineers.filter(value => value.engineerId > 0)
      })
      refetchParticipatedEngineers()
      const { data: changed } = await refetchScheduleData()

      changed && setEditData(changed)

      handleSuccess('저장되었습니다.')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleEngineerDelete = (idx: number) => {
    setEditData(prev => {
      const prevEngineers = prev?.engineers || []
      const updatedEngineers = prevEngineers.filter((_, i) => i !== idx)

      return {
        ...prev,
        engineers: updatedEngineers
      }
    })
  }

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fafbfc',
        fontSize: 15,
        marginBottom: 16
      }}
    >
      <div>
        {isEditing
          ? editData && (
              <div className='flex flex-col gap-2'>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        점검일정
                      </th>
                      <td colSpan={3} style={{ textAlign: 'right', padding: '10px 12px', gap: '2px' }}>
                        <div className='justify-end flex gap-2'>
                          <Button
                            variant='contained'
                            color='success'
                            type='button'
                            onClick={() => {
                              handleSave()
                              setIsEditing(false)
                            }}
                          >
                            저장
                          </Button>
                          <Button
                            variant='contained'
                            color='secondary'
                            type='button'
                            onClick={() => {
                              if (existChange) {
                                setShowAlertModal(true)
                              } else {
                                setEditData(JSON.parse(JSON.stringify(scheduleData)))
                                setIsEditing(false)
                              }
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.beginDate?.label}
                      </td>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='beginDate'
                          value={editData?.beginDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              beginDate: value
                            }))
                          }
                        />
                      </td>
                      <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.fieldBeginDate?.label}
                      </td>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='fieldBeginDate'
                          value={editData?.fieldBeginDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              fieldBeginDate: value
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.endDate?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='endDate'
                          value={editData?.endDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              endDate: value
                            }))
                          }
                        />
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.fieldEndDate?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='fieldEndDate'
                          value={editData?.fieldEndDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              fieldEndDate: value
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.reportDeadline?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='reportDeadline'
                          value={editData?.reportDeadline ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              reportDeadline: value
                            }))
                          }
                        />
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.projectEndDate?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='projectEndDate'
                          value={editData?.projectEndDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              projectEndDate: value
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.checkType?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='checkType'
                          value={editData?.checkType ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              checkType: value
                            }))
                          }
                        />
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.buildingGrade?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='buildingGrade'
                          value={editData?.buildingGrade ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              buildingGrade: value
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.reportManagerEmail?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='reportManagerEmail'
                          value={editData?.reportManagerEmail ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              reportManagerEmail: value
                            }))
                          }
                        />
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {MACHINE_SCHEDULE_INPUT_INFO.tiIssueDate?.label}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          showLabel={false}
                          tabInfos={MACHINE_SCHEDULE_INPUT_INFO}
                          tabFieldKey='tiIssueDate'
                          value={editData?.tiIssueDate ?? ''}
                          onChange={value =>
                            setEditData(prev => ({
                              ...prev,
                              tiIssueDate: value
                            }))
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className='border-collapse'>
                  <colgroup>
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={7} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        <div className='flex justify-between items-center'>
                          <p>참여기술진</p>
                          <Button
                            size='small'
                            variant='contained'
                            type='button'
                            color='primary'
                            onClick={() => {
                              setEditData(prev => ({
                                ...prev,
                                engineers: [
                                  ...prev.engineers,
                                  {
                                    ...MachineProjectEngineerInitialData,
                                    beginDate: editData.beginDate,
                                    endDate: editData.endDate
                                  }
                                ]
                              }))
                            }}
                          >
                            <i className='tabler-plus' />
                            추가
                          </Button>
                        </div>
                      </th>
                    </tr>
                    <tr className='py-1'>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>성명</th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>등급</th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        수첩발급번호
                      </th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }} colSpan={2}>
                        참여기간
                      </th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>비고</th>
                    </tr>
                    {editData.engineers.map((engineer, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                          {/* 이름을 바꾸면 전체 정보 변경. beginDate, endDate, note 초기화.*/}
                          {/* 이미 선택된 기술진이라면 선택 불가능하도록. */}
                          <CustomTextField
                            select
                            fullWidth
                            value={engineer.engineerId}
                            onChange={e => {
                              const newEngineerInfo = engineerList?.find(
                                eng => eng.engineerId === Number(e.target.value)
                              )

                              const newEngineer: machineProjectEngineerDetailDtoType = {
                                ...MachineProjectEngineerInitialData,
                                beginDate: editData.beginDate,
                                endDate: editData.endDate,
                                ...newEngineerInfo,
                                grade:
                                  gradeOption.find(value => value.label === newEngineerInfo?.gradeDescription)?.value ??
                                  ''
                              }

                              if (newEngineer) {
                                setEditData(prev => {
                                  prev.engineers.splice(idx, 1, newEngineer)

                                  return {
                                    ...editData,
                                    engineers: prev.engineers
                                  }
                                })
                              }
                            }}
                            slotProps={{
                              select: { displayEmpty: true },
                              htmlInput: { name: name }
                            }}
                          >
                            {/* 만약 이미 선택된 기술진이라면 선택 불가 */}
                            {engineerMenuOption?.map(option => (
                              <MenuItem
                                key={option.value}
                                value={option.value}
                                disabled={editData.engineers.map(value => value.engineerId).includes(option.value)}
                              >
                                {option.label}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        </td>
                        <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                          <Box className={'my-[1px] relative text-[15px] p-[6px] '}>
                            <span className='break-normal'>{engineer.gradeDescription}</span>
                          </Box>
                        </td>
                        <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                          <Box className={'my-[1px] relative text-[15px] p-[6px] '}>
                            <span className='break-normal'>{engineer.engineerLicenseNum}</span>
                          </Box>{' '}
                        </td>
                        <td style={{ border: '1px solid #d1d5db' }} className='py-1 px-[6px]'>
                          <InputBox
                            showLabel={false}
                            tabFieldKey='beginDate'
                            value={engineer.beginDate ?? ''}
                            onChange={value => {
                              const newEngineers = editData.engineers

                              newEngineers[idx].beginDate = value
                              setEditData(prev => {
                                return { ...prev, engineers: newEngineers }
                              })
                            }}
                            tabInfos={MACHINE_PROJECT_ENGINEER_INPUT_INFO}
                          />
                        </td>
                        <td style={{ border: '1px solid #d1d5db' }} className='px-[6px]'>
                          <InputBox
                            showLabel={false}
                            tabFieldKey='endDate'
                            value={engineer.endDate ?? ''}
                            onChange={value => {
                              const newEngineers = editData.engineers

                              newEngineers[idx].endDate = value
                              setEditData(prev => {
                                return { ...prev, engineers: newEngineers }
                              })
                            }}
                            tabInfos={MACHINE_PROJECT_ENGINEER_INPUT_INFO}
                          />
                        </td>
                        <td style={{ border: '1px solid #d1d5db' }} className='px-[6px]'>
                          <div className='flex justify-between'>
                            <InputBox
                              showLabel={false}
                              tabFieldKey='note'
                              value={engineer.note ?? ''}
                              onChange={value => {
                                const newEngineers = editData.engineers

                                newEngineers[idx].note = value
                                setEditData(prev => {
                                  return { ...prev, engineers: newEngineers }
                                })
                              }}
                              tabInfos={MACHINE_PROJECT_ENGINEER_INPUT_INFO}
                            />
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => {
                                handleEngineerDelete(idx)
                              }}
                              type='button'
                            >
                              <i className='tabler-x' />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          : scheduleData && (
              <div className='flex flex-col gap-2'>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        점검일정
                      </th>
                      <td colSpan={3} style={{ textAlign: 'right', padding: '10px 12px' }}>
                        <Button
                          type='button'
                          variant='contained'
                          color='success'
                          onClick={() => {
                            setIsEditing(true)
                          }}
                        >
                          수정
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        투입시작
                      </td>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.beginDate}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        현장점검시작
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.fieldBeginDate}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        투입종료
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.endDate}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        현장점검종료
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.fieldEndDate}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        보고서마감일
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.reportDeadline}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        프로젝트종료
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.projectEndDate}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        점검종류
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.checkTypeDescription}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        건물등급
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.buildingGradeDescription}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자 이메일
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.reportManagerEmail}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계산서 발급일
                      </th>
                      <td style={{ padding: '10px 12px' }}>{scheduleData.tiIssueDate}</td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                    <col style={{ width: '16.6%' }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={6} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        참여기술진
                      </th>
                    </tr>
                    <tr className='py-1'>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>성명</th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>등급</th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        수첩발급번호
                      </th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }} colSpan={2}>
                        참여기간
                      </th>
                      <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>비고</th>
                    </tr>
                    {(scheduleData.engineers || []).map((eng, idx) => (
                      <tr key={eng.engineerId || idx}>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.engineerName}</p>
                        </td>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.gradeDescription}</p>
                        </td>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.engineerLicenseNum}</p>
                        </td>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.beginDate}</p>
                        </td>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.endDate}</p>
                        </td>
                        <td style={{ padding: '13px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{eng.note}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
      {showAlertModal && scheduleData && (
        <AlertModal<MachineProjectScheduleAndEngineerResponseDtoType>
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          setEditData={setEditData}
          setIsEditing={setIsEditing}
          originalData={scheduleData}
        />
      )}
    </div>
  )
}

export default ScheduleAndEngineerTabContent
