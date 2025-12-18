import { createContext, Fragment, useCallback, useContext, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Button, Checkbox, TextField, Typography } from '@mui/material'

import type { Path } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import dayjs from 'dayjs'

import { NumericFormat } from 'react-number-format'

import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import type { MachineProjectResponseDtoType } from '@core/types'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'
import EnergyReportModal from '../report/EnergyReportModal'
import DownloadReportModal from '../report/DownloadReportModal'
import ChecklistResultSummaryModal from '../report/ChecklistResultSummaryModal'
import { useGetMachineProject } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import MachinePerformanceReviewModal from '../report/MachinePerformanceReviewModal'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import isEditingContext from '../../isEditingContext'
import TextFieldTd from '@/@core/components/elim-inputbox/TextFieldTd'
import styles from '@core/styles/customTable.module.css'
import PostCodeButton from '@/@core/components/elim-button/PostCodeButton'
import SelectTd from '@/@core/components/elim-inputbox/SelectTd'
import { projectStatusOption } from '@/@core/data/options'
import useCompanyNameOption from '@/@core/hooks/useCompanyNameOption'

export const MacinheProjectNameContext = createContext<string>('')

const MachineProjectTabContent = () => {
  const router = useRouter()

  const { isEditing, setIsEditing } = useContext(isEditingContext)!
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const machineProjectId = params?.id as string

  const { data: projectData, refetch: refetchProjectData } = useGetMachineProject(machineProjectId)

  const { note, machineProjectName, ...formDefaultValues } = projectData!

  console.log('These are not handled:', note, machineProjectName)

  // 초기값 세팅
  const form = useForm<Omit<MachineProjectResponseDtoType, 'note' | 'machineProjectName'>>({
    defaultValues: formDefaultValues
  })

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const companyNameOption = useCompanyNameOption()

  const isDirty = form.formState.isDirty

  const handleSave = form.handleSubmit(async data => {
    try {
      setLoading(true)

      const result = await auth
        .put<{
          data: Omit<MachineProjectResponseDtoType & { machineProjectId: number }, 'note'>
        }>(`/api/machine-projects/${machineProjectId}`, data)
        .then(v => v.data.data)

      form.reset(result)
      refetchProjectData()
      setIsEditing(false)
      handleSuccess('현장정보가 수정되었습니다.')
    } catch (error: any) {
      handleApiError(error, '데이터 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  })

  const handleDelete = async () => {
    try {
      if (!projectData) throw new Error()

      await auth.delete(`/api/machine-projects/${machineProjectId}?version=${projectData.version}`)

      handleSuccess('해당 프로젝트가 삭제되었습니다.')
      router.push('/machine')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleDontSave = useCallback(() => {
    form.reset()
    setIsEditing(false)
    setShowAlertModal(false)
  }, [setIsEditing, form])

  if (!projectData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  return (
    projectData && (
      <MacinheProjectNameContext.Provider value={projectData.machineProjectName}>
        <form onSubmit={handleSave} className='h-full flex flex-col max-w-[890px]'>
          {/* 상단 버튼들 : 점검의견서, 성능점검시 검토사항 ... */}
          <div className='flex mb-4 justify-between'>
            <div className='flex items-center gap-1'>
              {/*
              <Button
                variant='contained'
                color='info'
                disabled={true}
                onClick={() => {
                console.log('?')
                }}
              >
                입수자료
              </Button>
              */}
              <ChecklistResultSummaryModal />
              <MachinePerformanceReviewModal />

              <EnergyReportModal />
              <DownloadReportModal />
            </div>
            <div className='flex items-center gap-3'>
              {isEditing ? (
                <div className='flex items-end justify-end gap-1'>
                  <Button color='success' variant='contained' type='submit' disabled={loading || !isDirty}>
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
                </div>
              ) : (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    setIsEditing(true)
                  }}
                >
                  수정
                </Button>
              )}
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  setShowDeleteModal(true)
                }}
              >
                삭제
              </Button>
            </div>
          </div>

          <div
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fafbfc',
              fontSize: 15,
              marginBottom: 16,
              overflowY: 'auto'
            }}
          >
            {isEditing ? (
              <div className={styles.container}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                  </colgroup>
                  <tbody>
                    {/* 관리주체 현황 */}
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={4} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                        관리주체 현황
                      </th>
                    </tr>
                    {/* 기관명 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>기관명</th>
                      <TextFieldTd colSpan={3} form={form} name='institutionName' />
                    </tr>
                    {/* 주소 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>주소</th>
                      <TextFieldTd
                        colSpan={3}
                        form={form}
                        name='roadAddress'
                        slotProps={{
                          input: {
                            endAdornment: (
                              <PostCodeButton
                                onChange={value => form.setValue('roadAddress', value, { shouldDirty: true })}
                              />
                            )
                          }
                        }}
                      />
                    </tr>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>대표자</th>
                      <TextFieldTd form={form} name='representative' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>연면적(㎡)</th>
                      <td className='p-0'>
                        <Controller
                          control={form.control}
                          name='grossArea'
                          render={({ field }) => (
                            <NumericFormat
                              valueIsNumericString
                              decimalSeparator='.'
                              allowNegative={false}
                              decimalScale={5}
                              customInput={TextField}
                              size='small'
                              value={field.value}
                              onValueChange={values => {
                                field.onChange(values.floatValue)
                              }}
                              fullWidth
                              slotProps={{
                                input: {
                                  sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } }
                                }
                              }}
                            />
                          )}
                        />
                      </td>
                    </tr>
                    {/* 사업자번호 / 세대수 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>사업자번호</th>
                      <TextFieldTd form={form} name='bizno' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>세대수</th>
                      <TextFieldTd type='number' form={form} name='houseCnt' />
                    </tr>
                    {/* 용도 / 담당자 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>용도</th>
                      <TextFieldTd form={form} name='purpose' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>담당자</th>
                      <TextFieldTd form={form} name='manager' />
                    </tr>
                    {/* 건물구조 / 연락처 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>건물구조</th>
                      <TextFieldTd form={form} name='structure' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>연락처</th>
                      <TextFieldTd form={form} name='managerPhone' />
                    </tr>
                    {/* 전화번호 / 준공일 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>전화번호</th>
                      <TextFieldTd form={form} name='tel' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>준공일</th>
                      <TextFieldTd type='date' form={form} name='completeDate' />
                    </tr>
                    {/* 관리주체 요청사항 */}
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>관리주체 요청사항</th>
                      <TextFieldTd multiline rows={4} colSpan={3} form={form} name='requirement' />
                    </tr>
                    {/* 계약사항 및 책임자 헤더 */}
                    <tr style={{ background: '#f3f4f6' }}>
                      <th
                        colSpan={4}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          fontWeight: 700,
                          fontSize: 16,
                          borderRight: 0
                        }}
                      >
                        계약사항 및 책임자
                      </th>
                    </tr>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>계약일</th>
                      <TextFieldTd type='date' form={form} name='contractDate' />
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>진행 상태</th>
                      <SelectTd form={form} name='projectStatus' option={projectStatusOption} />
                    </tr>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>계약금액</th>
                      <td className='p-0'>
                        <div className='flex items-center w-full'>
                          <Controller
                            control={form.control}
                            name='contractPrice'
                            render={({ field }) => (
                              <NumericFormat
                                thousandSeparator
                                customInput={TextField}
                                size='small'
                                value={field.value}
                                onValueChange={values => {
                                  field.onChange(values.floatValue)
                                }}
                                fullWidth
                                slotProps={{
                                  input: {
                                    startAdornment: '￦',
                                    sx: { '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: 0 } }
                                  }
                                }}
                              />
                            )}
                          />
                          <div className='flex items-center px-2 border-l h-full bg-gray-50'>
                            <Typography variant='caption' sx={{ whiteSpace: 'nowrap' }}>
                              VAT포함
                            </Typography>
                            <Controller
                              control={form.control}
                              name='vatIncludedYn'
                              render={({ field }) => (
                                <Checkbox
                                  size='small'
                                  checked={field.value === 'Y'}
                                  onChange={e => {
                                    form.setValue('vatIncludedYn', e.target.checked ? 'Y' : 'N', {
                                      shouldDirty: true
                                    })
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </td>

                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>점검업체</th>
                      {companyNameOption && <SelectTd form={form} name='companyName' option={companyNameOption} />}
                    </tr>
                    {/* 계약담당자 / 계약상대자 (InputBox 3개) */}
                    <tr>
                      <th rowSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                        계약담당자
                      </th>
                      <TextFieldTd form={form} name='contractManager' placeholder='이름' />

                      <th rowSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                        계약상대자
                      </th>
                      <TextFieldTd form={form} name='contractPartner' placeholder='이름' />
                    </tr>
                    <tr>
                      <TextFieldTd form={form} name='contractManagerTel' placeholder='전화번호' />
                      <TextFieldTd form={form} name='contractPartnerTel' placeholder='전화번호' />
                    </tr>
                    <tr>
                      <TextFieldTd form={form} name='contractManagerEmail' placeholder='이메일' />
                      <TextFieldTd form={form} name='contractPartnerEmail' placeholder='이메일' />
                    </tr>
                    {/* 유지관리자 및 담당자 헤더 */}
                    <tr style={{ background: '#f3f4f6' }}>
                      <th
                        colSpan={4}
                        style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, fontSize: 16 }}
                      >
                        유지관리자 및 담당자
                      </th>
                    </tr>
                    {/* 유지관리자/담당자 (반복) */}
                    {['1', '2', '3'].map(i => (
                      <Fragment key={i}>
                        <tr key={i} className='border solid '>
                          <th rowSpan={2} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                            유지관리자{i}
                          </th>
                          <TextFieldTd
                            form={form}
                            name={`machineMaintainer${i}Name` as Path<typeof form.getValues>}
                            placeholder='이름'
                          />

                          <th rowSpan={2} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                            담당자{i}
                          </th>
                          <TextFieldTd
                            form={form}
                            name={`machineManager${i}Name` as Path<typeof form.getValues>}
                            placeholder='이름'
                          />
                        </tr>
                        <tr>
                          <TextFieldTd
                            form={form}
                            name={`machineMaintainer${i}Info` as Path<typeof form.getValues>}
                            placeholder='정보'
                          />
                          <TextFieldTd
                            form={form}
                            name={`machineManager${i}Info` as Path<typeof form.getValues>}
                            placeholder='정보'
                          />
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '32%' }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        관리주체 현황
                      </th>
                    </tr>
                    <tr>
                      <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        기관명
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData?.institutionName ? projectData?.institutionName : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        주소
                      </th>
                      <td colSpan={3} style={{ padding: '10px 12px' }}>
                        {projectData?.roadAddress ? projectData?.roadAddress : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        대표자
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.representative ? projectData.representative : '-'}
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        연면적(㎡)
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.grossArea ? projectData.grossArea : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        사업자번호
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.bizno ? projectData.bizno : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        세대수
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.houseCnt ? projectData.houseCnt : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        용도
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.purpose ? projectData.purpose : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.manager ? projectData.manager : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        건물구조
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.structure ? projectData.structure : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        연락처
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.managerPhone ? projectData.managerPhone : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        전화번호
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.tel ? projectData.tel : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        준공일
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.completeDate
                          ? dayjs(new Date(projectData.completeDate)).format('YYYY-MM-DD')
                          : '-'}
                      </td>
                    </tr>
                    <tr style={{ height: '114px' }}>
                      <th rowSpan={1} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        관리주체 요청사항
                      </th>
                      <td rowSpan={1} colSpan={3} style={{ padding: '10px 12px', minHeight: 200 }}>
                        <p>{projectData.requirement ? projectData.requirement : '-'}</p>
                      </td>
                    </tr>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                        계약사항 및 책임자
                      </th>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약일
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.contractDate
                          ? dayjs(new Date(projectData.contractDate)).format('YYYY-MM-DD')
                          : '-'}
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        진행상태
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.projectStatusDescription ? projectData.projectStatusDescription : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약금액
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        <div className='flex gap-5 items-center'>
                          {projectData.contractPrice?.toLocaleString()
                            ? `￦ ${projectData.contractPrice?.toLocaleString()}`
                            : '-'}
                          {projectData.vatIncludedYn === 'Y' && <Typography variant='caption'>(VAT포함)</Typography>}
                        </div>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        점검업체
                      </th>
                      <td style={{ padding: '10px 12px' }}>{projectData.companyName}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약담당자
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.contractManager ? projectData.contractManager : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {projectData.contractManagerTel ? projectData.contractManagerTel : '-'}
                        </span>
                        <br />
                        <span style={{ color: '#888' }}>
                          {projectData.contractManagerEmail ? projectData.contractManagerEmail : '-'}
                        </span>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약상대자
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {projectData.contractPartner ? projectData.contractPartner : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {projectData.contractPartnerTel ? projectData.contractPartnerTel : '-'}
                        </span>
                        <br />
                        <span style={{ color: '#888' }}>
                          {' '}
                          {projectData.contractPartnerEmail ? projectData.contractPartnerEmail : '-'}
                        </span>
                      </td>
                    </tr>

                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                        유지관리자 및 담당자
                      </th>
                    </tr>
                    {[1, 2, 3].map(i => (
                      <Fragment key={i}>
                        <tr>
                          {[
                            { label: '유지관리자', value: 'machineMaintainer' },
                            { label: '담당자', value: 'machineManager' }
                          ].map(v => (
                            <Fragment key={v.value}>
                              <th
                                rowSpan={2}
                                align='left'
                                style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}
                              >
                                {`${v.label}${i}`}
                              </th>
                              <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                                {projectData[`${v.value}${i}Name` as keyof typeof projectData]
                                  ? projectData[`${v.value}${i}Name` as keyof typeof projectData]
                                  : '-'}
                              </td>
                            </Fragment>
                          ))}
                        </tr>
                        <tr>
                          {[
                            { label: '유지관리자', value: 'machineMaintainer' },
                            { label: '담당자', value: 'machineManager' }
                          ].map(v => (
                            <Fragment key={v.value}>
                              <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                                {projectData[`${v.value}${i}Info` as keyof typeof projectData]
                                  ? projectData[`${v.value}${i}Info` as keyof typeof projectData]
                                  : '-'}
                              </td>
                            </Fragment>
                          ))}
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showAlertModal && (
            <AlertModal open={showAlertModal} setOpen={setShowAlertModal} handleConfirm={handleDontSave} />
          )}
          {showDeleteModal && (
            <DeleteModal open={showDeleteModal} setOpen={setShowDeleteModal} onDelete={handleDelete} />
          )}
        </form>
      </MacinheProjectNameContext.Provider>
    )
  )
}

export default MachineProjectTabContent
