import type { Dispatch, SetStateAction } from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { toast } from 'react-toastify'

import style from '@/app/_style/Table.module.css'
import { useGetReportCategories } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'
import InspectionPerformanceModal from './InspectionPerformanceModal'
import type { MachineReportCategoryReadResponseDtoType, MachineReportStatusResponseDtoType } from '@/@core/types'

export default function DownloadReportModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const machineProjectId = useParams().id?.toString()

  // 설비별 성능점검표 모달
  const [openInspModal, setOpenInspModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [statuses, setStatuses] = useState<MachineReportStatusResponseDtoType[]>([])

  const { data: reportCategories } = useGetReportCategories()

  // 최초에 상태 조회
  useEffect(() => {
    const getAllReportStatus = async () => {
      try {
        const reports = await auth
          .get<{
            data: { machineReports: MachineReportStatusResponseDtoType[] }
          }>(
            `/api/machine-projects/${machineProjectId}/machine-reports/status?machineReportCategoryIds=1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17`
          )
          .then(v => v.data.data.machineReports)

        console.log('최초에 리포트 상태 모두 가져오기', reports)
        setStatuses(reports)
      } catch (e) {
        handleApiError(e)
      }
    }

    getAllReportStatus()
  }, [machineProjectId])

  return (
    <>
      <Dialog fullWidth maxWidth='md' open={open}>
        <DialogTitle variant='h3' sx={{ position: 'relative' }}>
          보고서 다운로드
          {/* <Typography>※ 메모리 8GB 이상, 엑셀 2019 이상 버전의 설치가 필요합니다.</Typography> */}
          <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
            <i className='tabler-x' />
          </IconButton>
          <DialogContentText>※버튼이 비활성화된 경우 먼저 생성을 요청해주세요</DialogContentText>
          <Divider />
        </DialogTitle>
        <DialogContent className={`${style.container} max-h-[50dvh]`}>
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th colSpan={1}>번호</th>
                <th colSpan={8}>내용</th>
                <th colSpan={1}>생성</th>
                <th colSpan={1}>다운로드</th>
              </tr>
            </thead>
            <tbody>
              {reportCategories?.map((category, idx) => (
                <TableRow
                  key={category.id}
                  category={category}
                  idx={idx}
                  statuses={statuses}
                  setStatuses={setStatuses}
                  setOpenInspModal={setOpenInspModal}
                  setLoading={setLoading}
                />
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions className='flex items-center justify-center pt-4' sx={{ boxShadow: 10 }}>
          <Button variant='contained' className='bg-sky-500 hover:bg-sky-600'>
            전체 다운로드
          </Button>
          <SettingButton />
        </DialogActions>
        <Backdrop open={loading} sx={{ color: 'white' }}>
          <CircularProgress size={60} color='inherit' />
        </Backdrop>
      </Dialog>
      {openInspModal && <InspectionPerformanceModal open={openInspModal} setOpen={setOpenInspModal} />}
    </>
  )
}

const TableRow = memo(
  ({
    category,
    idx,
    statuses,
    setStatuses,
    setOpenInspModal,
    setLoading
  }: {
    category: MachineReportCategoryReadResponseDtoType
    idx: number
    statuses: MachineReportStatusResponseDtoType[]
    setStatuses: Dispatch<SetStateAction<MachineReportStatusResponseDtoType[]>>
    setOpenInspModal: (open: boolean) => void
    setLoading: (loading: boolean) => void
  }) => {
    const machineProjectId = useParams().id?.toString()

    const aRef = useRef<HTMLAnchorElement>(null)

    const disabled = statuses.find(v => v.machineReportCategoryId === category.id)?.reportStatus !== 'COMPLETED'

    const myStatus = statuses.find(status => status.machineReportCategoryId === category.id)

    const getReportPresignedUrl = useCallback(
      async (machineReportCategoryId: number) => {
        try {
          const presignedUrl = await auth
            .get<{
              data: { presignedUrl: string }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-reports/download?machineReportCategoryId=${machineReportCategoryId}`
            )
            .then(response => response.data.data.presignedUrl)

          console.log('presigned Url 가져옴:', presignedUrl)

          return presignedUrl
        } catch (e) {
          handleApiError(e)
        }
      },
      [machineProjectId]
    )

    useEffect(() => {
      async function setPresignedUrl() {
        if (myStatus?.reportStatus === 'COMPLETED') {
          if (!aRef.current) return

          const presignedUrl = await getReportPresignedUrl(category.id)

          if (!presignedUrl) return
          aRef.current.href = presignedUrl
        }
      }

      setPresignedUrl()
    }, [myStatus, category.id, getReportPresignedUrl])

    const requestReportCreate = useCallback(
      async (machineReportCategory: MachineReportCategoryReadResponseDtoType) => {
        const { mappedUrl, id: machineReportCategoryId } = machineReportCategory

        try {
          await auth.post(
            `api/machine-projects/${machineProjectId}/machine-reports/${mappedUrl}?machineReportCategoryId=${machineReportCategoryId}`
          )

          console.log('보고서 생성 요청 완료')

          return true

          // 보고서 생성 후 버튼에 href 추가.
          // URLS.current[machineReportCategoryId] =
        } catch (e) {
          handleApiError(e)

          return false
        }
      },
      [machineProjectId]
    )

    const getReportStatusUnit = useCallback(
      async (machineReportCategoryId: number) => {
        try {
          const reports = await auth
            .get<{
              data: { machineReports: MachineReportStatusResponseDtoType[] }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-reports/status?machineReportCategoryIds=${machineReportCategoryId}`
            )
            .then(v => v.data.data.machineReports)

          console.log('특정 리포트 상태 가져오기', reports)

          reports.forEach(report => {
            if (report) {
              setStatuses(prevStatuses => {
                const index = prevStatuses.findIndex(v => v.machineReportCategoryId === machineReportCategoryId)

                if (index !== -1) {
                  // 1. 기존 항목이 배열에 있으면 교체
                  return prevStatuses.map((v, i) => (i === index ? report : v))
                } else {
                  // 2. 기존 항목이 배열에 없으면 추가 (새로운 상태)
                  return [...prevStatuses, report]
                }
              })
              console.log('보고서 상태 변화 감지 및 업데이트 완료!')
            }
          })

          return reports
        } catch (e) {
          handleApiError(e)
        }
      },
      [machineProjectId, setStatuses]
    )

    const handleCreate = useCallback(
      async (machineReportCategory: MachineReportCategoryReadResponseDtoType) => {
        if (!aRef.current) return

        const { id: machineReportCategoryId } = machineReportCategory

        try {
          // 1. POST 날려서 리포트 생성
          const isReportCreated = await requestReportCreate(machineReportCategory)

          if (!isReportCreated) return

          setLoading(true)

          let isIntervalActive = true // 인터벌이 활성화되었다고 가정

          const intervalId = setInterval(async () => {
            // 2. 매 0.5초마다 report 상태 확인
            const machineReports = await getReportStatusUnit(machineReportCategoryId)

            if (!machineReports) {
              throw new Error(`보고서 생성 API가 실행되지 않았습니다\n관리자에게 문의해주세요`)
            }

            const report = machineReports?.find(v => v.machineReportCategoryId === machineReportCategory.id)

            if (!report) {
              throw new Error(`보고서가 생성되지 않았습니다\n관리자에게 문의해주세요`)
            }

            if (report.reportStatus === 'COMPLETED') {
              isIntervalActive = false

              const presignedUrl = await getReportPresignedUrl(machineReportCategory.id)

              if (!presignedUrl) return

              aRef.current!.href = presignedUrl

              toast.success('보고서 생성이 완료되었습니다.')
              setLoading(false)
              clearInterval(intervalId)
            }
          }, 500)

          setTimeout(() => {
            if (intervalId && isIntervalActive) {
              clearInterval(intervalId)
              setLoading(false) // 로딩 상태 해제

              // ⭐ 사용자에게 시간 초과 피드백 제공
              toast.error(`보고서 생성 확인 시간 초과\n(3초 경과)`)
            }
          }, 3000)
        } catch (e) {
          handleApiError(e)
        }
      },
      [getReportPresignedUrl, getReportStatusUnit, requestReportCreate, setLoading]
    )

    return (
      <tr key={category.id}>
        <th colSpan={1}>{idx + 1}</th>
        <td colSpan={8}>
          <div className='flex justify-between items-center'>
            <Tooltip
              title={
                myStatus ? (
                  <div className='grid text-white'>
                    <Typography variant='inherit'>{`보고서 이름 : ${myStatus.fileName}`}</Typography>
                    <Typography variant='inherit'>{`생성 여부 : ${{ FAILED: '실패', COMPLETED: '성공', PENDING: '생성중' }[myStatus.reportStatus]}`}</Typography>
                    <Typography variant='inherit'>{`생성 일시 : ${myStatus.updatedAt}`}</Typography>
                    <Typography
                      variant='inherit'
                      sx={{ fontSize: 10 }}
                      textAlign={'end'}
                    >{`보고서 ID : ${myStatus.latestMachineReportId}`}</Typography>
                  </div>
                ) : (
                  ''
                )
              }
              placement='right'
              arrow
            >
              <span className='hover:underline underline-offset-3'>{category.name}</span>
            </Tooltip>
          </div>
        </td>
        {category.id !== 15 ? (
          <>
            <td colSpan={1} className='px-0'>
              <div className='grid place-items-center relative'>
                <Button
                  variant='contained'
                  color='success'
                  onClick={async () => {
                    handleCreate(category)
                  }}
                >
                  생성
                </Button>

                {disabled && (
                  <div className='absolute top-[-3] right-[1.8px]'>
                    <span className='relative flex size-3'>
                      <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
                      <span className='relative inline-flex size-3 rounded-full bg-red-500 opacity-90'></span>
                    </span>
                  </div>
                )}
              </div>
            </td>
            <td colSpan={1} className='px-0'>
              <div className='grid place-items-center'>
                <a ref={aRef} download={'hi'}>
                  <Button className='bg-blue-500 hover:bg-blue-600 text-white  disabled:opacity-60' disabled={disabled}>
                    DOCX
                  </Button>
                </a>
              </div>
            </td>
          </>
        ) : (
          <td colSpan={2}>
            <div className='grid place-items-cetner'>
              <Button
                variant='outlined'
                type='button'
                onClick={() => {
                  setOpenInspModal(true)
                }}
              >
                설비확인
              </Button>
            </div>
          </td>
        )}
      </tr>
    )
  }
)

function SettingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant='contained' color='warning' onClick={() => setOpen(true)}>
        환경설정
      </Button>
      {open && (
        <Dialog open={open} maxWidth='xs' fullWidth>
          <DialogTitle variant='h3'>
            보고서 설정
            <Divider />
          </DialogTitle>
          <DialogContent>
            <div className='grid'>
              <Typography variant='h6'>점검사진 (가로x세로)</Typography>
              <div className='flex items-center'>
                <TextField sx={{ maxWidth: '20%' }} size='small' />
                <Typography sx={{ fontSize: 18, px: 2 }}>{'X'}</Typography>
                <TextField sx={{ maxWidth: '20%' }} size='small' />
                <Typography sx={{ fontSize: 18, paddingInlineStart: 2 }}>{'px'}</Typography>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button type='submit' variant='contained' className='bg-blue-400'>
              확인
            </Button>
            <Button type='button' variant='contained' color='secondary' onClick={() => setOpen(false)}>
              취소
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
