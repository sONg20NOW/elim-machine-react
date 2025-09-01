import Grid from '@mui/material/Grid2'

import UserListTable from './UserListTable'

const Employee = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserListTable />
      </Grid>
    </Grid>
  )
}

export default Employee
