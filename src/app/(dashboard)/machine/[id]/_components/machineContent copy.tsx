import { useEffect, useState } from 'react'

import { Button, TablePagination } from '@mui/material'

import MachineDetailModal from './machineDetailModal'
import AddMachineModal from './addMachineModal'
import { PageSizeOptions } from '@/app/_constants/options'

const MachineContent = ({ id }: any) => {
  // 설비목록 탭
  const [open, setOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [addMachineModalOpen, setAddMachineModalOpen] = useState(false)

  const [machineData, setMachineData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 페이지네이션 상태
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const initMachine = async (machineId: string, currentPage: number = 0, currentPageSize: number = 10) => {
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineId}/machine-inspections?page=${currentPage}&size=${currentPageSize}`,
        {
          method: 'GET'
        }
      )

      const result = await response.json()

      setMachineData(result.data)
      setTotalCount(result.data.page.totalElements)
    } catch (error) {
      console.error('Failed to load machine data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 변경 핸들러
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)

    if (id) {
      initMachine(id, newPage, pageSize)
    }
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10)

    setPageSize(newPageSize)
    setPage(0) // 페이지 크기 변경시 첫 페이지로 이동

    if (id) {
      initMachine(id, 0, newPageSize)
    }
  }

  // 설비 추가 후 데이터 새로고침 함수
  const handleAddMachineSuccess = () => {
    if (id) {
      // 현재 페이지와 페이지 크기로 다시 로드
      initMachine(id, page, pageSize)
    }
  }

  useEffect(() => {
    if (id) {
      setPage(0) // 새로운 프로젝트 로드시 첫 페이지로 초기화
      initMachine(id, 0, pageSize)
    }
  }, [id])

  const handleRowClick = (item: any) => {
    setSelectedMachine(item)
    setOpen(true)
  }

  console.log('machineData', machineData)

  return (
    <div style={{ marginTop: 16 }}>
      <div className='flex mb-4 gap-[4px]'>
        <Button
          variant='contained'
          color='info'
          onClick={() => {
            console.log('?')
          }}
        >
          점검대상 및 수량
        </Button>
        <Button
          variant='contained'
          color='success'
          onClick={() => {
            setAddMachineModalOpen(true)
          }}
        >
          설비 추가
        </Button>
        <Button
          variant='contained'
          color='error'
          onClick={() => {
            console.log('?')
          }}
        >
          삭제
        </Button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>번호</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>분류</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>설비명</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>사진</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>용도</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>위치</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>점검일</th>
            <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>점검자</th>
          </tr>
        </thead>
        <tbody>
          {machineData?.content?.map((item: any, idx: number) => (
            <tr
              key={item.machineInspectionId || idx}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRowClick(item)}
            >
              <td style={{ padding: '6px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                {page * pageSize + idx + 1}
              </td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>{item.machineParentCateName}</td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>{item.machineInspectionName}</td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                {item.machinePicCount}
              </td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>{item.purpose}</td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>{item.location}</td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>{item.checkDate}</td>
              <td style={{ padding: '6px', border: '1px solid #d1d5db' }}>
                {(item.engineerInfos || []).map((eng: any) => eng.machineEngineerName).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TablePagination
        rowsPerPageOptions={PageSizeOptions}
        component='div'
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
        disabled={loading}
        showFirstButton
        showLastButton
        labelRowsPerPage='페이지당 행 수:'
        labelDisplayedRows={({ from, to, count }) => `${count !== -1 ? count : `${to} 이상`}개 중 ${from}-${to}개`}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiTablePagination-toolbar': {
            paddingLeft: 2,
            paddingRight: 2
          }
        }}
      />
      {/* 설비 중 하나 눌렀을 때 */}
      <MachineDetailModal id={id} open={open} setOpen={setOpen} selectedMachineData={selectedMachine} />

      {/* 설치 추가 눌렀을 때 */}
      <AddMachineModal
        open={addMachineModalOpen}
        setOpen={setAddMachineModalOpen}
        id={id}
        reloadData={handleAddMachineSuccess}
      />
    </div>
  )
}

export default MachineContent
