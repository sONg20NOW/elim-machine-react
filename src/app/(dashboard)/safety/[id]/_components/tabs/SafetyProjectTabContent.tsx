import { useCallback, useContext, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Button, Checkbox, TextField, Typography } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'

import { toast } from 'react-toastify'

import { handleApiError, handleSuccess } from '@core/utils/errorHandler'
import type {
  safetyAttachmentTypeType,
  SafetyProjectReadResponseDtoType,
  SafetyProjectUpdateRequestDtoType
} from '@core/types'
import DeleteModal from '@/@core/components/elim-modal/DeleteModal'
import {
  useGetSafetyProject,
  useMutatePostSafetyProjectAttachment,
  useMutatePutSafetyProjectAttachment,
  useMutateSafetyProject
} from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import AlertModal from '@/@core/components/elim-modal/AlertModal'
import isEditingContext from '../../isEditingContext'
import TextFieldTd from '@/@core/components/elim-inputbox/TextFieldTd'
import styles from '@core/styles/customTable.module.css'
import PostCodeButton from '@/@core/components/elim-button/PostCodeButton'
import SelectTd from '@/@core/components/elim-inputbox/SelectTd'
import {
  facilityClassificationOption,
  facilityClassOption,
  facilityTypeOption,
  projectStatusOption,
  safetyAttachmentTypeOption,
  safetyGradeOption,
  safetyInspectionTypeOption
} from '@/@core/data/options'
import useCompanyNameOption from '@/@core/hooks/useCompanyNameOption'
import getSafetyProjectAttachmentS3Key from '@/@core/utils/getSafetyProjectAttachmentS3Key'

