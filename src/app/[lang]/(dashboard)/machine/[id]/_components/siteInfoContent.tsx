import { useContext, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button } from '@mui/material'

import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import MultiSelectBox from '@/components/selectbox/MultiSelectBox'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import type { MachineProjectDetailDtoType } from '@/app/_type/types'
import { InputBox } from '@/components/selectbox/InputBox'
import { MACHINE_INPUT_INFO } from '@/app/_schema/input/MachineInputInfo'
import { ProjectDataContext } from '../page'

const SiteInfoContent = ({ projectData }: { projectData: MachineProjectDetailDtoType }) => {
  const params = useParams()
  const machineProjectId = params?.id as string

  // 초기값 세팅
  const [editData, setEditData] = useState<MachineProjectDetailDtoType>(useContext(ProjectDataContext)!)
  const [isEditing, setIsEditing] = useState(false)

  if (!editData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  const handleSave = async () => {
    console.log('editData는요!', editData)
    console.log('Saving data...', machineProjectId)

    try {
      const result = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}`,
        editData?.machineProjectResponseDto
      )

      setIsEditing(false)

      setEditData((prev: any) => ({
        ...prev,
        machineProjectResponseDto: {
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
        {/* TODO: 버튼 구현 */}
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
                    <InputBox
                      showLabel={false}
                      tabFieldKey={'institutionName'}
                      value={editData?.machineProjectResponseDto.institutionName ?? ''}
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            institutionName: value
                          }
                        }))
                      }
                      tabInfos={MACHINE_INPUT_INFO.project}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    주소
                  </th>
                  <td colSpan={3} style={{ padding: '10px 12px' }}>
                    <InputBox
                      showLabel={false}
                      tabFieldKey={'roadAddress'}
                      value={editData.machineProjectResponseDto.roadAddress ?? ''}
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            roadAddress: value
                          }
                        }))
                      }
                      tabInfos={MACHINE_INPUT_INFO.project}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    대표자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectResponseDto.representative || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.grossArea || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.bizno || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.houseCnt || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.purpose || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.manager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.structure || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.managerPhone || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.tel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      selected={editData?.machineProjectResponseDto.completeDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      selected={editData?.machineProjectResponseDto.contractDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                    <MultiSelectBox
                      id={'projectStatusDescription'}
                      value={editData.machineProjectResponseDto.projectStatus || ''}
                      disabled={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.contractPrice || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                    <MultiSelectBox
                      id={'companyName'}
                      value={editData.machineProjectResponseDto.companyName || ''}
                      loading={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.contractManager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            contractManager: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.contractManagerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            contractManagerTel: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.contractManagerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.contractPartner || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            contractPartner: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.contractPartnerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            contractPartnerTel: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.contractPartnerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.requirement || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineMaintainer1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineMaintainer1Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineMaintainer1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineManager1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineManager1Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineManager1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineMaintainer2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineMaintainer2Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineMaintainer2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineManager2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineManager2Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineManager2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineMaintainer3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineMaintainer3Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineMaintainer3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      value={editData.machineProjectResponseDto.machineManager3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
                            machineManager3Name: e.target.value
                          }
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineProjectResponseDto.machineManager3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectResponseDto: {
                            ...prev.machineProjectResponseDto,
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
                      {editData?.machineProjectResponseDto?.institutionName ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      주소
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto?.roadAddress ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      대표자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.representative}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연면적(㎡)
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.grossArea}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      사업자번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.bizno}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      세대수
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.houseCnt}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      용도
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.purpose}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.manager}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물구조
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.structure}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연락처
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.managerPhone}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      전화번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.tel}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      준공일
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.completeDate
                        ? new Date(editData.machineProjectResponseDto.completeDate).toLocaleDateString()
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
                      {editData.machineProjectResponseDto.contractDate
                        ? new Date(editData.machineProjectResponseDto.contractDate).toLocaleDateString()
                        : ''}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      진행상태
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.projectStatusDescription}
                    </td>
                    {/* <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.contractPrice?.toLocaleString()} 원
                      {editData.machineProjectResponseDto.vatIncludedYn === 'Y' && (
                        <span style={{ color: '#888', marginLeft: 8 }}>(VAT포함)</span>
                      )}
                    </td> */}
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.contractPrice?.toLocaleString()} 원
                      {editData.machineProjectResponseDto.vatIncludedYn === 'Y' && (
                        <span style={{ color: '#888', marginLeft: 8 }}>(VAT포함)</span>
                      )}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검업체
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.machineProjectResponseDto.companyName}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.contractManager}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.contractManagerTel}
                      </span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.contractManagerEmail}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.contractPartner}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.contractPartnerTel}
                      </span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.contractPartnerEmail}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      요구사항
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px', minHeight: 200 }}>
                      <p>{editData.machineProjectResponseDto.requirement}</p>
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
                      {editData.machineProjectResponseDto.machineMaintainer1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineMaintainer1Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자1
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.machineManager1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineManager1Info}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.machineMaintainer2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineMaintainer2Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.machineManager2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineManager2Info}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.machineMaintainer3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineMaintainer3Info}
                      </span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineProjectResponseDto.machineManager3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {editData.machineProjectResponseDto.machineManager3Info}
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
