import { useState } from 'react'

import axios from 'axios'

import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import DefaultSelectBox from '@/components/selectbox/defaultSelectBox'

const PlanContent = ({ projectData, engineerOptions }: any) => {
  const [editData, setEditData] = useState(projectData || {})
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    console.log('engineers', { engineers: editData.machineProjectScheduleAndEngineerResponseDto.engineers })

    // 실제 API 호출 부분 (PUT/PATCH 등)
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${editData.machineProjectScheduleAndEngineerResponseDto.machineProjectId}/schedule`,
      editData.machineProjectScheduleAndEngineerResponseDto
    )

    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${editData.machineProjectScheduleAndEngineerResponseDto.machineProjectId}/machine-project-engineers`,
      { engineers: editData.machineProjectScheduleAndEngineerResponseDto.engineers }
    )

    alert('저장되었습니다.')
  }

  const handleEngineerChange = (idx: number, key: string, value: any) => {
    setEditData((prev: any) => {
      const engineers = prev.machineProjectScheduleAndEngineerResponseDto?.engineers
        ? [...prev.machineProjectScheduleAndEngineerResponseDto.engineers]
        : []

      // engineerId가 변경될 때 전체 엔지니어 정보로 덮어쓰기
      if (key === 'memberName' || key === 'engineerId') {
        const selectedEngineer = engineerOptions.find((eng: any) => eng.engineerId === value)

        if (selectedEngineer) {
          engineers[idx] = {
            ...engineers[idx],
            engineerId: selectedEngineer.engineerId,
            memberName: selectedEngineer.engineerName,
            gradeDescription: selectedEngineer.gradeDescription,
            officePositionDescription: selectedEngineer.officePositionDescription,
            licenseNum: selectedEngineer.engineerLicenseNum
          }
        }
      } else {
        // 일반 필드 변경
        engineers[idx] = {
          ...engineers[idx],
          [key]: value
        }
      }

      return {
        ...prev,
        machineProjectScheduleAndEngineerResponseDto: {
          ...prev.machineProjectScheduleAndEngineerResponseDto,
          engineers
        }
      }
    })
  }

  const handleEngineerDelete = (idx: number) => {
    setEditData((prev: any) => {
      const prevEngineers = prev.machineProjectScheduleAndEngineerResponseDto?.engineers || []
      const updatedEngineers = prevEngineers.filter((_: any, i: any) => i !== idx)

      return {
        ...prev,
        machineProjectScheduleAndEngineerResponseDto: {
          ...prev.machineProjectScheduleAndEngineerResponseDto,
          engineers: updatedEngineers
        }
      }
    })
  }

  const handleEngineerDateChange = (idx: number, key: 'beginDate' | 'endDate', date: Date | null) => {
    setEditData((prev: any) => {
      const engineers = prev.machineProjectScheduleAndEngineerResponseDto?.engineers
        ? [...prev.machineProjectScheduleAndEngineerResponseDto.engineers]
        : []

      engineers[idx] = {
        ...engineers[idx],
        [key]: date
      }

      return {
        ...prev,
        machineProjectScheduleAndEngineerResponseDto: {
          ...prev.machineProjectScheduleAndEngineerResponseDto,
          engineers
        }
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
        {isEditing ? (
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
                    점검일정
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
                      type='button'
                      onClick={() => {
                        handleSave()
                        setIsEditing(false)
                      }}
                    >
                      저장
                    </button>
                  </td>
                </tr>
                <tr>
                  <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    투입시작
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.fieldBeginDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            fieldBeginDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                  <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검시작
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.fieldEndDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            fieldEndDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    투입종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.fieldEndDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            fieldEndDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.endDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            endDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    보고서 마감일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.reportDeadline}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            reportDeadline: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    프로젝트 종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.projectEndDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            projectEndDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검종류
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <DefaultSelectBox
                      id={'projectStatusDescription'}
                      value={editData.machineProjectScheduleAndEngineerResponseDto.checkType || ''}
                      loading={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            checkType: e.target.value
                          }
                        }))
                      }
                      options={[
                        { value: 'COOLING', label: '냉방 점검' },
                        { value: 'HEATING', label: '난방 점검' }
                      ]}
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    건물등급
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <DefaultSelectBox
                      id={'projectStatusDescription'}
                      value={editData.machineProjectScheduleAndEngineerResponseDto.buildingGrade || ''}
                      loading={false}
                      onChange={(e: any) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            buildingGrade: e.target.value
                          }
                        }))
                      }
                      options={[
                        { value: 'BASIC', label: '초급' },
                        { value: 'INTERMEDIATE', label: '중급' },
                        { value: 'ADVANCED', label: '고급' }
                      ]}
                    />
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자 이메일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <CustomTextField
                      value={editData.machineProjectScheduleAndEngineerResponseDto.reportManagerEmail || ''}
                      onChange={e =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            reportManagerEmail: e.target.value
                          }
                        }))
                      }
                      fullWidth
                    />
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계산서 발급일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    <AppReactDatepicker
                      selected={editData?.machineProjectScheduleAndEngineerResponseDto.tiIssueDate}
                      onChange={(date: Date | null) =>
                        setEditData((prev: any) => ({
                          ...prev,
                          machineProjectScheduleAndEngineerResponseDto: {
                            ...prev.machineProjectScheduleAndEngineerResponseDto,
                            tiIssueDate: date
                          }
                        }))
                      }
                      placeholderText='Click to select a date'
                      customInput={<CustomTextField fullWidth />}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr style={{ background: '#f3f4f6' }}>
                  <th colSpan={7} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                    <div className='flex justify-between items-center'>
                      <p>참여 기술진</p>
                      <button
                        style={{
                          background: 'rgba(16, 52, 255, 1)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '100%',
                          padding: '5px 10px',
                          marginRight: 8,
                          cursor: 'pointer'
                        }}
                        type='button'
                        onClick={() => {
                          setEditData((prev: any) => {
                            const prevEngineers = prev.machineProjectScheduleAndEngineerResponseDto?.engineers || []

                            const newEngineer = {
                              memberName: '',
                              gradeDescription: '',
                              licenseNum: '',
                              beginDate: '',
                              endDate: '',
                              note: '',
                              version: 0
                            }

                            return {
                              ...prev,
                              machineProjectScheduleAndEngineerResponseDto: {
                                ...prev.machineProjectScheduleAndEngineerResponseDto,
                                engineers: [...prevEngineers, newEngineer]
                              }
                            }
                          })
                        }}
                      >
                        +
                      </button>
                    </div>
                  </th>
                </tr>
                <tr className='py-1'>
                  <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>성명</th>
                  <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>등급</th>
                  <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>수첩발급번호</th>
                  <th colSpan={2} style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                    참여기간
                  </th>
                  <th style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>비고</th>
                </tr>
                {(editData.machineProjectScheduleAndEngineerResponseDto.engineers || []).map(
                  (eng: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }} className='flex items-center gap-1'>
                        <DefaultSelectBox
                          id={'engineerNames'}
                          value={eng.engineerId || ''}
                          onChange={(e: any) => handleEngineerChange(idx, 'engineerId', e.target.value)}
                          options={engineerOptions.map((eng: any) => ({
                            value: eng.engineerId,
                            label: `${eng.engineerName} (${eng.gradeDescription}/${eng.officePositionDescription})`
                          }))}
                        />
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                        <CustomTextField value={eng.gradeDescription || ''} fullWidth />
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                        <CustomTextField value={eng.engineerLicenseNum || eng.licenseNum} fullWidth />
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                        <AppReactDatepicker
                          selected={eng.beginDate}
                          onChange={date => handleEngineerDateChange(idx, 'beginDate', date)}
                          placeholderText='Click to select a date'
                          customInput={<CustomTextField fullWidth />}
                        />
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                        <AppReactDatepicker
                          selected={eng.endDate}
                          onChange={date => handleEngineerDateChange(idx, 'endDate', date)}
                          placeholderText='Click to select a date'
                          customInput={<CustomTextField fullWidth />}
                        />
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db' }} className='flex items-center gap-2'>
                        <CustomTextField
                          value={eng.note || ''}
                          onChange={e => handleEngineerChange(idx, 'note', e.target.value)}
                          fullWidth
                        />
                        <button
                          style={{
                            background: 'rgba(243, 0, 0, 1)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '100%',
                            padding: '5px 10px',
                            marginRight: 8,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            handleEngineerDelete(idx)
                          }}
                          type='button'
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  )
                )}
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
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검일정
                  </th>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '10px 12px' }}>
                    <button
                      type='button'
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
                    투입시작
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.fieldBeginDate}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검시작
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.fieldEndDate}
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    투입종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.fieldEndDate}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    현장점검종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.endDate}
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    보고서 마감일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.reportDeadline}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    프로젝트 종료
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.projectEndDate}
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    점검종류
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.checkTypeDescription}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    건물등급
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.buildingGradeDescription}
                  </td>
                </tr>
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    담당자 이메일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.reportManagerEmail}
                  </td>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    계산서 발급일
                  </th>
                  <td style={{ padding: '10px 12px' }}>
                    {projectData.machineProjectScheduleAndEngineerResponseDto.tiIssueDate}
                  </td>
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
                  <th colSpan={6} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                    참여 기술진
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
                {(editData.machineProjectScheduleAndEngineerResponseDto.engineers || []).map(
                  (eng: any, idx: number) => (
                    <tr key={eng.engineerId || idx}>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.memberName}</p>
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.gradeDescription}</p>
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.licenseNum}</p>
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.beginDate ? new Date(eng.beginDate).toLocaleDateString() : ''}</p>
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.endDate ? new Date(eng.endDate).toLocaleDateString() : ''}</p>
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #d1d5db', wordBreak: 'break-all' }}>
                        <p>{eng.note}</p>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlanContent
