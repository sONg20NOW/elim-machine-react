import Grid from '@mui/material/Grid2'

import MachineListTable from './MachineListTable'

const Machine = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <MachineListTable />
      </Grid>
    </Grid>
  )
}

export default Machine
