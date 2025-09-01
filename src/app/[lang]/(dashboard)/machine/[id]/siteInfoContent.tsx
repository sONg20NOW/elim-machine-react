import { useState } from 'react'

import { Button } from '@mui/material'

import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultSelectBox from '@/components/selectbox/defaultSelectBox'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

const SiteInfoContent = ({ projectData }: any) => {
  // 초기값 세팅
  const [editData, setEditData] = useState(projectData || {})
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    console.log('editData는요!', editData)
    console.log('Saving data...', editData.machineProjectScheduleAndEngineerResponseDto.machineProjectId)

    try {
      const result = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${editData.machineProjectScheduleAndEngineerResponseDto.machineProjectId}/machine-project-management`,
        editData.machineProjectManagementResponseDto
      )

      setIsEditing(false)

      setEditData((prev: any) => ({
        ...prev,
        machineProjectManagementResponseDto: {
          ...result.data.data
        }
      }))

      console.log('result:', result.data.data)
      handleSuccess('수정되었습니다.')
    } catch (error: any) {
      handleApiError(error, '데이터 저장에 실패했습니다.')

      return
    }
  }

  return (
    <div>
      <div className='flex mb-4 gap-[4px]'>
        <Button
          variant='contained'
          color='info'
          onClick={() => {
            console.log('?')
          }}
        >
          입수자료
        </Button>
        <Button
          variant='contained'
          color='success'
          onClick={() => {
            console.log('?')
          }}
        >
          점검의견서
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            console.log('?')
          }}
        >
          성능점검시 검토사항
        </Button>

        <Button
          variant='contained'
          color='warning'
          onClick={() => {
            console.log('?')
          }}
        >
          에너지 사용량
        </Button>

        <Button
          variant='contained'
          color='error'
          onClick={() => {
            console.log('?')
          }}
        >
          보고서 다운로드
        </Button>

        <Button
          variant='contained'
          color='secondary'
          onClick={() => {
            console.log('?')
          }}
        >
          삭제
        </Button>
      </div>
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
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSave()
          }}
        >
          {isEditing ? (
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
                    관리주체 현황
                  </th>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '10px 12px' }}>
                    <button
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 16px',
                        marginRight: 8,
                        cursor: 'pointer'
                      }}
                      type='submit'
                    >
                      저장
                    </button>
                  </td>
                </tr>
                <tr>
                  <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    기관명
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto?.institutionName || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            institutionName: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    주소
                  </th>
                  <td colSpan={3} style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={`
${editData?.machineProjectManagementResponseDto?.address?.roadAddress || ''}
 ${editData?.machineProjectManagementResponseDto?.address?.jibunAddress || ''}
 ${editData?.machineProjectManagementResponseDto?.address?.detailAddress || ''}
                    `}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            address: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    대표자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.representative || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            representative: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    연면적(㎡)
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.grossArea || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            grossArea: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    사업자번호
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.bizno || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            bizno: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    세대수
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.houseCnt || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            houseCnt: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    용도
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.purpose || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            purpose: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.manager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            manager: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    건물구조
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.structure || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            structure: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    연락처
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.managerPhone || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            managerPhone: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    전화번호
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.tel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            tel: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    준공일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectManagementResponseDto.completeDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            completeDate: date
                          }
                        }))
                      }
                      placeholderText='준공일을 선택하세요'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                </tr>
                {/* 계약사항/책임자 */}
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
                    <AppReactDatepicker
                      selected={editData?.machineProjectManagementResponseDto.contractDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractDate: date
                          }
                        }))
                      }
                      placeholderText='계약일을 선택하세요'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    진행상태
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <DefaultSelectBox
                      id={'projectStatusDescription'}
                      value={editData.machineProjectManagementResponseDto.projectStatus || ''}
                      loading={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            projectStatus: e.target.value
                          }
                        }))
                      }
                      options={[
                        { value: 'CONTRACT_COMPLETED', label: '계약 완료' },
                        { value: 'SITE_INSPECTION_COMPLETED', label: '현장 점검 완료' },
                        { value: 'REPORT_WRITING', label: '보고서 작성중' },
                        { value: 'REPORT_WRITING_COMPLETED', label: '보고서 작성완료' },
                        { value: 'REPORT_SUBMITTING', label: '보고서 제출중' },
                        { value: 'REPORT_SUBMITTED', label: '보고서 제출완료' }
                      ]}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계약금액
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractPrice || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractPrice: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>

                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검 업체
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <DefaultSelectBox
                      id={'companyName'}
                      value={editData.machineProjectManagementResponseDto.companyName || ''}
                      loading={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            companyName: e.target.value
                          }
                        }))
                      }
                      options={[
                        { value: '엘림기술원(주)', label: '엘림기술원(주)' },
                        { value: '엘림주식회사', label: '엘림주식회사' },
                        { value: '엘림테크원(주)', label: '엘림테크원(주)' },
                        { value: '이엘엔지니어링(주)', label: '이엘엔지니어링(주)' },
                        { value: '이엘테크원(주)', label: '이엘테크원(주)' }
                      ]}
                    />
                  </td>
                </tr>

                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계약담당자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractManager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractManager: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractManagerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractManagerTel: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractManagerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractManagerEmail: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이메일'
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계약상대자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractPartner || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractPartner: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractPartnerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractPartnerTel: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.contractPartnerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            contractPartnerEmail: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이메일'
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    요구사항
                  </th>
                  <td colSpan={3} style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      fullWidth
                      rows={4}
                      multiline
                      label=''
                      placeholder='참고 사항을 입력해 주세요'
                      value={editData.machineProjectManagementResponseDto.requirement || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            requirement: e.target.value
                          }
                        }))
                      }
                    />
                  </td>
                </tr>
                {/* 유지관리자/담당자 */}
                <tr style={{ background: '#f3f4f6' }}>
                  <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                    유지관리자 및 담당자
                  </th>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    유지관리자1
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer1Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer1Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자1
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager1Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager1Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    유지관리자2
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer2Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer2Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자2
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager2Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager2Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    유지관리자3
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer3Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineMaintainer3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineMaintainer3Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자3
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager3Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectManagementResponseDto.machineManager3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectManagementResponseDto: {
                            ...prev.machineProjectManagementResponseDto,
                            machineManager3Info: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                </tr>
              </tbody>
            </table>
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
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      관리주체 현황
                    </th>
                    <td colSpan={3} style={{ textAlign: 'right', padding: '10px 12px' }}>
                      <button
                        style={{
                          background: '#1976d2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 16px',
                          marginRight: 8,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setIsEditing(true)
                        }}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      기관명
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.institutionName}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      주소
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto?.address?.roadAddress || ''}
                      {editData.machineProjectManagementResponseDto.address?.detailAddress
                        ? `, ${editData.machineProjectManagementResponseDto.address.detailAddress}`
                        : ''}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      대표자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.representative}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연면적(㎡)
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.grossArea}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      사업자번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.bizno}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      세대수
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.houseCnt}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      용도
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.purpose}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.manager}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물구조
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.structure}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연락처
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.managerPhone}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      전화번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.tel}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      준공일
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.completeDate
                        ? new Date(editData.machineProjectManagementResponseDto.completeDate).toLocaleDateString()
                        : ''}
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
                      {editData.machineProjectManagementResponseDto.contractDate
                        ? new Date(editData.machineProjectManagementResponseDto.contractDate).toLocaleDateString()
                        : ''}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      진행상태
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.projectStatusDescription}
                    </td>
                    {/* <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.contractPrice?.toLocaleString()} 원
                      {editData.machineProjectManagementResponseDto.vatIncludedYn === 'Y' && (
                        <span style={{ color: '#888', marginLeft: 8 }}>(VAT포함)</span>
                      )}
                    </td> */}
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.contractPrice?.toLocaleString()} 원
                      {editData.machineProjectManagementResponseDto.vatIncludedYn === 'Y' && (
                        <span style={{ color: '#888', marginLeft: 8 }}>(VAT포함)</span>
                      )}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검업체
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectManagementResponseDto.companyName}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.contractManager}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.contractManagerTel}
                      </span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.contractManagerEmail}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.contractPartner}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.contractPartnerTel}
                      </span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.contractPartnerEmail}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      요구사항
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px', minHeight: 200 }}>
                      <p>{editData.machineProjectManagementResponseDto.requirement}</p>
                    </td>
                  </tr>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                      유지관리자 및 담당자
                    </th>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자1
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineMaintainer1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineMaintainer1Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자1
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineManager1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineManager1Info}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineMaintainer2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineMaintainer2Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineManager2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineManager2Info}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineMaintainer3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineMaintainer3Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectManagementResponseDto.machineManager3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectManagementResponseDto.machineManager3Info}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default SiteInfoContent
