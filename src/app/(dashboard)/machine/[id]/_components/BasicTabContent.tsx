import { useContext, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Button } from '@mui/material'

import axios from 'axios'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import { InputBox } from '@/@core/components/custom/InputBox'
import { MACHINE_INPUT_INFO } from '@/app/_constants/input/MachineInputInfo'
import type { MachineProjectResponseDtoType } from '@/@core/types'
import AlertModal from '@/@core/components/custom/AlertModal'
import { IsEditingContext } from '../page'
import DeleteModal from '@/@core/components/custom/DeleteModal'

const BasicTabContent = ({
  projectData,
  reloadData
}: {
  projectData: MachineProjectResponseDtoType
  reloadData: () => Promise<void>
}) => {
  const router = useRouter()

  const { isEditing, setIsEditing } = useContext(IsEditingContext)

  const params = useParams()

  const machineProjectId = params?.id as string

  // 초기값 세팅
  const [editData, setEditData] = useState<MachineProjectResponseDtoType>(JSON.parse(JSON.stringify(projectData)))
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const existChange = JSON.stringify(editData) !== JSON.stringify(projectData)

  if (!editData) {
    return <span>데이터를 찾을 수 없습니다.</span>
  }

  const handleSave = async () => {
    try {
      const result = await axios.put<{ data: MachineProjectResponseDtoType }>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}`,
        editData
      )

      setIsEditing(false)

      setEditData(result.data.data)
      reloadData()
      console.log('result:', result.data.data)
      handleSuccess('수정되었습니다.')
    } catch (error: any) {
      handleApiError(error, '데이터 저장에 실패했습니다.')

      return
    }
  }

  const handleDelete = async () => {
    try {
      if (!projectData) throw new Error()

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineProjectId}?version=${projectData.version}`
      )

      handleSuccess('해당 프로젝트가 삭제되었습니다.')
      router.push('/machine')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <div>
      <div className='flex mb-4 justify-between'>
        <div className='flex gap-[4px]'>
          {/* TODO: 버튼 구현 */}
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
          <Button
            variant='contained'
            color='success'
            disabled={true}
            onClick={() => {
              console.log('?')
            }}
          >
            점검의견서
          </Button>
          <Button
            variant='contained'
            color='primary'
            disabled={true}
            onClick={() => {
              console.log('?')
            }}
          >
            성능점검시 검토사항
          </Button>

          <Button
            variant='contained'
            color='warning'
            disabled={true}
            onClick={() => {
              console.log('?')
            }}
          >
            에너지 사용량
          </Button>

          <Button
            variant='contained'
            color='error'
            disabled={true}
            onClick={() => {
              console.log('?')
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
                    <div className='justify-end flex gap-2'>
                      <Button color='success' variant='contained' type='submit'>
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
                {/* 유지관리자/담당자 */}
                <tr style={{ background: '#f3f4f6' }}>
                  <th colSpan={4} align='left' style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16 }}>
                    계약사항 및 책임자
                  </th>
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
                    점검 업체
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
                      showLabel={false}
                      tabFieldKey='contractManager'
                      value={editData.contractManager ?? ''}
                      onChange={value => setEditData(prev => ({ ...prev, contractManager: value }))}
                      tabInfos={MACHINE_INPUT_INFO}
                    />
                    <InputBox
                      showLabel={false}
                      tabFieldKey='contractManagerTel'
                      value={editData.contractManagerTel ?? ''}
                      onChange={value => setEditData(prev => ({ ...prev, contractManagerTel: value }))}
                      tabInfos={MACHINE_INPUT_INFO}
                    />
                    <InputBox
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
                      showLabel={false}
                      tabFieldKey='contractPartner'
                      value={editData.contractPartner ?? ''}
                      onChange={value => setEditData(prev => ({ ...prev, contractPartner: value }))}
                      tabInfos={MACHINE_INPUT_INFO}
                    />
                    <InputBox
                      showLabel={false}
                      tabFieldKey='contractPartnerTel'
                      value={editData.contractPartnerTel ?? ''}
                      onChange={value => setEditData(prev => ({ ...prev, contractPartnerTel: value }))}
                      tabInfos={MACHINE_INPUT_INFO}
                    />
                    <InputBox
                      showLabel={false}
                      tabFieldKey='contractPartnerEmail'
                      value={editData.contractPartnerEmail ?? ''}
                      onChange={value => setEditData(prev => ({ ...prev, contractPartnerEmail: value }))}
                      tabInfos={MACHINE_INPUT_INFO}
                    />
                  </td>
                </tr>

                {/* 요구사항 */}
                <tr>
                  <th align='left' style={{ padding: '10px 12px', fontWeight: 600 }}>
                    요구사항
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
                        showLabel={false}
                        tabFieldKey={`machineMaintainer${i}Name`}
                        value={editData[`machineMaintainer${i}Name` as keyof typeof editData]?.toString() ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, [`machineMaintainer${i}Name`]: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
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
                        showLabel={false}
                        tabFieldKey={`machineManager${i}Name`}
                        value={editData[`machineManager${i}Name` as keyof typeof editData]?.toString() ?? ''}
                        onChange={value => setEditData(prev => ({ ...prev, [`machineManager${i}Name`]: value }))}
                        tabInfos={MACHINE_INPUT_INFO}
                      />
                      <InputBox
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

      {showAlertModal && (
        <AlertModal<MachineProjectResponseDtoType>
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          setEditData={setEditData}
          originalData={projectData}
          setIsEditing={setIsEditing}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default BasicTabContent
