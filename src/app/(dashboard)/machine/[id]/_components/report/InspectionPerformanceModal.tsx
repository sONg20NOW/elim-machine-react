import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Tooltip,
  Typography
} from '@mui/material'

import style from '@/app/_style/Table.module.css'
import { useGetLeafCategories, useGetReportCategories, useGetReportStatuses } from '@/@core/hooks/customTanstackQueries'
import type { MachineLeafCategoryResponseDtoType, MachineReportStatusResponseDtoType } from '@/@core/types'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'

export default function InspectionPerformanceModal({
  open,
  setOpen
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const machineProjectId = useParams().id?.toString()

  const { data: reportCategories } = useGetReportCategories()

  const MACHINE_INSPECTION_PERFORMANCE_ID = reportCategories?.find(
    v => v.reportTemplateCode === 'MACHINE_INSPECTION_PERFORMANCE'
  )?.id as number

  const reloadRef = useRef<HTMLElement>(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [disableReload, setDialbleReload] = useState(false)

  const { data: everyCategories } = useGetLeafCategories()

  const categories = everyCategories

  const { data: statuses, refetch } = useGetReportStatuses(`${machineProjectId}`, [MACHINE_INSPECTION_PERFORMANCE_ID])

  const refetchStatuses = useCallback(async () => {
    reloadRef.current?.classList.add('animate-spin')
    setDialbleReload(true)
    setTimeout(() => {
      reloadRef.current?.classList.remove('animate-spin')
      setDialbleReload(false)
    }, 1000)
    await refetch()
    setOpenSnackBar(true)
  }, [refetch])

  return (
    everyCategories && (
      <Dialog fullWidth maxWidth='sm' open={open}>
        <DialogTitle variant='h3' sx={{ position: 'relative' }}>
          설비별 성능점검표
          {/* <Typography>※ 메모리 8GB 이상, 엑셀 2019 이상 버전의 설치가 필요합니다.</Typography> */}
          <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
            <i className='tabler-x' />
          </IconButton>
          <div className='flex items-center justify-between'>
            <DialogContentText>※버튼이 비활성화된 경우 먼저 GUI에서 생성을 요청해주세요</DialogContentText>
            <IconButton size='medium' disabled={disableReload}>
              <i ref={reloadRef} className='tabler-reload text-2xl text-green-500' onClick={refetchStatuses} />
            </IconButton>
            <Snackbar
              open={openSnackBar}
              autoHideDuration={1000}
              onClose={() => setOpenSnackBar(false)}
              message={
                <Typography variant='inherit' sx={{ fontSize: '16px' }}>
                  새로고침되었습니다
                </Typography>
              }
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
          </div>
          <Divider />
        </DialogTitle>
        <DialogContent className={`${style.container} max-h-[40dvh]`}>
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th colSpan={1}>번호</th>
                <th colSpan={4}>내용</th>
                {/* <th colSpan={1}>생성</th> */}
                <th colSpan={1}>다운로드</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((machineCategory, idx) => (
                <InspectionTableRow
                  key={machineCategory.id}
                  machineCategory={machineCategory}
                  idx={idx}
                  statuses={statuses ?? []}
                />
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions className='flex items-center justify-center pt-4' sx={{ boxShadow: 10 }}>
          {/* <Button variant='contained' className='bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300'>
            전체 다운로드
          </Button> */}
        </DialogActions>
      </Dialog>
    )
  )
}

const InspectionTableRow = memo(
  ({
    machineCategory,
    idx,
    statuses
  }: {
    machineCategory: MachineLeafCategoryResponseDtoType
    idx: number
    statuses: MachineReportStatusResponseDtoType[]
  }) => {
    const machineProjectId = useParams().id?.toString()

    const { data: reportCategories } = useGetReportCategories()

    const MACHINE_INSPECTION_PERFORMANCE_ID = reportCategories?.find(
      v => v.reportTemplateCode === 'MACHINE_INSPECTION_PERFORMANCE'
    )?.id as number

    const aRef = useRef<HTMLAnchorElement>(null)
    const [loading, setLoading] = useState(false)

    const ourStatus = statuses.filter(status => status.machineCategoryId === machineCategory.id)
    const myStatus = ourStatus?.find(status => status.machineCategoryId === machineCategory.id)

    const disabled = myStatus?.reportStatus !== 'COMPLETED' || loading

    const getReportPresignedUrl = useCallback(
      async (machineCategoryId: number) => {
        try {
          setLoading(true)

          const presignedUrl = await auth
            .get<{
              data: { presignedUrl: string }
            }>(
              `/api/machine-projects/${machineProjectId}/machine-reports/download?machineReportCategoryId=${MACHINE_INSPECTION_PERFORMANCE_ID}&machineCategoryId=${machineCategoryId}`
            )
            .then(response => response.data.data.presignedUrl)

          console.log('presigned Url 가져옴:', presignedUrl)

          return presignedUrl
        } catch (e) {
          handleApiError(e)
        } finally {
          setLoading(false)
        }
      },
      [machineProjectId, MACHINE_INSPECTION_PERFORMANCE_ID]
    )

    useEffect(() => {
      async function setPresignedUrl() {
        if (myStatus?.reportStatus === 'COMPLETED') {
          if (!aRef.current) return

          const presignedUrl = await getReportPresignedUrl(machineCategory.id)

          if (!presignedUrl) return
          aRef.current.href = presignedUrl
        }
      }

      setPresignedUrl()
    }, [myStatus, machineCategory.id, getReportPresignedUrl])

    return (
      <tr key={machineCategory.id}>
        <th colSpan={1}>{idx + 1}</th>
        <td colSpan={4}>
          <div className='flex justify-between items-center'>
            <Tooltip
              title={
                myStatus ? (
                  <div className='grid text-white'>
                    <Typography
                      variant='inherit'
                      sx={{ fontSize: 10 }}
                      textAlign={'end'}
                    >{`보고서 ID : ${myStatus.latestMachineReportId}`}</Typography>
                    <Typography variant='inherit'>{`보고서 이름 : ${myStatus.fileName}`}</Typography>
                    <Typography variant='inherit'>{`생성 여부 : ${{ FAILED: '실패', COMPLETED: '성공', PENDING: '생성중' }[myStatus.reportStatus]}`}</Typography>
                    <Typography variant='inherit'>{`생성 일시 : ${myStatus.updatedAt}`}</Typography>
                  </div>
                ) : (
                  ''
                )
              }
              placement='right'
              arrow
            >
              <span className='hover:underline underline-offset-3'>{machineCategory.name}</span>
            </Tooltip>
          </div>
        </td>
        <td colSpan={1} className='px-0'>
          <div className='grid place-items-center'>
            <a ref={aRef} download={'hi'}>
              <Button className='bg-blue-500 hover:bg-blue-600 text-white  disabled:opacity-60' disabled={disabled}>
                HWPX
              </Button>
            </a>
          </div>
        </td>
      </tr>
    )
  }
)
