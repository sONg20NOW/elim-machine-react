import type { Dispatch, SetStateAction } from 'react'
import { memo, useContext } from 'react'

import { useParams } from 'next/navigation'

import { Box, InputLabel, MenuItem, TextField } from '@mui/material'

import { isMobileContext } from '@/components/ProtectedPage'
import { useGetChecklistInfo } from '@core/hooks/customTanstackQueries'

interface EmptyCategorySelectorProps {
  category: string
  setCategory: Dispatch<SetStateAction<string>>
}

const EmptyCategorySelector = memo(({ category, setCategory }: EmptyCategorySelectorProps) => {
  const { id: machineProjectId, machineInspectionId } = useParams()

  const { data: checklistList } = useGetChecklistInfo(machineProjectId!.toString(), machineInspectionId!.toString())

  const isMobile = useContext(isMobileContext)

  const checklistItem = checklistList?.find(v => v.machineChecklistItemId === Number(category))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: !isMobile ? 2 : 1 }}>
      <div className='flex flex-col gap-1'>
        <div className='flex justify-between items-center'>
          <InputLabel sx={{ px: 2 }}>점검항목</InputLabel>
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
          {checklistList?.map(v =>
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
    </Box>
  )
})

export default EmptyCategorySelector
