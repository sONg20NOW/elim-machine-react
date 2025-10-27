import { useState } from 'react'

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

import styles from '@/app/_style/Table.module.css'
import { useGetInspectionOpinions } from '@/@core/hooks/customTanstackQueries'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  fontSize: theme.typography.h5.fontSize
}))

export default function ChecklistResultSummaryModal({ machineProjectName }: { machineProjectName: string }) {
  const { id } = useParams()
  const machineProjectId = id?.toString()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(0)

  const { data: inspectionSummary, refetch } = useGetInspectionOpinions(machineProjectId!)

  return (
    <>
      <Button
        variant='contained'
        color='success'
        onClick={() => {
          setOpen(true)
        }}
      >
        점검의견서
      </Button>
      <Dialog fullWidth maxWidth={'md'} open={open}>
        <DialogTitle variant='h3' sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 2 }}>
            점검의견서 <Typography variant='h5'>[{machineProjectName}]</Typography>
            <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
              <i className='tabler-x text-red-500' />
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
            <TabPanel value={0}>
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
                        <TextField
                          placeholder={{ NONE: '해당없음', PASS: '적합', FAIL: '부적합' }[value.inspectionResult]}
                          fullWidth
                          variant='standard'
                        />
                      </td>
                      {/* <td >{value.actionRequired}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabPanel>
            <TabPanel value={1}>점검내용요약 종합의견</TabPanel>
            <TabPanel value={2}>성능점검결과보고서 점검결과</TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions className='flex items-center justify-center'>
          <Button color='primary' variant='contained'>
            저장
          </Button>
          <Button color='success' variant='contained'>
            보고서 다운로드
          </Button>
          <Button color='secondary' variant='contained' onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
