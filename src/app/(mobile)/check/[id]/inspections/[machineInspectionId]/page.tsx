'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, Checkbox, IconButton, InputLabel, MenuItem, Tab, TextField, Typography, useTheme } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabContext from '@mui/lab/TabContext'

import TabPanel from '@mui/lab/TabPanel'

import { position } from 'stylis'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/app/_components/ProtectedPage'

import type { projectSummaryType } from '../../page'
import { auth } from '@/lib/auth'
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionPageResponseDtoType,
  successResponseDtoType
} from '@/app/_type/types'
import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import PictureTable from './_components/PictureTable'

type currentTabType = 'pictures' | 'info' | 'gallery' | 'camera'

const max_cnt = 100

export default function CheckInspectionDetailPage() {
  const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

  const theme = useTheme()
  const router = useRouter()

  const isMobile = useContext(isMobileContext)

  const TabListRef = useRef<HTMLElement>(null)

  const [currentTab, setCurrentTab] = useState<currentTabType>('pictures')

  const [openAlert, setOpenAlert] = useState(false)

  const [inspectionList, setInspectionList] = useState<MachineInspectionPageResponseDtoType[]>([])

  const [inspection, setInspection] = useState<MachineInspectionDetailResponseDtoType>()
  const [category, setCategory] = useState<string>('전체')

  const [emptyMode, setEmptyMode] = useState(false)

  const scrollableAreaRef = useRef<HTMLElement>(null)

  const checklistItem = inspection?.machineChecklistItemsWithPicCountResponseDtos.find(
    v => v.machineChecklistItemId === Number(category)
  )

  const [checklistResult, setChecklistResult] = useState<MachineInspectionChecklistItemResultResponseDtoType>()

  // 해당 페이지에 접속했는데 localStorage에 정보가 없다면 뒤로 가기
  if (!localStorage.getItem('projectSummary')) router.back()

  const machineProjectName = (JSON.parse(localStorage.getItem('projectSummary')!) as projectSummaryType)
    .machineProjectName

  // inspection 리스트 가져오기 (전체)
  const getAllInspections = useCallback(async () => {
    try {
      const response = await auth.get<{ data: successResponseDtoType<MachineInspectionPageResponseDtoType[]> }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections?size=${max_cnt}`
      )

      setInspectionList(response.data.data.content)
      console.log('get inspection list succeed: ', response.data.data)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId])

  useEffect(() => {
    getAllInspections()
  }, [getAllInspections])

  // 현재 선택된 inspection 데이터 가져오기
  const getInspectionData = useCallback(async () => {
    try {
      const response = await auth.get<{ data: MachineInspectionDetailResponseDtoType }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}`
      )

      setInspection(response.data.data)
      console.log('current inspection: ', response.data.data)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionId])

  useEffect(() => {
    getInspectionData()
  }, [getInspectionData])

  const handleDeleteInspection = useCallback(async () => {
    try {
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-inspections`, {
        // @ts-ignore
        data: {
          machineInspectionDeleteRequestDtos: [
            { machineInspectionId: inspectionId?.toString(), version: inspection?.machineInspectionResponseDto.version }
          ]
        }
      })
      router.back()
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionId, router, inspection])

  const handleSaveResult = useCallback(async () => {
    try {
      const response = await auth.put<{
        data: {
          machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultResponseDtoType[]
        }
      }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-inspection-checklist-item-results`,
        { machineInspectionChecklistItemResultUpdateRequestDtos: [{ ...checklistResult, inspectionResult: 'FAIL' }] }
      )

      setChecklistResult(response.data.data.machineInspectionChecklistItemResultUpdateResponseDtos[0])
      handleSuccess('저장되었습니다.')
    } catch (e) {
      handleApiError(e)
    }
  }, [machineProjectId, inspectionId, checklistResult])

  const getChecklistResult = useCallback(async () => {
    if (category === '전체') return

    try {
      const response = await auth.get<{ data: MachineInspectionChecklistItemResultResponseDtoType }>(
        `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-inspection-checklist-item-results/${checklistItem?.machineInspectionChecklistItemResultBasicResponseDto.id}`
      )

      setChecklistResult(response.data.data)
      console.log('checklist result:', response.data.data)
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, inspectionId, category, checklistItem])

  useEffect(() => {
    getChecklistResult()
  }, [getChecklistResult])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* 헤더 */}
      <MobileHeader
        left={
          <IconButton sx={{ p: 0 }} onClick={() => router.back()}>
            <i className='tabler-chevron-left text-white text-3xl' />
          </IconButton>
        }
        right={
          <Box sx={{ display: 'flex', gap: isMobile ? 2 : 4 }}>
            <IconButton sx={{ p: 0 }} onClick={handleSaveResult}>
              <i className='tabler-device-floppy text-white text-3xl' />
            </IconButton>
            <IconButton sx={{ p: 0 }} onClick={() => setOpenAlert(true)}>
              <i className='tabler-trash-filled text-red-400 text-3xl' />
            </IconButton>
          </Box>
        }
        title={
          <div className='flex flex-col w-full'>
            <TextField
              slotProps={{
                input: {
                  sx: { color: 'white', textAlign: 'center', ...(isMobile ? theme.typography.h4 : theme.typography.h3) }
                },
                htmlInput: { sx: { p: 0 } },
                select: {
                  displayEmpty: true,
                  renderValue: selectedValue => {
                    const item = inspectionList.find(
                      inspection => inspection.machineInspectionId.toString() === selectedValue
                    )

                    // Display only the name in the text field
                    return item ? item.machineInspectionName : '　'
                  },
                  MenuProps: {
                    slotProps: {
                      paper: {
                        sx: {
                          height: 500
                        }
                      }
                    }
                  }
                }
              }}
              value={inspectionId}
              fullWidth
              select
              variant='standard'
              onChange={e => {
                router.replace(`/check/${machineProjectId}/inspections/${e.target.value}`)
              }}
            >
              {inspectionList.map((inspection, idx) => (
                <MenuItem
                  key={inspection.machineInspectionId}
                  value={inspection.machineInspectionId}
                  sx={{ display: 'flex', height: 70, border: 'solid 1px lightgray', mt: idx !== 0 ? 2 : 0 }}
                >
                  {!isMobile && <i className='tabler-photo w-full h-full flex-1' />}
                  <Box sx={{ flex: 3 }}>
                    <Typography variant='inherit'>{`${inspection.machineInspectionName} [${inspection.machinePicCount}]`}</Typography>
                    <Typography variant='inherit' fontSize={'small'}>
                      {inspection.location !== '' ? (inspection.location ?? '　') : '　'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </div>
        }
      />
      <TabContext value={currentTab}>
        {/* 본 컨텐츠 (스크롤 가능 영역)*/}
        <Box ref={scrollableAreaRef} sx={{ flex: 1, overflowY: 'auto' }}>
          <TabPanel
            value={'pictures'}
            sx={{
              py: !isMobile ? 10 : 4,
              px: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: !isMobile ? 8 : 5
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
              <div className='flex flex-col gap-1'>
                <div className='flex justify-between items-center'>
                  <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
                  <div className='flex items-center'>
                    <Typography variant='body2'>사진 없음</Typography>
                    <Checkbox size='small' value={emptyMode} onChange={() => setEmptyMode(prev => !prev)} />
                  </div>
                </div>
                <TextField
                  select
                  size={isMobile ? 'small' : 'medium'}
                  id='machineProjectName'
                  fullWidth
                  hiddenLabel
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 18,
                        color: checklistItem?.totalMachinePicCount === 0 ? 'red' : ''
                      }
                    }
                  }}
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value)
                  }}
                >
                  <MenuItem value='전체'>전체</MenuItem>
                  {inspection?.machineChecklistItemsWithPicCountResponseDtos.map(v =>
                    v.machineChecklistItemName !== '기타' ? (
                      <MenuItem
                        key={v.machineChecklistItemId}
                        value={v.machineChecklistItemId}
                        sx={{
                          color: v.totalMachinePicCount === 0 ? 'red' : ''
                        }}
                      >
                        {v.machineChecklistItemName} [{v.checklistSubItems.filter(p => p.machinePicCount !== 0).length}/
                        {v.checklistSubItems.length}]
                      </MenuItem>
                    ) : (
                      <MenuItem key={v.machineChecklistItemId} value={v.machineChecklistItemId}>
                        {v.machineChecklistItemName}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </div>
              {category !== '전체' && (
                <div className='flex flex-col gap-1'>
                  <InputLabel sx={{ px: 2 }}>미흡사항</InputLabel>
                  <TextField
                    size={isMobile ? 'small' : 'medium'}
                    id='requirement'
                    fullWidth
                    value={checklistResult?.deficiencies ?? ''}
                    onChange={e => setChecklistResult(prev => prev && { ...prev, deficiencies: e.target.value })}
                    hiddenLabel
                    multiline
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
                  />
                </div>
              )}
              {category !== '전체' && (
                <div className='flex flex-col gap-1'>
                  <InputLabel sx={{ px: 2 }}>조치필요사항</InputLabel>
                  <TextField
                    size={isMobile ? 'small' : 'medium'}
                    id='requirement'
                    fullWidth
                    value={checklistResult?.actionRequired ?? ''}
                    onChange={e => setChecklistResult(prev => prev && { ...prev, actionRequired: e.target.value })}
                    hiddenLabel
                    multiline
                    slotProps={{ input: { sx: { fontSize: 18 } } }}
                  />
                </div>
              )}
            </Box>
            {inspection && (
              <PictureTable
                machineChecklistItemId={checklistItem?.machineChecklistItemId ?? null}
                emptyMode={emptyMode}
                scrollableAreaRef={scrollableAreaRef}
                checklists={inspection.machineChecklistItemsWithPicCountResponseDtos}
                refetchChecklists={getInspectionData}
                tabHeight={TabListRef.current?.clientHeight ?? 0}
              />
            )}
          </TabPanel>
          <TabPanel value={'info'}>2</TabPanel>
        </Box>
        {/* 탭 리스트 */}
        <Box ref={TabListRef} sx={{ borderTop: 1, borderColor: 'divider' }}>
          <TabList
            sx={{ display: 'flex', px: isMobile ? '' : 20 }}
            centered
            onChange={(event: React.SyntheticEvent, newValue: currentTabType) => {
              if (newValue !== 'gallery' && newValue !== 'camera') setCurrentTab(newValue)
            }}
          >
            <Tab sx={{ flex: 1 }} value={'pictures'} label={<i className='tabler-photo text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'info'} label={<i className='tabler-info-circle text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'gallery'} label={<i className='tabler-library-photo text-4xl' />}></Tab>
            <Tab sx={{ flex: 1 }} value={'camera'} label={<i className='tabler-camera-filled text-4xl' />}></Tab>
          </TabList>
        </Box>
      </TabContext>
      <DeleteModal showDeleteModal={openAlert} setShowDeleteModal={setOpenAlert} onDelete={handleDeleteInspection} />
    </Box>
  )
}
