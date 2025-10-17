import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useContext, useState } from 'react'

import TabPanel from '@mui/lab/TabPanel'
import { Box, Checkbox, InputLabel, MenuItem, TextField, Typography } from '@mui/material'

import PictureTable from '../_components/PictureTable'
import { isMobileContext } from '@/app/_components/ProtectedPage'
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType
} from '@/app/_type/types'
import { checklistItemsContext } from '../page'

// ! 전역 상태 관리로 props 줄이기.

interface PicturesPageProps {
  scrollableAreaRef: RefObject<HTMLElement>
  TabListRef: RefObject<HTMLElement>
  inspection?: MachineInspectionDetailResponseDtoType
  checklistResult?: MachineInspectionChecklistItemResultResponseDtoType
  setChecklistResult: Dispatch<SetStateAction<MachineInspectionChecklistItemResultResponseDtoType | undefined>>
  getInspectionData: () => void
  category: string
  setCategory: Dispatch<SetStateAction<string>>
}

export default function PicturesPage({
  scrollableAreaRef,
  TabListRef,
  inspection,
  checklistResult,
  setChecklistResult,
  category,
  setCategory,
  getInspectionData
}: PicturesPageProps) {
  const isMobile = useContext(isMobileContext)
  const checklistItems = useContext(checklistItemsContext)

  const [emptyMode, setEmptyMode] = useState(false)

  const checklistItem = checklistItems.find(v => v.machineChecklistItemId === Number(category))

  return (
    <TabPanel
      value={'pictures'}
      sx={{
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
            {checklistItems.map(v =>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
          {category !== '전체' && (
            <div className='flex flex-col gap-1'>
              <InputLabel sx={{ px: 2 }}>미흡사항</InputLabel>
              <TextField
                size={isMobile ? 'small' : 'medium'}
                id='requirement'
                fullWidth
                value={checklistResult?.deficiencies ?? ''}
                onChange={e =>
                  setChecklistResult(
                    prev => prev && { ...prev, deficiencies: e.target.value === '' ? null : e.target.value }
                  )
                }
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
                onChange={e =>
                  setChecklistResult(
                    prev => prev && { ...prev, actionRequired: e.target.value === '' ? null : e.target.value }
                  )
                }
                hiddenLabel
                multiline
                slotProps={{ input: { sx: { fontSize: 18 } } }}
              />
            </div>
          )}
        </Box>
      </Box>
      {inspection && (
        <PictureTable
          machineChecklistItemId={checklistItem?.machineChecklistItemId ?? null}
          emptyMode={emptyMode}
          scrollableAreaRef={scrollableAreaRef}
          checklists={checklistItems}
          refetchChecklists={getInspectionData}
          tabHeight={TabListRef.current?.clientHeight ?? 0}
        />
      )}
    </TabPanel>
  )
}
