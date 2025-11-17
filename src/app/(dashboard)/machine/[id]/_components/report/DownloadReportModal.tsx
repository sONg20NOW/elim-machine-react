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
import { useGetReportCategories, useGetReportStatuses } from '@/@core/hooks/customTanstackQueries'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/utils/errorHandler'
import InspectionPerformanceModal from './InspectionPerformanceModal'
import type { MachineReportCategoryReadResponseDtoType, MachineReportStatusResponseDtoType } from '@/@core/types'

export default function DownloadReportModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const machineProjectId = useParams().id?.toString()

  // 설비별 성능점검표 모달
  const [openInspModal, setOpenInspModal] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)

  const reloadRef = useRef<HTMLElement>(null)
  const [disableReload, setDialbleReload] = useState(false)

  const { data: totalReportCategories } = useGetReportCategories()

  const reportCategories = totalReportCategories?.filter(
    v =>
      v.reportTemplateCode !== 'MACHINE_PROJECT_SUMMARY' && v.reportTemplateCode !== 'MACHINE_EQUIPMENT_CATEGORY_COVER'
  )

  const { data: statuses, refetch } = useGetReportStatuses(
    `${machineProjectId}`,
    reportCategories?.map(v => v.id) ?? []
  )

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
    reportCategories && (
      <>
        <Dialog fullWidth maxWidth='md' open={open}>
          <DialogTitle variant='h3' sx={{ position: 'relative' }}>
            보고서 다운로드
            {/* <Typography>※ 메모리 8GB 이상, 엑셀 2019 이상 버전의 설치가 필요합니다.</Typography> */}
            <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
              <i className='tabler-x' />
            </IconButton>
            <div className='flex items-center justify-between'>
              <DialogContentText>
                ※버튼이 비활성화된 경우 개인 PC에서 보고서 생성 후 업로드를 완료해주세요
              </DialogContentText>
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
          <DialogContent className={`${style.container} max-h-[50dvh]`}>
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th colSpan={1}>번호</th>
                  <th colSpan={8}>내용</th>
                  {/* <th colSpan={1}>생성</th> */}
                  <th colSpan={1}>다운로드</th>
                </tr>
              </thead>
              <tbody>
                {reportCategories?.map((category, idx) => (
                  <TableRow
                    key={category.id}
                    category={category}
                    idx={idx}
                    statuses={statuses ?? []}
                    setOpenInspModal={setOpenInspModal}

                    // setStatuses={setStatuses}
                    // setLoading={setLoading}
                  />
                ))}
              </tbody>
            </table>
          </DialogContent>
          <DialogActions className='flex items-center justify-center pt-4' sx={{ boxShadow: 10 }}>
            {/* <Button variant='contained' className='bg-sky-500 hover:bg-sky-600'>
              전체 다운로드
            </Button>
            <SettingButton /> */}
          </DialogActions>
        </Dialog>
        {openInspModal && <InspectionPerformanceModal open={openInspModal} setOpen={setOpenInspModal} />}
      </>
    )
  )
}

const TableRow = memo(
  ({
    category,
    idx,
    statuses,
    setOpenInspModal
  }: {
    category: MachineReportCategoryReadResponseDtoType
    idx: number
    statuses: MachineReportStatusResponseDtoType[]
    setOpenInspModal: (open: boolean) => void
  }) => {
    const machineProjectId = useParams().id?.toString()

    const aRef = useRef<HTMLAnchorElement>(null)
    const [loading, setLoading] = useState(false)

    const myStatus = statuses.find(status => status.machineReportCategoryId === category.id)

    const disabled = myStatus?.reportStatus !== 'COMPLETED' || loading

    const getReportPresignedUrl = useCallback(
      async (machineReportCategoryId: number) => {
        try {
          setLoading(true)

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
        } finally {
          setLoading(false)
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

    return (
      <tr key={category.id}>
        <th colSpan={1}>{idx + 1}</th>
        <td colSpan={8}>
          <div className='flex justify-between items-center'>
            <Tooltip
              slotProps={{ popper: { sx: { wordBreak: 'break-all' } } }}
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
              <span className='hover:underline underline-offset-3'>{category.name}</span>
            </Tooltip>
          </div>
        </td>
        {category.reportTemplateCode !== 'MACHINE_INSPECTION_PERFORMANCE' ? (
          <>
            <td colSpan={1} className='px-0'>
              <div className='grid place-items-center'>
                <a ref={aRef} download={'hi'}>
                  <Button className='bg-blue-500 hover:bg-blue-600 text-white  disabled:opacity-60' disabled={disabled}>
                    HWPX
                  </Button>
                </a>
              </div>
            </td>
          </>
        ) : (
          <td colSpan={1} className='px-1'>
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

// function SettingButton() {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <Button variant='contained' color='warning' onClick={() => setOpen(true)}>
//         환경설정
//       </Button>
//       {open && (
//         <Dialog open={open} maxWidth='xs' fullWidth>
//           <DialogTitle variant='h3'>
//             보고서 설정
//             <Divider />
//           </DialogTitle>
//           <DialogContent>
//             <div className='grid'>
//               <Typography variant='h6'>점검사진 (가로x세로)</Typography>
//               <div className='flex items-center'>
//                 <TextField sx={{ maxWidth: '20%' }} size='small' />
//                 <Typography sx={{ fontSize: 18, px: 2 }}>{'X'}</Typography>
//                 <TextField sx={{ maxWidth: '20%' }} size='small' />
//                 <Typography sx={{ fontSize: 18, paddingInlineStart: 2 }}>{'px'}</Typography>
//               </div>
//             </div>
//           </DialogContent>
//           <DialogActions>
//             <Button type='submit' variant='contained' className='bg-blue-400'>
//               확인
//             </Button>
//             <Button type='button' variant='contained' color='secondary' onClick={() => setOpen(false)}>
//               취소
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   )
// }
