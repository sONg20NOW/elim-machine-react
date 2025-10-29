import { useMediaQuery, useTheme } from '@mui/material'

export default function useIsTablet() {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  return isTablet
}
