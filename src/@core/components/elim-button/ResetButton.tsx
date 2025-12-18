import { IconButton, Tooltip } from '@mui/material'
import { IconRestore } from '@tabler/icons-react'

export default function ResetButton({ isDirty = true, onClick }: { isDirty?: boolean; onClick: () => void }) {
  return (
    <Tooltip arrow title={isDirty ? '변경사항 폐기' : '변경사항 없음'}>
      <IconButton color={isDirty ? 'error' : 'secondary'} onClick={onClick}>
        <IconRestore />
      </IconButton>
    </Tooltip>
  )
}