const SafetyProjectTabContent = () => {
  const router = useRouter()

  const params = useParams()
  const safetyProjectId = params?.id as string

  const { isEditing, setIsEditing } = useContext(isEditingContext)!
  const [loading, setLoading] = useState(false)

  const { data: safetyProjectData } = useGetSafetyProject(safetyProjectId)

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { safetyProjectId: _unusedID, specialNote, name, attachments, ...formDefaultValues } = safetyProjectData!

  const { mutateAsync: mutateAsyncSafetyProject } = useMutateSafetyProject(safetyProjectId)

  // 초기값 세팅
  const safetyProjectForm = useForm<SafetyProjectUpdateRequestDtoType>({
    defaultValues: formDefaultValues
  })

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const companyNameOption = useCompanyNameOption()

  const isDirty = safetyProjectForm.formState.isDirty

  const handleSave = safetyProjectForm.handleSubmit(async data => {
    try {
      setLoading(true)

      const result = await mutateAsyncSafetyProject(data)

      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { safetyProjectId, ...rest } = result

      safetyProjectForm.reset(rest)
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
      if (!safetyProjectData) throw new Error()

      await auth.delete(`/api/safety/projects/${safetyProjectId}?version=${safetyProjectData.version}`)

      handleSuccess('해당 프로젝트가 삭제되었습니다.')
      router.push('/safety')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleDontSave = useCallback(() => {
    safetyProjectForm.reset()
    setIsEditing(false)
    setShowAlertModal(false)
  }, [setIsEditing, safetyProjectForm])

  if (!safetyProjectData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  return (
    safetyProjectData && (
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
            overflow: 'hidden',
            background: '#fafbfc',
            fontSize: 15,
            marginBottom: 16,
            overflowY: 'auto'
          }}
        >
          {isEditing ? (
            <div className={styles.container}>
              <table>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '32%' }} />
                </colgroup>
                <tbody>
                  {/* ----- 관리주체 현황 ----- */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      관리주체 현황
                    </th>
                  </tr>
                  {/* 건물명, 고유번호 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>건물명</th>
                    <TextFieldTd form={safetyProjectForm} name='buildingName' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>고유번호</th>
                    <TextFieldTd form={safetyProjectForm} name='uniqueNo' />
                  </tr>

                  {/* 건물ID, 시설물번호 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>건물ID</th>
                    <TextFieldTd form={safetyProjectForm} name='buildingId' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>시설물번호</th>
                    <TextFieldTd form={safetyProjectForm} name='facilityNo' />
                  </tr>

                  {/* 주소 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>주소</th>
                    <TextFieldTd
                      colSpan={3}
                      form={safetyProjectForm}
                      name='roadAddress'
                      slotProps={{
                        input: {
                          endAdornment: (
                            <PostCodeButton
                              onChange={value =>
                                safetyProjectForm.setValue('roadAddress', value, { shouldDirty: true })
                              }
                            />
                          )
                        }
                      }}
                    />
                  </tr>

                  {/* 관리주체명, 연면적 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>관리주체명</th>
                    <TextFieldTd form={safetyProjectForm} name='managementEntityName' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>연면적(㎡)</th>
                    <td className='p-0'>
                      <Controller
                        control={safetyProjectForm.control}
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

                  {/* 대표자, 준공일 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>대표자</th>
                    <TextFieldTd form={safetyProjectForm} name='representative' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>준공일</th>
                    <TextFieldTd type='date' form={safetyProjectForm} name='completeDate' />
                  </tr>

                  {/* 점검종류, 안전등급 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>점검종류</th>
                    <SelectTd
                      form={safetyProjectForm}
                      name='safetyInspectionType'
                      option={safetyInspectionTypeOption}
                    />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>안전등급</th>
                    <SelectTd form={safetyProjectForm} name='safetyGrade' option={safetyGradeOption} />
                  </tr>

                  {/* 시설물구분, 담당자 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>시설물구분</th>
                    <SelectTd
                      form={safetyProjectForm}
                      name='facilityClassification'
                      option={facilityClassificationOption}
                    />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>담당자</th>
                    <TextFieldTd form={safetyProjectForm} name='manager' />
                  </tr>

                  {/* 종별, 담당자 연락처 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>종별</th>
                    <SelectTd form={safetyProjectForm} name='facilityClass' option={facilityClassOption} />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>담당자 연락처</th>
                    <TextFieldTd form={safetyProjectForm} name='managerPhone' />
                  </tr>

                  {/* 시설물종류 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>시설물종류</th>
                    <SelectTd colSpan={3} form={safetyProjectForm} name='facilityType' option={facilityTypeOption} />
                  </tr>

                  {/* 전화번호, 사업자번호 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>전화번호</th>
                    <TextFieldTd form={safetyProjectForm} name='tel' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>사업자번호</th>
                    <TextFieldTd form={safetyProjectForm} name='bizno' />
                  </tr>

                  {/* 3d url */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>3D URL</th>
                    <TextFieldTd colSpan={3} form={safetyProjectForm} name='threeDUrl' />
                  </tr>

                  {/* 요청사항 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>요청사항</th>
                    <TextFieldTd multiline rows={4} colSpan={3} form={safetyProjectForm} name='requirement' />
                  </tr>

                  {/* 비고 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>비고</th>
                    <TextFieldTd multiline rows={4} colSpan={3} form={safetyProjectForm} name='note' />
                  </tr>

                  {/* ----- 첨부파일 ----- */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      첨부파일
                    </th>
                  </tr>
                  <tr>
                    {/* 건축물대장 */}
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>건축물대장</th>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      <EditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='BUILDING_REGISTER'
                      />
                    </td>
                  </tr>
                  {/* 시설물대장 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>시설물대장</th>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      <EditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='FACILITY_REGISTER'
                      />
                    </td>
                  </tr>
                  {/* 과업지시서 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>과업지시서</th>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      <EditingAttachmentRow safetyProjectData={safetyProjectData} safetyAttachmentType='WORK_ORDER' />
                    </td>
                  </tr>
                  {/* 교육수료증 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>교육수료증</th>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      <EditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='EDUCATION_CERTIFICATE'
                      />
                    </td>
                  </tr>
                  {/* ----- 계약사항 ----- */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      계약사항
                    </th>
                  </tr>
                  {/* 계약일, 진행상태 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>계약일</th>
                    <TextFieldTd type='date' form={safetyProjectForm} name='contractDate' />
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>진행 상태</th>
                    <SelectTd form={safetyProjectForm} name='projectStatus' option={projectStatusOption} />
                  </tr>

                  {/* 계약금액, 점검업체 */}
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>계약금액</th>
                    <td className='p-0'>
                      <div className='flex items-center w-full'>
                        <Controller
                          control={safetyProjectForm.control}
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
                            control={safetyProjectForm.control}
                            name='vatIncludedYn'
                            render={({ field }) => (
                              <Checkbox
                                size='small'
                                checked={field.value === 'Y'}
                                onChange={e => {
                                  safetyProjectForm.setValue('vatIncludedYn', e.target.checked ? 'Y' : 'N', {
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
                    {companyNameOption && (
                      <SelectTd form={safetyProjectForm} name='companyName' option={companyNameOption} />
                    )}
                  </tr>

                  {/* 계약담당자 이름, 계약상대자 이름 */}
                  <tr>
                    <th rowSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <TextFieldTd form={safetyProjectForm} name='contractManager' placeholder='이름' />
                    <th rowSpan={3} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <TextFieldTd form={safetyProjectForm} name='contractPartner' placeholder='이름' />
                  </tr>

                  {/* 계약담당자 연락처, 계약상대자 연락처 */}
                  <tr>
                    <TextFieldTd form={safetyProjectForm} name='contractManagerTel' placeholder='연락처' />
                    <TextFieldTd form={safetyProjectForm} name='contractPartnerTel' placeholder='연락처' />
                  </tr>

                  {/* 계약담당자 이메일, 계약상대자 이메일 */}
                  <tr>
                    <TextFieldTd form={safetyProjectForm} name='contractManagerEmail' placeholder='이메일' />
                    <TextFieldTd form={safetyProjectForm} name='contractPartnerEmail' placeholder='이메일' />
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <table style={{ borderRadius: 8, border: '1px solid lightgray', width: '100%' }}>
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
                  {/* 건물명, 고유번호 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물명
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.buildingName || '-'}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      고유번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.uniqueNo || '-'}</td>
                  </tr>

                  {/* 건물ID, 시설물번호 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물ID
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.buildingId || '-'}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      시설물번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.facilityNo || '-'}</td>
                  </tr>

                  {/* 주소 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      주소
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {safetyProjectData.roadAddress || '-'}
                    </td>
                  </tr>

                  {/* 관리주체명, 연면적 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      관리주체명
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.managementEntityName || '-'}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연면적(㎡)
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.grossArea || '-'}</td>
                  </tr>

                  {/* 대표자, 준공일 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      대표자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.representative || '-'}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      준공일
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {safetyProjectData.completeDate
                        ? dayjs(new Date(safetyProjectData.completeDate)).format('YYYY-MM-DD')
                        : '-'}
                    </td>
                  </tr>

                  {/* 점검종류, 안전등급 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검종류
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {safetyInspectionTypeOption.find(v => v.value === safetyProjectData.safetyInspectionType)
                        ?.label || '-'}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      안전등급
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {safetyGradeOption.find(v => v.value === safetyProjectData.safetyGrade)?.label || '-'}
                    </td>
                  </tr>

                  {/* 시설물구분, 담당자 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      시설물구분
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {facilityClassificationOption.find(v => v.value === safetyProjectData.facilityClassification)
                        ?.label || '-'}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.manager || '-'}</td>
                  </tr>

                  {/* 종별, 담당자 연락처 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      종별
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {facilityClassOption.find(v => v.value === safetyProjectData.facilityClass)?.label || '-'}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자 연락처
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.managerPhone || '-'}</td>
                  </tr>

                  {/* 시설물종류 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      시설물종류
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {facilityTypeOption.find(v => v.value === safetyProjectData.facilityType)?.label || '-'}
                    </td>
                  </tr>

                  {/* 전화번호, 사업자번호 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      전화번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.tel || '-'}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      사업자번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.bizno || '-'}</td>
                  </tr>

                  {/* 3d url */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      3D URL
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {safetyProjectData.threeDUrl ? (
                        <a
                          href={safetyProjectData.threeDUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{ color: '#3b82f6', textDecoration: 'underline' }}
                        >
                          {safetyProjectData.threeDUrl}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>

                  {/* 요청사항 */}
                  <tr style={{ height: '114px' }}>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      관리주체 요청사항
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{safetyProjectData.requirement || '-'}</p>
                    </td>
                  </tr>

                  {/* 비고 */}
                  <tr style={{ height: '114px' }}>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      비고
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{safetyProjectData.note || '-'}</p>
                    </td>
                  </tr>
                  {/* 첨부파일 */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      첨부파일
                    </th>
                  </tr>
                  {/* 건축물대장 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건축물대장
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      <NotEditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='BUILDING_REGISTER'
                      />
                    </td>
                  </tr>
                  {/* 시설물대장 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      시설물대장
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      <NotEditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='FACILITY_REGISTER'
                      />
                    </td>
                  </tr>
                  {/* 과업지시서 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      과업지시서
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      <NotEditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='WORK_ORDER'
                      />
                    </td>
                  </tr>
                  {/* 교육수료증 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      교육수료증
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      <NotEditingAttachmentRow
                        safetyProjectData={safetyProjectData}
                        safetyAttachmentType='EDUCATION_CERTIFICATE'
                      />
                    </td>
                  </tr>
                  {/* 계약사항 */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약사항
                    </th>
                  </tr>
                  {/* 계약일, 진행상태 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약일
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {safetyProjectData.contractDate
                        ? dayjs(new Date(safetyProjectData.contractDate)).format('YYYY-MM-DD')
                        : '-'}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      진행상태
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {projectStatusOption.find(v => v.value === safetyProjectData.projectStatus)?.label || '-'}
                    </td>
                  </tr>

                  {/* 계약금액, 점검업체 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      <div className='flex gap-2 items-center'>
                        {safetyProjectData.contractPrice
                          ? `￦ ${safetyProjectData.contractPrice.toLocaleString()}`
                          : '-'}
                        {safetyProjectData.vatIncludedYn === 'Y' && (
                          <Typography variant='caption' color='text.secondary'>
                            (VAT포함)
                          </Typography>
                        )}
                      </div>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검업체
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.companyName || '-'}</td>
                  </tr>

                  {/* 계약담당자 이름, 계약상대자 이름 */}
                  <tr>
                    <th rowSpan={3} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractManager || '-'}</td>
                    <th rowSpan={3} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractPartner || '-'}</td>
                  </tr>

                  {/* 계약담당자 연락처, 계약상대자 연락처 */}
                  <tr>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractManagerTel || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractPartnerTel || '-'}</td>
                  </tr>

                  {/* 계약담당자 이메일, 계약상대자 이메일 */}
                  <tr>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractManagerEmail || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{safetyProjectData.contractPartnerEmail || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAlertModal && (
          <AlertModal open={showAlertModal} setOpen={setShowAlertModal} handleConfirm={handleDontSave} />
        )}
        {showDeleteModal && <DeleteModal open={showDeleteModal} setOpen={setShowDeleteModal} onDelete={handleDelete} />}
      </form>
    )
  )
}

function EditingAttachmentRow({
  safetyProjectData,
  safetyAttachmentType
}: {
  safetyProjectData: SafetyProjectReadResponseDtoType
  safetyAttachmentType: safetyAttachmentTypeType
}) {
  const params = useParams()
  const safetyProjectId = params?.id as string

  const { refetch } = useGetSafetyProject(safetyProjectId)
  const { mutateAsync: mutateAsyncPut } = useMutatePutSafetyProjectAttachment(safetyProjectId)
  const { mutateAsync: mutateAsyncPost } = useMutatePostSafetyProjectAttachment(safetyProjectId)

  const attachments = Array.isArray(safetyProjectData?.attachments) ? safetyProjectData.attachments : []
  const attachment = attachments?.find(v => v.safetyAttachmentType === safetyAttachmentType)
  const inputRef = useRef<HTMLInputElement>(null)

  async function onUploadAttachment(file: File) {
    const safetyAttachmentTypeLabel = safetyAttachmentTypeOption.find(v => v.value === safetyAttachmentType)?.label

    if (!safetyAttachmentTypeLabel) {
      toast.error('K 타입 에러 발생. 관리자 호출.')

      return
    }

    const S3KeyResult = await getSafetyProjectAttachmentS3Key(safetyProjectId, [file], safetyAttachmentTypeLabel)

    if (!S3KeyResult) return

    const { s3Key, fileName, presignedUrl } = S3KeyResult[0]

    try {
      // 첨부파일이 존재하지 않다면 생성
      if (!attachment) {
        await mutateAsyncPost({
          safetyAttachmentType: safetyAttachmentType,
          originalFileName: fileName,
          s3Key: s3Key,
          presignedUrl: presignedUrl
        })
      }

      // 첨부파일이 이미 있다면 변경
      else {
        await mutateAsyncPut({
          safetyProjectAttachmentId: attachment.safetyProjectAttachmentId,
          safetyAttachmentType: safetyAttachmentType,
          originalFileName: fileName,
          s3Key: s3Key
        })
      }

      refetch()
    } catch (e) {
      handleApiError(e)
    }

    // 마지막으로 쿼리 캐시 수정
  }

  return (
    <div className='flex justify-between items-center relative'>
      {attachment ? (
        <a href={attachment.presignedUrl} target='_blank'>
          <Typography sx={{ textDecorationLine: 'underline', color: 'info.main' }}>
            {attachment.originalFileName}
          </Typography>
        </a>
      ) : (
        '-'
      )}
      <Button onClick={() => inputRef.current?.click()} className='absolute right-0' variant='contained' color='info'>
        업로드
      </Button>
      <input
        ref={inputRef}
        className='hidden'
        type='file'
        onChange={e => {
          if (!e.target.files) return

          const files = Array.from(e.target.files)

          onUploadAttachment(files[0])
        }}
      />
    </div>
  )
}

function NotEditingAttachmentRow({
  safetyProjectData,
  safetyAttachmentType
}: {
  safetyProjectData: SafetyProjectReadResponseDtoType
  safetyAttachmentType: safetyAttachmentTypeType
}) {
  const attachment = safetyProjectData.attachments.find(v => v.safetyAttachmentType === safetyAttachmentType)

  return attachment ? (
    <a href={attachment.presignedUrl} target='_blank'>
      <Typography sx={{ textDecorationLine: 'underline', color: 'info.main' }}>
        {attachment.originalFileName}
      </Typography>
    </a>
  ) : (
    '-'
  )
}

export default SafetyProjectTabContent
