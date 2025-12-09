import { IconButton, Paper, Typography } from '@mui/material'

import type { machineProjectEngineerDetailDtoType } from '@core/types'

export default function EngineerCard({
  engineer,
  handleDeleteEngineer
}: {
  engineer: machineProjectEngineerDetailDtoType
  handleDeleteEngineer: () => void
}) {
  return (
    <Paper
      elevation={3}
      sx={{
        border: '1px solid lightgray',
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Typography fontSize={18}>{`[${engineer.gradeDescription}] ${engineer.engineerName}`}</Typography>
      <IconButton onClick={handleDeleteEngineer}>
        <i className='tabler-x text-error' />
      </IconButton>
    </Paper>
  )
}
