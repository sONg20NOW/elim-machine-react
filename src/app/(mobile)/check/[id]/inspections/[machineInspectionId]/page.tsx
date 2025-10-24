'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Box, IconButton, MenuItem, Tab, TextField, Typography, useTheme } from '@mui/material'

import TabList from '@mui/lab/TabList'

import TabContext from '@mui/lab/TabContext'

import { toast } from 'react-toastify'

import TabPanel from '@mui/lab/TabPanel'

import MobileHeader from '@/app/(mobile)/_components/MobileHeader'

import { auth } from '@/lib/auth'
import type {
  machineProjectEngineerDetailDtoType,
  MachineInspectionPageResponseDtoType,
  successResponseDtoType,
  ChildrenType
} from '@/@core/types'

import { handleApiError, handleSuccess } from '@/utils/errorHandler'
import DeleteModal from '@/@core/components/custom/DeleteModal'
import ChecklistForm from './_components/ChecklistForm'
import InspectionForm from './_components/InspectionForm'

import { isMobileContext } from '@/@core/components/custom/ProtectedPage'

import PictureTable from './_components/PictureTable'
import ImageUploadPage from './_components/ImageUploadPage'
import { useGetChecklistInfo } from '@/@core/hooks/customTanstackQueries'

type currentTabType = 'pictures' | 'info' | 'gallery' | 'camera'

const max_cnt = 100

export const inspectionListContext = createContext<MachineInspectionPageResponseDtoType[]>([])
export const engineerListContext = createContext<machineProjectEngineerDetailDtoType[]>([])

export interface FormComponentHandle {
  submit: () => Promise<boolean>
  isDirty: () => boolean
}

export default function CheckInspectionDetailPage() {
  const { id: machineProjectId, machineInspectionId } = useParams()

  const theme = useTheme()
  const router = useRouter()

  const isMobile = useContext(isMobileContext)

  const form1Ref = useRef<FormComponentHandle>(null)
  const form2Ref = useRef<FormComponentHandle>(null)

  const inspectionVersion = useRef(0)

  const TabListRef = useRef<HTMLElement>(null)
  const scrollableAreaRef = useRef<HTMLElement>(null)

  const [currentTab, setCurrentTab] = useState<currentTabType>('pictures')

  const [openAlert, setOpenAlert] = useState(false)

  const [category, setCategory] = useState<string>('전체')

  const [inspectionList, setInspectionList] = useState<MachineInspectionPageResponseDtoType[]>([])
  const [participatedEngineerList, setParticipatedEngineerList] = useState<machineProjectEngineerDetailDtoType[]>([])

  const saveButtonRef = useRef<HTMLElement>(null)

  // 해당 페이지에 접속했는데 localStorage에 정보가 없다면 뒤로 가기
  if (!localStorage.getItem('projectSummary')) router.back()

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

  useEffect(() => {
    getAllInspections()
    getParticipatedEngineerList()
  }, [getAllInspections, getParticipatedEngineerList])

  // 현재 선택된 inspection 데이터 가져오기
  const { data: checklist } = useGetChecklistInfo(`${machineProjectId}`, `${machineInspectionId}`)

  const checklistItem = checklist?.find(v => v.machineChecklistItemId === Number(category))

  const handleDeleteInspection = useCallback(async () => {
    try {
      await auth.delete(`/api/machine-projects/${machineProjectId}/machine-inspections`, {
        // @ts-ignore
        data: {
          machineInspectionDeleteRequestDtos: [
            { machineInspectionId: machineInspectionId?.toString(), version: inspectionVersion.current }
          ]
        }
      })
      router.back()
    } catch (error) {
      handleApiError(error)
    }
  }, [machineProjectId, machineInspectionId, router])

  const globalSubmit = async () => {
    const successMessage: ('result' | 'info')[] = []

    if (form1Ref.current?.isDirty() && (await form1Ref.current?.submit())) {
      successMessage.push('result')
    }

    if (form2Ref.current?.isDirty() && (await form2Ref.current?.submit())) {
      successMessage.push('info')
    }

    if (successMessage.length) {
      handleSuccess(
        `${successMessage.map(v => ({ result: '점검결과', info: '설비정보' })[v]).join('와 ')}가 저장되었습니다.`
      )
    } else {
      toast.warning('변동사항이 없습니다')
    }
  }

  const InspectionPageProviders = ({ children }: ChildrenType) => {
    return (
      <inspectionListContext.Provider value={inspectionList}>
        <engineerListContext.Provider value={participatedEngineerList}>{children}</engineerListContext.Provider>
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
              <IconButton disabled={currentTab === 'gallery'} sx={{ p: 0 }} onClick={globalSubmit}>
                <i ref={saveButtonRef} className=' tabler-device-floppy text-white text-3xl' />
              </IconButton>
              <IconButton sx={{ p: 0 }} onClick={() => setOpenAlert(true)}>
                <i className='tabler-trash-x-filled text-red-400 text-3xl' />
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
                value={machineInspectionId}
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
            <TabPanel
              value={'pictures'}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: !isMobile ? 8 : 5,
                position: 'relative'
              }}
            >
              <ChecklistForm
                ref={form1Ref}
                saveButtonRef={saveButtonRef}
                category={category}
                setCategory={setCategory}
              />
              <PictureTable
                machineChecklistItemId={checklistItem?.machineChecklistItemId ?? null}
                scrollableAreaRef={scrollableAreaRef}
                tabHeight={TabListRef.current?.clientHeight ?? 0}
              />
            </TabPanel>
            <InspectionForm ref={form2Ref} saveButtonRef={saveButtonRef} inspectionVersion={inspectionVersion} />
            <TabPanel
              value={'gallery'}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: !isMobile ? 8 : 5
              }}
            >
              <ImageUploadPage />
            </TabPanel>
          </Box>

          {/* 탭 리스트 */}
          <Box ref={TabListRef} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <TabList
              sx={{ display: 'flex', px: isMobile ? '' : 20 }}
              centered
              onChange={(event: React.SyntheticEvent, newValue: currentTabType) => {
                if (newValue !== 'camera') setCurrentTab(newValue)
              }}
            >
              <Tab sx={{ flex: 1 }} value={'pictures'} label={<i className='tabler-photo text-4xl' />} />
              <Tab sx={{ flex: 1 }} value={'info'} label={<i className='tabler-info-circle text-4xl' />} />
              <Tab sx={{ flex: 1 }} value={'gallery'} label={<i className='tabler-library-photo text-4xl' />} />
            </TabList>
          </Box>
        </TabContext>
        <DeleteModal
          title={`해당 설비를\n삭제하시겠습니까?`}
          showDeleteModal={openAlert}
          setShowDeleteModal={setOpenAlert}
          onDelete={handleDeleteInspection}
        />
      </Box>
    </InspectionPageProviders>
  )
}
