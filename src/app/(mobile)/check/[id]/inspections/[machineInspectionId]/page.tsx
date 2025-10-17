'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, IconButton, MenuItem, Tab, TextField, Typography, useTheme } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabContext from '@mui/lab/TabContext'

import { useForm } from 'react-hook-form'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'
import { isMobileContext } from '@/app/_components/ProtectedPage'

import { auth } from '@/lib/auth'
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  machineProjectEngineerDetailDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionPageResponseDtoType,
  MachineInspectionResponseDtoType,
  successResponseDtoType,
  machineChecklistItemsWithPicCountResponseDtosType
} from '@/app/_type/types'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DeleteModal from '@/app/_components/modal/DeleteModal'
import PicturesPage from './_pages/PicturesPage'
import InfoPage from './_pages/InfoPage'
import type { ChildrenType } from '@/@core/types'

type currentTabType = 'pictures' | 'info' | 'gallery' | 'camera'

const max_cnt = 100

export const inspectionListContext = createContext<MachineInspectionPageResponseDtoType[]>([])
export const engineerListContext = createContext<machineProjectEngineerDetailDtoType[]>([])
export const checklistItemsContext = createContext<machineChecklistItemsWithPicCountResponseDtosType[]>([])

export interface InspectionformType {
  deficiencies: string
  actionRequired: string
  machineInspectionName: string
  location: string
  purpose: string
  installedDate: string
  manufacturedDate: string
  usedDate: string
  checkDate: string
  remark: string
}

