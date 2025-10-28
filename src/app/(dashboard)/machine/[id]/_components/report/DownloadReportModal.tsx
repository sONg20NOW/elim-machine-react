import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography
} from '@mui/material'

import style from '@/app/_style/Table.module.css'
import { useGetReportCategories } from '@/@core/hooks/customTanstackQueries'

export default function DownloadReportModal() {
  const [open, setOpen] = useState(false)

  const { data: reportCategories } = useGetReportCategories()

  return (
    <>
      <Button
        variant='contained'
        color='info'
        onClick={() => {
          setOpen(true)
        }}
      >
        보고서 다운로드
      </Button>
      <Dialog fullWidth maxWidth='sm' open={open}>
        <DialogTitle variant='h3' sx={{ position: 'relative' }}>
          보고서 다운로드
          {/* <Typography>※ 메모리 8GB 이상, 엑셀 2019 이상 버전의 설치가 필요합니다.</Typography> */}
          <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => setOpen(false)}>
            <i className='tabler-x text-red-500' />
          </IconButton>
          <Divider />
        </DialogTitle>
        <DialogContent className={`${style.container} max-h-[50dvh]`}>
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th colSpan={1}>번호</th>
                <th colSpan={6}>내용</th>
                <th colSpan={2}>다운로드</th>
              </tr>
            </thead>
            <tbody>
              {reportCategories?.map((category, idx) => (
                <tr key={category.id}>
                  <th colSpan={1}>{idx + 1}</th>
                  <td colSpan={6}>{category.name}</td>
                  <td colSpan={2}>
                    <div className='grid place-items-center'>
                      <Button variant='contained' color='success'>
                        DOCX
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions className='flex items-center justify-center pt-4' sx={{ boxShadow: 10 }}>
          <Button variant='contained' color='success'>
            전체 다운로드
          </Button>
          <SettingButton />
        </DialogActions>
      </Dialog>
    </>
  )
}

function SettingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant='contained' color='warning' onClick={() => setOpen(true)}>
        환경설정
      </Button>
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
    </>
  )
}
