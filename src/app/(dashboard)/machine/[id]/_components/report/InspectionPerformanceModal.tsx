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
  Tooltip,
  Typography
} from '@mui/material'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import { IconX } from '@tabler/icons-react'

import styles from '@core/styles/customTable.module.css'
import { useGetLeafCategories, useGetReportCategories, useGetReportStatuses } from '@core/hooks/customTanstackQueries'
import type { MachineLeafCategoryResponseDtoType, MachineReportStatusResponseDtoType } from '@core/types'
import { auth } from '@core/utils/auth'
import { handleApiError } from '@core/utils/errorHandler'
import ReloadButton from '../ReloadButton'

export default function InspectionPerformanceModal() {
  const [open, setOpen] = useState(false)

  const machineProjectId = useParams().id?.toString()

  const { data: reportCategories } = useGetReportCategories()

  const MACHINE_INSPECTION_PERFORMANCE_ID = reportCategories?.find(
    v => v.reportTemplateCode === 'MACHINE_INSPECTION_PERFORMANCE'
  )?.id as number

  const [loading, setLoading] = useState(false)

  const reportURLs = useRef<{ machineCategoryId: number; index: number; url: string }[]>([])

  const { data: everyCategories } = useGetLeafCategories()

  const { data: statuses, refetch } = useGetReportStatuses(`${machineProjectId}`, [MACHINE_INSPECTION_PERFORMANCE_ID])

  const handleSetPresigned = useCallback((machineCategoryId: number, index: number, url: string) => {
    reportURLs.current = [...reportURLs.current, { url, machineCategoryId, index }]
  }, [])

  const handleDownloadAll = async () => {
    if (!everyCategories) return

    setLoading(true)
    const zip = new JSZip()

    // 병렬 다운로드 (presigned URL -> Blob)
    const filePromises = reportURLs.current.map(async ({ machineCategoryId, url, index }) => {
      const res = await fetch(url)

      if (res.status !== 200) {
        return
      }

      const blob = await res.blob()

      // 파일 이름 안전하게 처리
      const category = everyCategories.find(v => v.id === Number(machineCategoryId))!
      const safeName = category.name.replace(/[\/\\?%*:|"<>]/g, '-')

      zip.file(`${MACHINE_INSPECTION_PERFORMANCE_ID}-${index}. ${safeName}.hwp`, blob)
    })

    await Promise.all(filePromises)

    const content = await zip.generateAsync({ type: 'blob' })

    saveAs(content, '설비별 성능점검표 전체 보고서.zip')
    console.log(reportURLs.current)
    setLoading(false)
  }

  return (
    everyCategories && (
      <>
        <Button
          variant='outlined'
          type='button'
          onClick={() => {
            setOpen(true)
          }}
        >
          설비확인
        </Button>
        <Dialog fullWidth maxWidth='sm' open={open}>
          <DialogTitle variant='h3' sx={{ position: 'relative' }}>
            설비별 성능점검표
            {/* <Typography>※ 메모리 8GB 이상, 엑셀 2019 이상 버전의 설치가 필요합니다.</Typography> */}
            <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
              <IconX />
            </IconButton>
            <div className='flex items-center justify-between'>
              <DialogContentText>
                ※버튼이 비활성화된 경우 개인 PC에서 보고서 생성 후 업로드를 완료해주세요
              </DialogContentText>
              <ReloadButton handleClick={refetch} tooltipText='보고서 상태 새로고침' />
            </div>
            <Divider />
          </DialogTitle>
          <DialogContent className={`${styles.container} max-h-[40dvh]`}>
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
                {everyCategories?.map((machineCategory, idx) => (
                  <InspectionTableRow
                    key={machineCategory.id}
                    machineCategory={machineCategory}
                    idx={idx}
                    statuses={statuses ?? []}
                    onPresignedLoaded={handleSetPresigned}
                  />
                ))}
              </tbody>
            </table>
          </DialogContent>
          <DialogActions className='flex items-center justify-center pt-4' sx={{ boxShadow: 10 }}>
            <Button
              variant='contained'
              className='bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300'
              type='button'
              onClick={handleDownloadAll}
              disabled={loading}
            >
              전체 다운로드(ZIP)
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  )
}

const InspectionTableRow = memo(
  ({
    machineCategory,
    idx,
    statuses,
    onPresignedLoaded
  }: {
    machineCategory: MachineLeafCategoryResponseDtoType
    idx: number
    statuses: MachineReportStatusResponseDtoType[]
    onPresignedLoaded: (machineCategoryId: number, index: number, url: string) => void
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

          onPresignedLoaded(machineCategory.id, idx + 1, presignedUrl)
        }
      }

      setPresignedUrl()
    }, [myStatus, machineCategory.id, getReportPresignedUrl, idx, onPresignedLoaded])

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
                HWP
              </Button>
            </a>
          </div>
        </td>
      </tr>
    )
  }
)
