import { IconButton, ImageListItem, ImageListItemBar, Paper } from '@mui/material'
import { IconX } from '@tabler/icons-react'

export default function PicPreviewCard({ file, handleClickX }: { file: File; handleClickX: () => void }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 1,
        position: 'relative',
        border: '1px solid lightgray',
        m: 1,
        ':hover': { boxShadow: 4 }
      }}
    >
      <ImageListItem>
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          style={{
            width: '100%',
            height: '50%',
            objectFit: 'contain',
            background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.1))'
          }}
        />
        <ImageListItemBar title={file.name} sx={{ textAlign: 'center' }} />
      </ImageListItem>
      <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={handleClickX}>
        <IconX size={30} className='text-error' />
      </IconButton>
    </Paper>
  )
}