export default function CheckInspectionDetailPage() {
  const { id: machineProjectId, machineInspectionId: inspectionId } = useParams()

  const theme = useTheme()
  const router = useRouter()

  const isMobile = useContext(isMobileContext)

  const TabListRef = useRef<HTMLElement>(null)
  const scrollableAreaRef = useRef<HTMLElement>(null)

  const [currentTab, setCurrentTab] = useState<currentTabType>('pictures')

  const [openAlert, setOpenAlert] = useState(false)

  // PicturesPage props
  const [inspectionList, setInspectionList] = useState<MachineInspectionPageResponseDtoType[]>([])

  const [inspection, setInspection] = useState<MachineInspectionDetailResponseDtoType>()
  const [category, setCategory] = useState<string>('전체')

  const [checklistResult, setChecklistResult] = useState<MachineInspectionChecklistItemResultResponseDtoType>()

  const [participatedEngineerList, setParticipatedEngineerList] = useState<machineProjectEngineerDetailDtoType[]>([])
  const [checkiistList, setCheckiistList] = useState<machineChecklistItemsWithPicCountResponseDtosType[]>([])

  // 변경감지
  const {
    register,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset
  } = useForm<InspectionformType>()

  // 해당 페이지에 접속했는데 localStorage에 정보가 없다면 뒤로 가기
  if (!localStorage.getItem('projectSummary')) router.back()

  const checklistItem = inspection?.machineChecklistItemsWithPicCountResponseDtos.find(
    v => v.machineChecklistItemId === Number(category)
  )

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

  // 참여중인 엔지니어 리스트 가져오기
  const getParticipatedEngineerList = useCallback(async () => {
    try {
      const response = await auth.get<{
        data: { machineProjectEngineerResponseDtos: machineProjectEngineerDetailDtoType[] }
      }>(`/api/machine-projects/${machineProjectId}/machine-project-engineers`)

      setParticipatedEngineerList(response.data.data.machineProjectEngineerResponseDtos)
      console.log('get engineer list succeed: ', response.data.data.machineProjectEngineerResponseDtos)
    } catch (e) {
      handleApiError(e)
    }
  }, [machineProjectId])

  // inspectionId가 바뀔 때마다 점검항목 가져오기
  const getChecklistList = useCallback(async () => {
    const response = await auth.get<{
      data: { machineChecklistItemsWithPicCountResponseDtos: machineChecklistItemsWithPicCountResponseDtosType[] }
    }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}`)

    setCheckiistList(response.data.data.machineChecklistItemsWithPicCountResponseDtos)
    console.log('get checklist items succeed: ', response.data.data.machineChecklistItemsWithPicCountResponseDtos)
  }, [machineProjectId, inspectionId])

  useEffect(() => {
    getAllInspections()
    getParticipatedEngineerList()
    getChecklistList()
  }, [getAllInspections, getParticipatedEngineerList, getChecklistList])

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

  const handleSave = useCallback(async () => {
    const successMessage: ('result' | 'info')[] = []

    // 미흡사항/조치필요사항 저장
    try {
      if (isDirty && checklistResult) {
        try {
          const response = await auth.put<{
            data: {
              machineInspectionChecklistItemResultUpdateResponseDtos: MachineInspectionChecklistItemResultResponseDtoType[]
            }
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}/machine-inspection-checklist-item-results`,
            {
              machineInspectionChecklistItemResultUpdateRequestDtos: [{ ...checklistResult, inspectionResult: 'FAIL' }]
            }
          )

          setChecklistResult(response.data.data.machineInspectionChecklistItemResultUpdateResponseDtos[0])

          successMessage.push('result')
        } catch (e) {
          handleApiError(e)
        }
      }

      if (isDirty && inspection) {
        try {
          const response = await auth.put<{
            data: MachineInspectionResponseDtoType
          }>(
            `/api/machine-projects/${machineProjectId}/machine-inspections/${inspectionId}`,
            inspection.machineInspectionResponseDto
          )

          setInspection(prev => prev && { ...prev, machineInspectionResponseDto: response.data.data })

          successMessage.push('info')
        } catch (e) {
          handleApiError(e)
        }
      }

      if (!successMessage.length) throw new Error('저장에 실패했습니다')

      handleSuccess(
        `${successMessage.map(v => ({ result: '점검결과', info: '설비정보' })[v]).join('와 ')}가 저장되었습니다.`
      )
    } catch (e) {
      handleApiError(e)
    }
  }, [machineProjectId, inspectionId, checklistResult, inspection, isDirty])

  const getChecklistResult = useCallback(async () => {
    if (category === '전체') {
      setChecklistResult(undefined)

      return
    }

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

  const InspectionPageProviders = ({ children }: ChildrenType) => {
    return (
      <inspectionListContext.Provider value={inspectionList}>
        <engineerListContext.Provider value={participatedEngineerList}>
          <form onSubmit={handleSubmit(data => handleSave())}>
            <checklistItemsContext.Provider value={checkiistList}>{children}</checklistItemsContext.Provider>
          </form>
        </engineerListContext.Provider>
      </inspectionListContext.Provider>
    )
  }

  return (
    <InspectionPageProviders>
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
              <IconButton sx={{ p: 0 }} onClick={handleSave}>
                {isDirty ? (
                  <i className=' tabler-device-floppy text-white text-3xl animate-ring ' />
                ) : (
                  <i className='tabler-device-floppy text-white text-3xl' />
                )}
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
                    sx: {
                      color: 'white',
                      textAlign: 'center',
                      ...(isMobile ? theme.typography.h5 : theme.typography.h4)
                    }
                  },

                  // htmlInput: { sx: { p: 0 } },
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
                    {/* {!isMobile && <i className='tabler-photo w-full h-full flex-1 shrink-0' />} */}
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
          <Box ref={scrollableAreaRef} sx={{ flex: 1, overflowY: 'auto', py: !isMobile ? 10 : 4, px: 10 }}>
            <PicturesPage
              register={register}
              scrollableAreaRef={scrollableAreaRef}
              inspection={inspection}
              checklistResult={checklistResult}
              setChecklistResult={setChecklistResult}
              category={category}
              setCategory={setCategory}
              getInspectionData={getInspectionData}
              TabListRef={TabListRef}
            />
            <InfoPage inspection={inspection} setInspection={setInspection} />
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
    </InspectionPageProviders>
  )
}
