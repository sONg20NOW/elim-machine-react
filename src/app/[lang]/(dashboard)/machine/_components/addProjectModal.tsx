'use client'

// React Imports
import { forwardRef, useState } from 'react'

// MUI Imports

import { useRouter } from 'next/navigation'

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

import { Grid } from '@mui/material'

import { format } from 'date-fns'

import type { TextFieldProps } from '@mui/material/TextField'

import DialogCloseButton from './DialogCloseButton'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import MultiSelectBox from '@/components/selectbox/MultiSelectBox'

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

type CustomInputProps = TextFieldProps & {
  label: string
  end: Date | number | null
  start: Date | number | null
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ label, start, end, ...rest }, ref) => {
  const startDate = start ? format(start, 'yyyy-MM-dd') : ''
  const endDate = end ? ` ~ ${format(end, 'yyyy-MM-dd')}` : ''

  return (
    <CustomTextField
      fullWidth
      inputRef={ref}
      {...rest}
      label={label}
      value={startDate + endDate}
      InputProps={{
        ...rest.InputProps
      }}
    />
  )
})

const AddProjectModal = ({ open, setOpen }: EditUserInfoProps) => {
  const [form, setForm] = useState({
    companyName: '',
    projectName: '',
    beginDate: null as Date | null,
    endDate: null as Date | null,
    fieldBeginDate: null as Date | null,
    fieldEndDate: null as Date | null,
    note: ''
  })

  const [value, setValue] = useState<string>('1')
  const [fieldRange, setFieldRange] = useState<[Date | null, Date | null]>([null, null])

  // 점검기간
  const [inspectionRange, setInspectionRange] = useState<[Date | null, Date | null]>([null, null])

  const router = useRouter()

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...form,
      beginDate: form.beginDate ? format(form.beginDate, 'yyyy-MM-dd') : '',
      endDate: form.endDate ? format(form.endDate, 'yyyy-MM-dd') : '',
      fieldBeginDate: form.fieldBeginDate ? format(form.fieldBeginDate, 'yyyy-MM-dd') : '',
      fieldEndDate: form.fieldEndDate ? format(form.fieldEndDate, 'yyyy-MM-dd') : ''
    }

    // 실제 API 호출 부분
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      alert('등록에 실패했습니다.')

      return
    }

    const result = await response.json()

    router.push(`/en/machine/${result.data.machineProjectId}`)
  }

  // 점검기간 변경
  const handleInspectionChange = (dates: [Date | null, Date | null]) => {
    setInspectionRange(dates)
    setForm(prev => ({
      ...prev,
      beginDate: dates[0],
      endDate: dates[1]
    }))
  }

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 현장투입기간 변경
  const handleFieldChange = (dates: [Date | null, Date | null]) => {
    setFieldRange(dates)
    setForm(prev => ({
      ...prev,
      fieldBeginDate: dates[0],
      fieldEndDate: dates[1]
    }))
  }

  // 탭 변경 핸들러
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {'기계설비점검 신규 추가'}
      </DialogTitle>

      <TabContext value={value}>
        <TabList centered onChange={handleTabChange} aria-label='centered tabs example'>
          <Tab value='1' label='기본정보' />
        </TabList>
        <TabPanel value='1'>
          <form onSubmit={handleSubmit} className='p-6'>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <MultiSelectBox
                  id={'companyName'}
                  label='점검업체'
                  value={form.companyName || ''}
                  loading={false}
                  onChange={(e: any) => handleChange('companyName', e.target.value)}
                  options={[
                    { value: '엘림기술원(주)', label: '엘림기술원(주)' },
                    { value: '엘림주식회사', label: '엘림주식회사' },
                    { value: '엘림테크원(주)', label: '엘림테크원(주)' },
                    { value: '이엘엔지니어링(주)', label: '이엘엔지니어링(주)' },
                    { value: '이엘테크원(주)', label: '이엘테크원(주)' }
                  ]}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label='현장명'
                  fullWidth
                  value={form.projectName}
                  onChange={e => handleChange('projectName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AppReactDatepicker
                  selectsRange
                  startDate={inspectionRange[0] as Date}
                  endDate={inspectionRange[1] as Date}
                  selected={inspectionRange[0]}
                  onChange={handleInspectionChange}
                  shouldCloseOnSelect={false}
                  customInput={<CustomInput label='점검기간' start={inspectionRange[0]} end={inspectionRange[1]} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AppReactDatepicker
                  selectsRange
                  startDate={fieldRange[0] as Date}
                  endDate={fieldRange[1] as Date}
                  selected={fieldRange[0]}
                  onChange={handleFieldChange}
                  shouldCloseOnSelect={false}
                  customInput={<CustomInput label='현장투입기간' start={fieldRange[0]} end={fieldRange[1]} />}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label='특이사항'
                  fullWidth
                  multiline
                  rows={4}
                  minRows={2}
                  value={form.note}
                  onChange={e => handleChange('note', e.target.value)}
                />
              </Grid>
            </Grid>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 mt-[20px] lg:mt-[40px]'>
              <Button variant='contained' type='submit'>
                추가하기
              </Button>
              <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
                취소
              </Button>
            </DialogActions>
          </form>
        </TabPanel>
      </TabContext>
    </Dialog>
  )
}

export default AddProjectModal
