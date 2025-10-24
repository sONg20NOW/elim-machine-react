import { useEffect, useState } from 'react'

import type { TextFieldProps } from '@mui/material'
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import type { NumericFormatProps } from 'react-number-format'
import { NumericFormat } from 'react-number-format'

import styles from '@/app/_style/Table.module.css'

import { useGetEnergyTypes } from '@/@core/hooks/customTanstackQueries'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  fontSize: theme.typography.h5.fontSize
}))

function StyledNumericField() {
  return (
    <NumericFormat
      thousandSeparator
      customInput={TextField}
      variant='standard'
      slotProps={{ htmlInput: { sx: { textAlign: 'center' } } }}
    />
  )
}

const defaultYears = [2022, 2023, 2024, 2025]
const maxTargetCnt = 3

interface energyFormType {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
  '6': number
  '7': number
  '8': number
  '9': number
  '10': number
  '11': number
  '12': number
}

export default function EnergyReport() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(0)
  const targets = [{ targetId: 1 }]

  // const

  const { data: energyTypes } = useGetEnergyTypes()

  useEffect(() => {
    if (energyTypes) setValue(energyTypes[0].machineEnergyTypeId)
  }, [energyTypes])

  const currentEnergyType = energyTypes?.find(v => v.machineEnergyTypeId === value)

  return (
    <>
      <Button
        variant='contained'
        color='warning'
        onClick={() => {
          setOpen(true)
        }}
      >
        에너지 사용량
      </Button>
      <Dialog maxWidth='xl' fullWidth open={open}>
        <DialogTitle>
          <div className='flex justify-between'>
            <Typography variant='h3'>에너지 사용량</Typography>
            <IconButton type='button' size='small' onClick={() => setOpen(false)}>
              <i className='tabler-x' />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {currentEnergyType ? (
            <div className={`${styles.container} ${styles.centered} flex flex-col gap-4`}>
              <AppBar position='static' color='warning'>
                <Tabs
                  value={value}
                  onChange={(_, newValue) => setValue(newValue)}
                  indicatorColor='secondary'
                  sx={{ color: 'white' }}
                  textColor='inherit'
                >
                  {energyTypes?.map(type => (
                    <StyledTab key={type.machineEnergyTypeId} label={type.name} value={type.machineEnergyTypeId} />
                  ))}
                </Tabs>
              </AppBar>
              <div className='flex gap-6 ps-2 items-center'>
                <Typography variant='h4'>{currentEnergyType.name} 사용량</Typography>
                <Button variant='contained' color='warning' endIcon={<i className='tabler-plus' />}>
                  장소 추가
                </Button>
              </div>
              <table style={{ tableLayout: 'fixed' }}>
                {/* year, target 헤더 */}
                <thead>
                  <tr>
                    <th rowSpan={2} colSpan={1}>
                      월
                    </th>
                    {defaultYears.map(year => (
                      <th colSpan={6} key={year}>
                        {year}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {defaultYears.map(year =>
                      targets.map(target => (
                        <td key={target.targetId} colSpan={6 / targets.length}>
                          <StyledNumericField />
                        </td>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {new Array(12)
                    .fill(1)
                    .map((v, idx) => idx + 1)
                    .map(month => (
                      <tr key={month}>
                        <td>{month}</td>
                        {defaultYears.map(year => (
                          <td colSpan={6} key={year}>
                            <StyledNumericField />
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>합계</td>
                    {defaultYears.map(year => (
                      <td colSpan={6} key={year}>
                        {new Intl.NumberFormat().format(10101021010)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <Box minHeight={'20dvh'} sx={{ display: 'grid', placeItems: 'center' }}>
              <div className='flex flex-col items-center gap-2'>
                <Typography color='error.main' variant='h5'>
                  현재 에너지 타입을 찾을 수 없습니다
                </Typography>
                <Typography>관리자에게 문의해주세요</Typography>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} type='button'>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
