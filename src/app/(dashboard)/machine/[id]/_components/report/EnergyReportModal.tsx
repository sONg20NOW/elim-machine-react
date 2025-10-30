import { useEffect, useMemo, useState } from 'react'

import { useParams } from 'next/navigation'

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
import { NumericFormat } from 'react-number-format'

import styles from '@/app/_style/Table.module.css'

import { useGetEnergyTargets, useGetEnergyTypes, useGetEnergyUsages } from '@/@core/hooks/customTanstackQueries'
import AddTargetModal from './AddTargetModal'
import { auth } from '@/lib/auth'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'white',
  fontSize: theme.typography.h5.fontSize
}))

const defaultYears = [2022, 2023, 2024, 2025]
const defaultMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export default function EnergyReport() {
  const params = useParams()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(0)

  const { data: energyTypes } = useGetEnergyTypes()
  const currentEnergyType = energyTypes?.find(v => v.machineEnergyTypeId === value)

  const { data: targets } = useGetEnergyTargets(`${params.id}`, `${currentEnergyType?.machineEnergyTypeId}`)

  const { data: usages, refetch } = useGetEnergyUsages(`${params.id}`, `${currentEnergyType?.machineEnergyTypeId}`)

  // 👉 usage[year][targetId][month] 구조
  const [usage, setUsage] = useState<Record<string, Record<string, Record<string, number>>>>(() => {
    const init: Record<string, Record<string, Record<string, number>>> = {}

    defaultYears.forEach(year => {
      init[year] = {}
      targets?.forEach(t => {
        init[year][t.machineEnergyTargetId] = {}
        defaultMonths.forEach(m => (init[year][t.machineEnergyTargetId][m] = 0))
      })
    })

    return init
  })

  // ✅ 데이터 로드 후 초기화
  useEffect(() => {
    if (!usages) return

    const newUsage: Record<string, Record<number, Record<string, number>>> = {}

    // 기본 구조를 0으로 초기화
    defaultYears.forEach(year => {
      newUsage[year] = {}
      targets?.forEach(target => {
        newUsage[year][target.machineEnergyTargetId] = {}
        defaultMonths.forEach(month => {
          newUsage[year][target.machineEnergyTargetId][month] = 0
        })
      })
    })

    // 실제 API 데이터로 덮어쓰기
    usages.forEach(({ targetId, year, monthlyValues }) => {
      if (!newUsage[year]) newUsage[year] = {}
      if (!newUsage[year][targetId]) newUsage[year][targetId] = {}

      Object.entries(monthlyValues).forEach(([month, value]) => {
        newUsage[year][targetId][month] = value
      })
    })

    setUsage(newUsage)
  }, [usages, targets, open])

  useEffect(() => {
    if (energyTypes) setValue(energyTypes[0].machineEnergyTypeId)
  }, [energyTypes])

  // 입력 변경 핸들러
  const handleChange = (year: string, targetId: number, month: string, value: number) => {
    setUsage(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [targetId]: {
          ...prev[year][targetId],
          [month]: value
        }
      }
    }))
  }

  const totals = useMemo(() => {
    if (!usage || !targets?.length) return {}

    const result: Record<string, Record<string, number>> = {}

    defaultYears.forEach(year => {
      // usage[year]이 없으면 초기화
      if (!usage[year]) return

      result[year] = {}

      targets.forEach(target => {
        const yearData = usage[year]?.[target.machineEnergyTargetId]

        if (!yearData) {
          result[year][target.machineEnergyTargetId] = 0

          return
        }

        const monthlyValues = Object.values(yearData ?? {})
        const sum = monthlyValues.reduce((a, b) => a + b, 0)

        result[year][target.machineEnergyTargetId] = sum
      })
    })

    return result
  }, [usage, targets])

  // ✅ 변경 부분만 추출 후 저장
  const handleSave = async () => {
    if (!usages || !usage) return

    const allData: { targetId: number; year: number; monthlyValues: Record<string, number> }[] = []

    defaultYears.forEach(year => {
      targets?.forEach(target => {
        const targetId = target.machineEnergyTargetId
        const monthlyValues = usage[year][targetId]

        allData.push({
          targetId,
          year: Number(year),
          monthlyValues
        })
      })
    })

    try {
      await auth.put(`/api/machine-projects/${params.id}/machine-energy-usages`, {
        machineEnergyTypeId: currentEnergyType?.machineEnergyTypeId,
        machineEnergyUsages: allData
      })

      handleSuccess('저장되었습니다')
      await refetch() // ✅ 저장 후 새로 불러오기
    } catch (err) {
      handleApiError(err)
    }
  }

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
          {currentEnergyType && targets ? (
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
                <AddTargetModal machineEnergyTypeId={currentEnergyType.machineEnergyTypeId} />
              </div>
              {targets.length > 0 ? (
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
                    {/* target 이름칸 */}
                    <tr>
                      {defaultYears.map(year =>
                        targets.map(target => (
                          <td
                            className='truncate'
                            key={`${year} and ${target.machineEnergyTargetId}`}
                            colSpan={6 / targets.length}
                          >
                            {target.name}
                          </td>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 사용량 */}
                    {new Array(12)
                      .fill(1)
                      .map((year, idx) => idx + 1)
                      .map(month => (
                        <tr key={month}>
                          <td>{month}</td>
                          {defaultYears.map(year =>
                            targets.map(target => (
                              <td key={`${year}-${target.machineEnergyTargetId}-${month}`} colSpan={6 / targets.length}>
                                <NumericFormat
                                  value={usage?.[year]?.[target.machineEnergyTargetId]?.[month] ?? 0}
                                  thousandSeparator
                                  customInput={TextField}
                                  variant='standard'
                                  onValueChange={v =>
                                    handleChange(
                                      year.toString(),
                                      target.machineEnergyTargetId,
                                      month.toString(),
                                      Number(v.value) || 0
                                    )
                                  }
                                  slotProps={{ htmlInput: { sx: { textAlign: 'center' } } }}
                                />
                              </td>
                            ))
                          )}
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>합계</td>
                      {defaultYears.map(year =>
                        targets.map(target => (
                          <td
                            colSpan={6 / targets.length}
                            key={`sum-${year}-${target.machineEnergyTargetId}`}
                            style={{ fontWeight: 'bold' }}
                          >
                            {new Intl.NumberFormat().format(totals?.[year]?.[target.machineEnergyTargetId] ?? 0)}
                          </td>
                        ))
                      )}
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className='flex flex-col items-center gap-2'>
                  <Typography color='warning.dark' variant='h5'>
                    장소가 없습니다
                  </Typography>
                  <Typography>장소 관리에서 추가해주세요</Typography>
                </div>
              )}
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
          <Button color='success' variant='contained' type='button' onClick={handleSave}>
            저장
          </Button>
          {/* <Button color='info' variant='contained' type='button'>
            보고서 다운로드
          </Button> */}
          <Button color='secondary' variant='contained' onClick={() => setOpen(false)} type='button'>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
