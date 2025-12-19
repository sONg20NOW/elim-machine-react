import { useCallback, useContext, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material'

import { IconPlus, IconX } from '@tabler/icons-react'

import { useForm } from 'react-hook-form'

import classNames from 'classnames'

import dayjs from 'dayjs'

import type {
  MachineProjectScheduleUpdateResponseDtoType,
  SafetyProjectEngineerDetailResponseDtoType,
  SafetyProjectScheduleAndEngineerResponseDtoType
} from '@core/types'
import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import { gradeOption } from '@/@core/data/options'
import {
  useGetEngineersOptions,
  useGetSafetyProjectScheduleTab,
  useMutateSafetyProjectEngineers
} from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import isEditingContext from '../../isEditingContext'
import styles from '@core/styles/customTable.module.css'
import TextFieldTd from '@/@core/components/elim-inputbox/TextFieldTd'

// 참여기술진 추가 시 사용되는 더미 데이터
const SafetyProjectEngineerInitialData: SafetyProjectEngineerDetailResponseDtoType = {
  engineerId: 0,
  engineerName: '',
  grade: '',
  gradeDescription: '',
  engineerLicenseNum: '',
  beginDate: '',
  endDate: '',
  note: ''
}

const ScheduleAndEngineerTabContent = () => {
  const params = useParams()
  const safetyProjectId = params?.id as string

  const { isEditing, setIsEditing } = useContext(isEditingContext)!

  const { data: scheduleEngineerData, refetch: refetchScheduleData } = useGetSafetyProjectScheduleTab(safetyProjectId)
  const { mutateAsync: mutateAsyncEngineers } = useMutateSafetyProjectEngineers(safetyProjectId)

  const { engineers: engineersData, ...rest } = scheduleEngineerData!

  const scheduleForm = useForm<Omit<SafetyProjectScheduleAndEngineerResponseDtoType, 'engineers'>>({
    defaultValues: rest
  })

  const [engineers, setEngineers] = useState(engineersData)

  const isDirtyEngineers = JSON.stringify(engineers?.filter(v => v.engineerId !== 0)) !== JSON.stringify(engineersData)

  const isDirtySchedule = scheduleForm.formState.isDirty

  const isDirty = isDirtySchedule || isDirtyEngineers

  const watchedBeginDate = scheduleForm.watch('beginDate')
  const watchedEndDate = scheduleForm.watch('endDate')

  const [showAlertModal, setShowAlertModal] = useState(false)

  const { data: engineerList } = useGetEngineersOptions('SAFETY')

  const engineerOption = engineerList?.map(v => ({
    label: `${v.engineerName} [${v.gradeDescription}]`,
    value: v.engineerId
  }))

  const [loading, setLoading] = useState(false)

  // 실제 API 호출 부분 (PUT/PATCH 등)
  const handleSave = async () => {
    const message: string[] = []

    setLoading(true)

    try {
      // 참여기술진 수정
      if (isDirtyEngineers) {
        const response = await mutateAsyncEngineers(
          engineers
            ?.filter(v => v.engineerId !== 0)
            .map(v => {
              const { engineerId, beginDate, endDate, note } = v

              return { engineerId, beginDate, endDate, note }
            })
        )

        setEngineers(response)

        message.push('참여기술진')
      }

      if (isDirtySchedule) {
        await scheduleForm.handleSubmit(async data => {
          const scheduleResponse = await auth
            .put<{
              data: MachineProjectScheduleUpdateResponseDtoType
            }>(`/api/machine-projects/${safetyProjectId}/schedule`, data)
            .then(v => v.data.data)

          scheduleForm.reset(scheduleResponse)
          refetchScheduleData()
          message.push('점검일정')
        })()
      }

      setIsEditing(false)
    } catch (error) {
      handleApiError(error)
    }

    if (message.length > 0) {
      handleSuccess(`${message.join(', ')}이 수정되었습니다.`)
    }

    setLoading(false)
  }

  const handleAppendEngineer = () => {
    const firstEngineer = engineers?.[0]

    const skeletonEngineer: SafetyProjectEngineerDetailResponseDtoType = {
      engineerId: 0,
      engineerName: '',
      grade: '',
      gradeDescription: '',
      engineerLicenseNum: '',
      beginDate: watchedBeginDate ?? firstEngineer?.beginDate,
      endDate: watchedEndDate ?? firstEngineer?.endDate,
      note: ''
    }

    setEngineers(prev => prev && prev.concat(skeletonEngineer))
  }

  const handleRejectEngineer = (idx: number) => {
    setEngineers(prev => prev && prev.filter((v, v_idx) => v_idx !== idx))
  }

  const handleDontSave = useCallback(() => {
    scheduleForm.reset()
    setEngineers(engineersData)
    setIsEditing(false)
    setShowAlertModal(false)
  }, [setIsEditing, scheduleForm, engineersData])

  return (
    <form onSubmit={handleSave} className='h-full flex flex-col max-w-[890px]'>
      <div className='justify-end flex mb-4 gap-2 items-end'>
        {!isEditing ? (
          <Button
            type='button'
            variant='contained'
            color='primary'
            onClick={() => {
              setIsEditing(true)
            }}
          >
            수정
          </Button>
        ) : (
          <>
            {!isDirty && (
              <Typography variant='caption' color='warning.main'>
                변경사항이 없습니다
              </Typography>
            )}
            <Button
              variant='contained'
              color='success'
              type='button'
              onClick={() => {
                handleSave()
              }}
              disabled={loading || !isDirty}
            >
              저장
            </Button>
            <Button
              variant='contained'
              color='secondary'
              type='button'
              onClick={() => {
                if (isDirty) {
                  setShowAlertModal(true)
                } else {
                  setIsEditing(false)
                }
              }}
            >
              취소
            </Button>
          </>
        )}
      </div>

      {isEditing ? (
        <div className={classNames('flex flex-col gap-2', styles.container)}>
          <table style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '32%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '32%' }} />
            </colgroup>
            <tbody>
              <tr>
                <th colSpan={4} style={{ padding: '10px 12px', fontWeight: 600 }}>
                  <div className='flex justify-between items-center'>
                    <Typography variant='inherit'>점검일정</Typography>
                  </div>
                </th>
              </tr>
              <tr>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>투입시작일</th>
                <TextFieldTd form={scheduleForm} name='beginDate' type='date' />
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>현장점검 시작일</th>
                <TextFieldTd form={scheduleForm} name='fieldBeginDate' type='date' />
              </tr>
              <tr>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>투입종료일</th>
                <TextFieldTd form={scheduleForm} name='endDate' type='date' />
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>현장점검 종료일</th>
                <TextFieldTd form={scheduleForm} name='fieldEndDate' type='date' />
              </tr>
              <tr>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>보고서 마감일</th>
                <TextFieldTd form={scheduleForm} name='reportDeadline' type='date' />
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>프로젝트 종료일</th>
                <TextFieldTd form={scheduleForm} name='projectEndDate' type='date' />
              </tr>
              <tr>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>담당자 이메일</th>
                <TextFieldTd type='email' form={scheduleForm} name='reportManagerEmail' />

                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'left' }}>계산서 발급일</th>
                <TextFieldTd form={scheduleForm} name='tiIssueDate' type='date' />
              </tr>
            </tbody>
          </table>
          <table style={{ tableLayout: 'fixed' }}>
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
                  <div className='flex justify-between items-center'>
                    <Typography variant='inherit'>참여기술진</Typography>
                    <IconButton onClick={handleAppendEngineer} className='bg-blue-400 text-white hover:bg-blue-500'>
                      <IconPlus />
                    </IconButton>
                  </div>
                </th>
              </tr>
              <tr className='py-1'>
                <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>성명</th>
                <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>등급</th>
                <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>수첩발급번호</th>
                <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }} colSpan={2}>
                  참여기간
                </th>
                <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>비고</th>
              </tr>
              {engineers && engineers.length > 0 ? (
                <>
                  {engineers.map((engineer, idx) => (
                    <tr key={idx}>
                      <td className='p-0'>
                        <Select
                          size='small'
                          fullWidth
                          value={engineer.engineerId}
                          onChange={e => {
                            const newEngineerInfo = engineerList?.find(
                              engineer => engineer.engineerId === Number(e.target.value)
                            )

                            const newEngineer: SafetyProjectEngineerDetailResponseDtoType = {
                              ...SafetyProjectEngineerInitialData,
                              beginDate: watchedBeginDate,
                              endDate: watchedEndDate,
                              ...newEngineerInfo,
                              grade:
                                gradeOption.find(value => value.label === newEngineerInfo?.gradeDescription)?.value ??
                                ''
                            }

                            if (newEngineer) {
                              setEngineers(prev => prev && prev.map((w, w_idx) => (w_idx === idx ? newEngineer : w)))
                            }
                          }}
                          displayEmpty
                          renderValue={value => (
                            <Typography variant='inherit'>
                              {engineerList?.find(v => v.engineerId === value)?.engineerName ?? '-'}
                            </Typography>
                          )}
                          sx={{ '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } }}
                        >
                          {/* 만약 이미 선택된 기술진이라면 선택 불가 */}
                          {engineerOption?.map(option => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              disabled={engineers.map(value => value.engineerId).includes(option.value)}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </td>
                      <td>{engineer.gradeDescription}</td>
                      <td>{engineer.engineerLicenseNum}</td>
                      <td className='p-0'>
                        <TextField
                          disabled={engineer.engineerId === 0}
                          type='date'
                          size='small'
                          value={engineer.beginDate}
                          onChange={e => {
                            setEngineers(
                              prev =>
                                prev &&
                                prev.map((w, w_idx) => (w_idx === idx ? { ...w, beginDate: e.target.value } : w))
                            )
                          }}
                          fullWidth
                          slotProps={{
                            input: { sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } } },
                            htmlInput: { max: '2999-12-31' }
                          }}
                        />
                      </td>
                      <td className='p-0'>
                        <TextField
                          disabled={engineer.engineerId === 0}
                          type='date'
                          size='small'
                          value={engineer.endDate}
                          onChange={e => {
                            setEngineers(
                              prev =>
                                prev && prev.map((w, w_idx) => (w_idx === idx ? { ...w, endDate: e.target.value } : w))
                            )
                          }}
                          fullWidth
                          slotProps={{
                            input: { sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } } },
                            htmlInput: { max: '2999-12-31' }
                          }}
                        />
                      </td>
                      <td className='p-0 relative'>
                        <TextField
                          disabled={engineer.engineerId === 0}
                          size='small'
                          value={engineer.note}
                          onChange={e => {
                            setEngineers(
                              prev =>
                                prev && prev.map((w, w_idx) => (w_idx === idx ? { ...w, note: e.target.value } : w))
                            )
                          }}
                          fullWidth
                          slotProps={{
                            input: { sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } } },
                            htmlInput: { max: '2999-12-31' }
                          }}
                        />
                        <IconButton
                          onClick={() => handleRejectEngineer(idx)}
                          sx={{ color: 'red' }}
                          size='small'
                          className='absolute right-0 translate-x-full top-0'
                        >
                          <IconX />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={6} align='center'>
                    <Typography color='warning.main' sx={{ p: 2 }}>
                      해당 기계설비현장에 참여 중인 기술진이 없습니다
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        scheduleEngineerData && (
          <div className={'flex flex-col gap-2'}>
            <table
              style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid lightgray', borderRadius: 4 }}
            >
              <colgroup>
                <col style={{ width: '18%' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '32%' }} />
              </colgroup>
              <tbody>
                <tr style={{ background: '#f3f4f6' }}>
                  <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검일정
                  </th>
                </tr>
                {/* 투입 시작일, 현장점검 시작일 */}
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    투입 시작일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.beginDate ? dayjs(scheduleEngineerData.beginDate).format('YYYY-MM-DD') : '-'}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검 시작일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.fieldBeginDate
                      ? dayjs(scheduleEngineerData.fieldBeginDate).format('YYYY-MM-DD')
                      : '-'}
                  </td>
                </tr>

                {/* 투입 종료일, 현장점검 종료일 */}
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    투입 종료일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.endDate ? dayjs(scheduleEngineerData.endDate).format('YYYY-MM-DD') : '-'}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검 종료일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.fieldEndDate
                      ? dayjs(scheduleEngineerData.fieldEndDate).format('YYYY-MM-DD')
                      : '-'}
                  </td>
                </tr>

                {/* 보고서 마감일, 프로젝트 종료일 */}
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    보고서 마감일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.reportDeadline
                      ? dayjs(scheduleEngineerData.reportDeadline).format('YYYY-MM-DD')
                      : '-'}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    프로젝트 종료일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.projectEndDate
                      ? dayjs(scheduleEngineerData.projectEndDate).format('YYYY-MM-DD')
                      : '-'}
                  </td>
                </tr>

                {/* 담당자 이메일, 계산서 발급일 */}
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자 이메일
                  </th>
                  <td style={{ padding: '10px 12px' }}>{scheduleEngineerData.reportManagerEmail || '-'}</td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계산서 발급일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {scheduleEngineerData.tiIssueDate
                      ? dayjs(scheduleEngineerData.tiIssueDate).format('YYYY-MM-DD')
                      : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                border: '1px solid lightgray'
              }}
            >
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
                  <th colSpan={6} align='left' style={{ padding: '20px 12px', fontWeight: 600 }}>
                    참여기술진
                  </th>
                </tr>
                {(engineersData?.length ?? 0 > 0) ? (
                  <>
                    <tr className='py-1' style={{ background: '#f3f4f6' }}>
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
                    {(engineersData ?? []).map((engineer, idx) => (
                      <tr key={engineer.engineerId || idx}>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{engineer.engineerName}</p>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{engineer.gradeDescription}</p>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{engineer.engineerLicenseNum}</p>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{engineer.beginDate}</p>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <p>{engineer.endDate}</p>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                          <div>
                            <p>{engineer.note}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className='grid place-items-center p-4'>
                        <Typography color='warning.main'>해당 기계설비현장에 참여 중인 기술진이 없습니다</Typography>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}
      {showAlertModal && scheduleEngineerData && (
        <AlertModal open={showAlertModal} setOpen={setShowAlertModal} handleConfirm={handleDontSave} />
      )}
    </form>
  )
}

export default ScheduleAndEngineerTabContent
