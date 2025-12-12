import { Box, Typography } from '@mui/material'
import { IconPhotoOff } from '@tabler/icons-react'

const NoPhotoBox = ({ isLoading }: { isLoading: boolean }) => {
  return (
    !isLoading && (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          border: '2px dashed #e0e0e0',
          borderRadius: 1,
          color: 'text.secondary'
        }}
      >
        <IconPhotoOff size={50} />
        <Typography>등록된 검사 사진이 없습니다</Typography>
      </Box>
    )
  )
}

export default NoPhotoBox
