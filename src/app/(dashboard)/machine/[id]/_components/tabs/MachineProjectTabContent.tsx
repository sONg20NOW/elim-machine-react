import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Button, Checkbox, Typography } from '@mui/material'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { InputBox } from '@/@core/components/custom/InputBox'
import { MACHINE_INPUT_INFO } from '@/app/_constants/input/machineInputInfo'
import type { MachineProjectResponseDtoType } from '@/@core/types'
import AlertModal from '@/@core/components/custom/AlertModal'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import EnergyReport from '../report/EnergyReportModal'
import DownloadReportModal from '../report/DownloadReportModal'
import ChecklistResultSummaryModal from '../report/ChecklistResultSummaryModal'
import useMachineIsEditingStore from '@/@core/utils/useMachineIsEditingStore'
import { useGetMachineProject } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import MachinePerformanceReviewModal from '../report/MachinePerformanceReviewModal'

const BasicTabContent = ({}: {}) => {
  const router = useRouter()

  const { isEditing, setIsEditing } = useMachineIsEditingStore()
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const machineProjectId = params?.id as string

  const { data: projectData, refetch: refetchProjectData } = useGetMachineProject(machineProjectId)

  // 초기값 세팅
  const [editData, setEditData] = useState<MachineProjectResponseDtoType>(JSON.parse(JSON.stringify(projectData)))
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const existChange = JSON.stringify(editData) !== JSON.stringify(projectData)

  // 프로젝트 이름 변경 시 버전 충돌 방지
  useEffect(() => {
    if (!projectData) return
    setEditData(prev => ({ ...prev, version: projectData.version }))
  }, [projectData])

  const handleSave = async () => {
    try {
      setLoading(true)

      const result = await auth.put<{ data: MachineProjectResponseDtoType }>(
        `/api/machine-projects/${machineProjectId}`,
        editData
      )

      setIsEditing(false)

      setEditData(result.data.data)
      refetchProjectData()
      console.log('result:', result.data.data)
      handleSuccess('수정되었습니다.')
    } catch (error: any) {
      handleApiError(error, '데이터 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

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

  if (!editData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  return (
    projectData && (
      <div className='h-full flex flex-col'>
        {/* 상단 버튼들 : 점검의견서, 성능점검시 검토사항 ... */}
        <div className='flex mb-4 justify-between'>
          <div className='flex gap-[4px]'>
            {/* <Button
            variant='contained'
            color='info'
            disabled={true}
            onClick={() => {
              console.log('?')
            }}
          >
            입수자료
          </Button> */}
            <ChecklistResultSummaryModal machineProjectName={projectData.machineProjectName} />
            <MachinePerformanceReviewModal machineProjectName={projectData.machineProjectName} />

            <EnergyReport />
            <Button
              variant='contained'
              className='bg-blue-500 hover:bg-blue-600 hover:shadow-3'
              onClick={() => {
                setShowDownloadModal(true)
              }}
            >
              보고서 다운로드
            </Button>
          </div>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setShowDeleteModal(true)
            }}
          >
            설비현장 삭제
          </Button>
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
                      <div className='justify-end flex gap-2'>
                        <Button color='success' variant='contained' type='submit' disabled={loading}>
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
                              setEditData(JSON.parse(JSON.stringify(projectData)))
                              setIsEditing(false)
                            }
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* 기관명 */}
                  <tr>
                    <td align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      기관명
                    </td>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='institutionName'
                        value={editData?.institutionName ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, institutionName: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 주소 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      주소
                    </th>
                    <td colSpan={2} className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='roadAddress'
                        value={editData.roadAddress ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, roadAddress: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 대표자 / 연면적 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      대표자
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='representative'
                        value={editData.representative ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, representative: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연면적(㎡)
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='grossArea'
                        value={editData.grossArea?.toString() ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, grossArea: Number(value) }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 사업자번호 / 세대수 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      사업자번호
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='bizno'
                        value={editData.bizno ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, bizno: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      세대수
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='houseCnt'
                        value={editData.houseCnt?.toString() ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, houseCnt: Number(value) }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 용도 / 담당자 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      용도
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='purpose'
                        value={editData.purpose ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, purpose: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      담당자
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='manager'
                        value={editData.manager ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, manager: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 건물구조 / 연락처 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      건물구조
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='structure'
                        value={editData.structure ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, structure: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      연락처
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='managerPhone'
                        value={editData.managerPhone ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, managerPhone: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 전화번호 / 준공일 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      전화번호
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='tel'
                        value={editData.tel ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, tel: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      준공일
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='completeDate'
                        value={editData.completeDate ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, completeDate: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>
                  {/* 요청사항 */}
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      요청사항
                    </th>
                    <td colSpan={3} className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='requirement'
                        value={editData.requirement ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, requirement: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>
                  {/* 유지관리자/담당자 */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={3} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                      계약사항 및 책임자
                    </th>
                    <td className='grid place-items-end items-center'>
                      <div className='flex items-center'>
                        <Typography color='primary.dark' variant='h6'>
                          부가세 포함
                        </Typography>
                        <Checkbox
                          checked={editData.vatIncludedYn === 'Y'}
                          onChange={(_, checked) => {
                            setEditData(prev => ({ ...prev, vatIncludedYn: checked ? 'Y' : 'N' }))
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약일
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='contractDate'
                        value={editData.contractDate ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractDate: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      진행 상태
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='projectStatus'
                        value={editData.projectStatus ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, projectStatus: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약금액
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='contractPrice'
                        value={editData.contractPrice?.toString() ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractPrice: Number(value) }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      점검업체
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        showLabel={false}
                        tabFieldKey='companyName'
                        value={editData.companyName ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, companyName: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 계약담당자 */}
                  <tr className='border solid'>
                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약담당자
                    </th>
                    <td className='pe-4 border-r solid'>
                      <InputBox
                        placeholder='이름'
                        showLabel={false}
                        tabFieldKey='contractManager'
                        value={editData.contractManager ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractManager: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
                        placeholder='전화번호'
                        showLabel={false}
                        tabFieldKey='contractManagerTel'
                        value={editData.contractManagerTel ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractManagerTel: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
                        placeholder='이메일'
                        showLabel={false}
                        tabFieldKey='contractManagerEmail'
                        value={editData.contractManagerEmail ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractManagerEmail: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>

                    <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                      계약상대자
                    </th>
                    <td className='pe-4'>
                      <InputBox
                        placeholder='이름'
                        showLabel={false}
                        tabFieldKey='contractPartner'
                        value={editData.contractPartner ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractPartner: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
                        placeholder='전화번호'
                        showLabel={false}
                        tabFieldKey='contractPartnerTel'
                        value={editData.contractPartnerTel ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractPartnerTel: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
                        placeholder='이메일'
                        showLabel={false}
                        tabFieldKey='contractPartnerEmail'
                        value={editData.contractPartnerEmail ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, contractPartnerEmail: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                    </td>
                  </tr>

                  {/* 유지관리자/담당자 */}
                  <tr style={{ background: '#f3f4f6' }}>
                    <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                      유지관리자 및 담당자
                    </th>
                  </tr>
                  {['1', '2', '3'].map(i => (
                    <tr key={i} className='border solid '>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        유지관리자{i}
                      </th>
                      <td className='pe-4 border-r solid'>
                        <InputBox
                          placeholder='이름'
                          showLabel={false}
                          tabFieldKey={`machineMaintainer${i}Name`}
                          value={editData[`machineMaintainer${i}Name` as keyof typeof editData]?.toString() ?? ''}
                          onChange={value => setEditData(prev => ({ ...prev, [`machineMaintainer${i}Name`]: value }))}
                          tabInfos={MACHINE_INPUT_INFO}
                        />
                        <InputBox
                          placeholder='정보'
                          showLabel={false}
                          tabFieldKey={`machineMaintainer${i}Info`}
                          value={editData[`machineMaintainer${i}Info` as keyof typeof editData]?.toString() ?? ''}
                          onChange={value => setEditData(prev => ({ ...prev, [`machineMaintainer${i}Info`]: value }))}
                          tabInfos={MACHINE_INPUT_INFO}
                        />
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자{i}
                      </th>
                      <td className='pe-4'>
                        <InputBox
                          placeholder='이름'
                          showLabel={false}
                          tabFieldKey={`machineManager${i}Name`}
                          value={editData[`machineManager${i}Name` as keyof typeof editData]?.toString() ?? ''}
                          onChange={value => setEditData(prev => ({ ...prev, [`machineManager${i}Name`]: value }))}
                          tabInfos={MACHINE_INPUT_INFO}
                        />
                        <InputBox
                          placeholder='정보'
                          showLabel={false}
                          tabFieldKey={`machineManager${i}Info`}
                          value={editData[`machineManager${i}Info` as keyof typeof editData]?.toString() ?? ''}
                          onChange={value => setEditData(prev => ({ ...prev, [`machineManager${i}Info`]: value }))}
                          tabInfos={MACHINE_INPUT_INFO}
                        />
                      </td>
                    </tr>
                  ))}
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
                        <Button
                          variant='contained'
                          color='primary'
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
                        기관명
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {editData?.institutionName ? editData?.institutionName : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        주소
                      </th>
                      <td colSpan={3} style={{ padding: '10px 12px' }}>
                        {editData?.roadAddress ? editData?.roadAddress : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        대표자
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.representative ? editData.representative : '-'}
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        연면적(㎡)
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.grossArea ? editData.grossArea : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        사업자번호
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.bizno ? editData.bizno : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        세대수
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.houseCnt ? editData.houseCnt : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        용도
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.purpose ? editData.purpose : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.manager ? editData.manager : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        건물구조
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.structure ? editData.structure : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        연락처
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.managerPhone ? editData.managerPhone : '-'}</td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        전화번호
                      </th>
                      <td style={{ padding: '10px 12px' }}>{editData.tel ? editData.tel : '-'}</td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        준공일
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.completeDate ? new Date(editData.completeDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                    <tr style={{ height: '114px' }}>
                      <th rowSpan={1} align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        요청사항
                      </th>
                      <td rowSpan={1} colSpan={3} style={{ padding: '10px 12px', minHeight: 200 }}>
                        <p>{editData.requirement ? editData.requirement : '-'}</p>
                      </td>
                    </tr>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th colSpan={3} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                        계약사항 및 책임자
                      </th>
                      <td className='grid place-items-end items-center'>
                        <div className='flex items-center'>
                          <Typography color='primary.dark' variant='h6' sx={{ opacity: '70%' }}>
                            부가세 포함
                          </Typography>
                          <Checkbox checked={editData.vatIncludedYn === 'Y'} disabled />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약일
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.contractDate ? new Date(editData.contractDate).toLocaleDateString() : '-'}
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        진행상태
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.projectStatusDescription ? editData.projectStatusDescription : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약금액
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.contractPrice?.toLocaleString()
                          ? `${editData.contractPrice?.toLocaleString()}원`
                          : '-'}
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
                        {editData.contractManager ? editData.contractManager : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.contractManagerTel ? editData.contractManagerTel : '-'}
                        </span>
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.contractManagerEmail ? editData.contractManagerEmail : '-'}
                        </span>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        계약상대자
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.contractPartner ? editData.contractPartner : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.contractPartnerTel ? editData.contractPartnerTel : '-'}
                        </span>
                        <br />
                        <span style={{ color: '#888' }}>
                          {' '}
                          {editData.contractPartnerEmail ? editData.contractPartnerEmail : '-'}
                        </span>
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
                        {editData.machineMaintainer1Name ? editData.machineMaintainer1Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineMaintainer1Info ? editData.machineMaintainer1Info : '-'}
                        </span>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자1
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.machineManager1Name ? editData.machineManager1Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineManager1Info ? editData.machineManager1Info : '-'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        유지관리자2
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.machineMaintainer2Name ? editData.machineMaintainer2Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineMaintainer2Info ? editData.machineMaintainer2Info : '-'}
                        </span>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자2
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.machineManager2Name ? editData.machineManager2Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineManager2Info ? editData.machineManager2Info : '-'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        유지관리자3
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.machineMaintainer3Name ? editData.machineMaintainer3Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineMaintainer3Info ? editData.machineMaintainer3Info : '-'}
                        </span>
                      </td>
                      <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                        담당자3
                      </th>
                      <td style={{ padding: '10px 12px' }}>
                        {editData.machineManager3Name ? editData.machineManager3Name : '-'}
                        <br />
                        <span style={{ color: '#888' }}>
                          {editData.machineManager3Info ? editData.machineManager3Info : '-'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </form>
        </div>

        {showAlertModal && (
          <AlertModal<MachineProjectResponseDtoType>
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            setEditData={setEditData}
            originalData={projectData}
            setIsEditing={setIsEditing}
          />
        )}
        {showDeleteModal && <DeleteModal open={showDeleteModal} setOpen={setShowDeleteModal} onDelete={handleDelete} />}
        {showDownloadModal && <DownloadReportModal open={showDownloadModal} setOpen={setShowDownloadModal} />}
      </div>
    )
  )
}

export default BasicTabContent
