import { useState } from 'react'

import { useParams } from 'next/navigation'

import { Button } from '@mui/material'

import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { InputBox } from '@/app/_components/selectbox/InputBox'
import { MACHINE_INPUT_INFO } from '@/app/_schema/input/MachineInputInfo'
import type { machineProjectResponseDtoType } from '@/app/_type/types'

const SiteInfoContent = ({ projectData }: { projectData: machineProjectResponseDtoType }) => {
  const params = useParams()
  const machineProjectId = params?.id as string

  // 초기값 세팅
  const [editData, setEditData] = useState<machineProjectResponseDtoType>(projectData)
  const [isEditing, setIsEditing] = useState(false)

  if (!editData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  const handleSave = async () => {
    console.log('editData는요!', editData)
    console.log('Saving data...', machineProjectId)

    try {
      const result = await axios.put<{ data: machineProjectResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}`,
        editData
      )

      setIsEditing(false)

      setEditData(result.data.data)

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
                      value={editData?.institutionName ?? ''}
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          institutionName: value
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
                      value={editData.roadAddress ?? ''}
                      onChange={value =>
                        setEditData(prev => ({
                          ...prev,
                          roadAddress: value
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
                      value={editData.representative || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          representative: e.target.value
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
                      value={editData.grossArea || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          grossArea: e.target.value
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
                      value={editData.bizno || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          bizno: e.target.value
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
                      value={editData.houseCnt || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          houseCnt: e.target.value
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
                      value={editData.purpose || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          purpose: e.target.value
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
                      value={editData.manager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          manager: e.target.value
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
                      value={editData.structure || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          structure: e.target.value
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
                      value={editData.managerPhone || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          managerPhone: e.target.value
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
                      value={editData.tel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          tel: e.target.value
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
                      selected={new Date(editData?.completeDate ?? '')}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          completeDate: date
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
                      selected={new Date(editData?.contractDate ?? '')}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractDate: date
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
                    <InputBox
                      tabInfos={MACHINE_INPUT_INFO.project}
                      tabFieldKey={'projectStatusDescription'}
                      value={editData.projectStatus || ''}
                      disabled={false}
                      onChange={value =>
                        setEditData((prev: any) => ({
                          ...prev,
                          projectStatus: value
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계약금액
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.contractPrice || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractPrice: e.target.value
                        }))
                      }
                      fullWidth
                    />
                  </td>

                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검 업체
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <InputBox
                      tabInfos={MACHINE_INPUT_INFO.project}
                      tabFieldKey={'companyName'}
                      value={editData?.companyName || ''}
                      onChange={value =>
                        setEditData((prev: any) => ({
                          ...prev,
                          companyName: value
                        }))
                      }
                    />
                  </td>
                </tr>

                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계약담당자
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData?.contractManager || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractManager: e.target.value
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.contractManagerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractManagerTel: e.target.value
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.contractManagerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractManagerEmail: e.target.value
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
                      value={editData.contractPartner || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractPartner: e.target.value
                        }))
                      }
                      fullWidth
                      placeholder='이름'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.contractPartnerTel || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractPartnerTel: e.target.value
                        }))
                      }
                      fullWidth
                      placeholder='연락처'
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.contractPartnerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          contractPartnerEmail: e.target.value
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
                      value={editData.requirement || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          requirement: e.target.value
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
                      value={editData.machineMaintainer1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer1Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineMaintainer1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer1Info: e.target.value
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
                      value={editData.machineManager1Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager1Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineManager1Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager1Info: e.target.value
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
                      value={editData.machineMaintainer2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer2Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineMaintainer2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer2Info: e.target.value
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
                      value={editData.machineManager2Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager2Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineManager2Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager2Info: e.target.value
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
                      value={editData.machineMaintainer3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer3Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineMaintainer3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineMaintainer3Info: e.target.value
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
                      value={editData.machineManager3Name || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager3Name: e.target.value
                        }))
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <CustomTextField
                      value={editData.machineManager3Info || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineManager3Info: e.target.value
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
                    <td style={{ padding: '10px 12px' }}>{editData?.institutionName ?? ''}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      주소
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>
                      {editData?.roadAddress ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      대표자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.representative}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연면적(㎡)
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.grossArea}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      사업자번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.bizno}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      세대수
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.houseCnt}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      용도
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.purpose}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.manager}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물구조
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.structure}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연락처
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.managerPhone}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      전화번호
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.tel}</td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      준공일
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.completeDate ? new Date(editData.completeDate).toLocaleDateString() : ''}
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
                      {editData.contractDate ? new Date(editData.contractDate).toLocaleDateString() : ''}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      진행상태
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.projectStatusDescription}</td>
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
                      {editData.contractPrice?.toLocaleString()} 원
                      {editData.vatIncludedYn === 'Y' && (
                        <span style={{ color: '#888', marginLeft: 8 }}>(VAT포함)</span>
                      )}
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검업체
                    </th>
                    <td style={{ padding: '10px 12px' }}>{editData.companyName}</td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.contractManager}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.contractManagerTel}</span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.contractManagerEmail}</span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.contractPartner}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.contractPartnerTel}</span>
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.contractPartnerEmail}</span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      요구사항
                    </th>
                    <td colSpan={3} style={{ padding: '10px 12px', minHeight: 200 }}>
                      <p>{editData.requirement}</p>
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
                      {editData.machineMaintainer1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineMaintainer1Info}</span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자1
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineManager1Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineManager1Info}</span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineMaintainer2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineMaintainer2Info}</span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자2
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineManager2Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineManager2Info}</span>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      유지관리자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineMaintainer3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineMaintainer3Info}</span>
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자3
                    </th>
                    <td style={{ padding: '10px 12px' }}>
                      {editData.machineManager3Name}
                      <br />
                      <span style={{ color: '#888', fontSize: 13 }}>{editData.machineManager3Info}</span>
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
