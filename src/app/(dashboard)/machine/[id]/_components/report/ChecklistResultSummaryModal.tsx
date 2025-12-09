import { useContext, useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  styled,
  Tab,
  TextField,
  Typography
} from '@mui/material'

import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import TabList from '@mui/lab/TabList'

import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import { IconX } from '@tabler/icons-react'

import styles from '@/app/_style/Table.module.css'
import { useGetInspectionOpinions } from '@core/hooks/customTanstackQueries'
import { auth } from '@core/utils/auth'
import { handleApiError } from '@core/utils/errorHandler'
import { MacinheProjectNameContext } from '../tabs/MachineProjectTabContent'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  fontSize: theme.typography.h5.fontSize
}))

interface formType {
  inspectionResultOverallOpinion: string
  performanceInspectionReportResult: string
}

export default function ChecklistResultSummaryModal() {
  const machineProjectName = useContext(MacinheProjectNameContext)
  const { id } = useParams()
  const machineProjectId = id?.toString()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(0)

  const { data: inspectionSummary, refetch } = useGetInspectionOpinions(machineProjectId!)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, isDirty }
  } = useForm<formType>({
    defaultValues: {
      inspectionResultOverallOpinion: inspectionSummary?.inspectionResultOverallOpinion ?? '',
      performanceInspectionReportResult: inspectionSummary?.performanceInspectionReportResult ?? ''
    }
  })

  useEffect(() => {
    async function RefetchAndReset() {
      const { data: response } = await refetch()

      reset(response)

      setValue(0)
    }

    RefetchAndReset()
  }, [open, refetch, reset])

  const handleSave = async (data: formType) => {
    const message = []

    try {
      if (dirtyFields.performanceInspectionReportResult) {
        const response = await auth
          .patch<{
            data: { performanceInspectionReportResult: string }
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspection-opinions/performance-inspection-report-result`,
            { performanceInspectionReportResult: data.performanceInspectionReportResult }
          )
          .then(v => v.data.data.performanceInspectionReportResult)

        reset({
          performanceInspectionReportResult: response,
          inspectionResultOverallOpinion: getValues().inspectionResultOverallOpinion
        })

        message.push('점검결과')
      }

      if (dirtyFields.inspectionResultOverallOpinion) {
        const response = await auth
          .patch<{
            data: { inspectionResultOverallOpinion: string }
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspection-opinions/inspection-result-overall-opinion`,
            {
              inspectionResultOverallOpinion: data.inspectionResultOverallOpinion
            }
          )
          .then(v => v.data.data.inspectionResultOverallOpinion)

        reset({
          inspectionResultOverallOpinion: response,
          performanceInspectionReportResult: getValues().performanceInspectionReportResult
        })

        message.push('종합의견')
      }
    } catch (e) {
      handleApiError(e)
    }

    if (message.length > 0) toast.success(`${message.join('와 ')}이 업데이트 되었습니다.`)
  }

  return (
    <>
      <Button
        type='button'
        variant='contained'
        color='success'
        onClick={() => {
          setOpen(true)
        }}
      >
        점검의견서
      </Button>
      <Dialog fullWidth maxWidth={'md'} open={open}>
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogTitle variant='h3' sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 2 }}>
              점검의견서{' '}
              <Typography variant='h5' sx={{ color: 'gray' }}>
                {machineProjectName}
              </Typography>
              <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
                <IconX />
              </IconButton>
            </Box>
            <Divider />
          </DialogTitle>
          <DialogContent
            className={`${styles.container}`}
            sx={{ height: '70dvh', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <TabContext value={value}>
              <AppBar position='static' color='success' sx={{ mb: 4 }}>
                <TabList
                  onChange={(_, newValue) => setValue(newValue)}
                  indicatorColor='secondary'
                  sx={{ color: 'white' }}
                  textColor='inherit'
                >
                  {[
                    { title: '설비별 점검내용 요약', value: 0 },
                    { title: '점검내용요약 종합의견', value: 1 },
                    { title: '성능점검결과보고서 점검결과', value: 2 }
                  ].map(v => (
                    <StyledTab key={v.value} label={v.title} value={v.value} />
                  ))}
                </TabList>
              </AppBar>
              <TabPanel value={0} sx={{ height: '100%', overflowY: 'auto' }}>
                {inspectionSummary?.machineInspectionSummaryResponseDto?.summaryElements &&
                inspectionSummary?.machineInspectionSummaryResponseDto?.summaryElements.length > 0 ? (
                  <table style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th colSpan={3}>구분</th>
                        <th>점검결과</th>
                        <th colSpan={5}>조치필요사항</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionSummary?.machineInspectionSummaryResponseDto?.summaryElements.map(value => (
                        <tr key={value.machineTopCategoryName}>
                          <td colSpan={3}>{value.machineTopCategoryName}</td>
                          <td>
                            <div className='grid place-items-center'>
                              {{ NONE: '/', PASS: 'O', FAIL: 'X' }[value.inspectionResult]}
                            </div>
                          </td>
                          <td colSpan={5}>
                            {JSON.stringify(value.actionRequired) !== JSON.stringify({}) ? (
                              <table>
                                <tbody>
                                  {Object.keys(value.actionRequired).map((key, idx) => (
                                    <tr key={key}>
                                      <th style={{ whiteSpace: 'nowrap', width: '1px' }}>{idx + 1}</th>
                                      <td style={{ whiteSpace: 'nowrap', width: '1px', fontWeight: 'normal' }}>
                                        {key}
                                      </td>
                                      <td>{value.actionRequired[key]}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className='grid place-items-center'>
                                <span>-</span>
                              </div>
                            )}
                          </td>
                          {/* <td >{value.actionRequired}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className='grid place-items-center h-full'>
                    <Typography>조회된 설비가 없습니다</Typography>
                  </div>
                )}
              </TabPanel>
              <TabPanel sx={{ height: '90%' }} value={1}>
                <TextField
                  {...register('inspectionResultOverallOpinion')}
                  placeholder='종합의견을 작성해주세요'
                  fullWidth
                  multiline
                  sx={{
                    height: '100%', // TextField 컨테이너 전체 높이를 100%로 설정
                    // 내부 입력 요소(textarea)의 스타일을 조정하여 높이를 맞춥니다.
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start' // 입력 커서와 내용이 위에서 시작하도록 정렬
                    },

                    // 실제 textarea 요소에 높이를 100%로 적용하여 공간을 모두 차지하게 합니다.
                    '& textarea': {
                      height: '100% !important' // 중요: 높이 100% 강제 적용
                    }
                  }}
                  slotProps={{ input: { sx: { fontSize: 18 } } }}
                />
              </TabPanel>
              <TabPanel sx={{ height: '90%' }} value={2}>
                <TextField
                  {...register('performanceInspectionReportResult')}
                  placeholder='점검결과를 작성해주세요'
                  fullWidth
                  multiline
                  sx={{
                    height: '100%', // TextField 컨테이너 전체 높이를 100%로 설정
                    // 내부 입력 요소(textarea)의 스타일을 조정하여 높이를 맞춥니다.
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start' // 입력 커서와 내용이 위에서 시작하도록 정렬
                    },

                    // 실제 textarea 요소에 높이를 100%로 적용하여 공간을 모두 차지하게 합니다.
                    '& textarea': {
                      height: '100% !important' // 중요: 높이 100% 강제 적용
                    }
                  }}
                  slotProps={{ input: { sx: { fontSize: 18 } } }}
                />
              </TabPanel>
            </TabContext>
          </DialogContent>
          <DialogActions className='flex items-center justify-center'>
            <Button color='primary' variant='contained' type='submit' disabled={!isDirty}>
              {isDirty ? '저장' : '변경사항 없음'}
            </Button>
            {/* <Button color='success' variant='contained' type='button'>
              보고서 다운로드
            </Button> */}
            <Button color='secondary' variant='contained' onClick={() => setOpen(false)} type='button'>
              닫기
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
