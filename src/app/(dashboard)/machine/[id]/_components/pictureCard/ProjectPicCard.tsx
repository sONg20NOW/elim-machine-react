import { Checkbox, ImageListItem, ImageListItemBar, Paper, Typography } from '@mui/material'

import type { MachineProjectPicReadResponseDtoType } from '@core/types'
import { projectPicOption } from '@/app/_constants/options'

// 현장사진 카드 컴포넌트
export default function ProjectPicCard({
  pic,
  showCheck,
  checked,
  handleClick
}: {
  pic: MachineProjectPicReadResponseDtoType
  showCheck: boolean
  checked: boolean
  handleClick: (pic: MachineProjectPicReadResponseDtoType) => void
}) {
  return (
    <div className='flex flex-col items-center'>
      <Paper
        sx={{
          width: '100%',
          p: 1,
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid lightgray',
          m: 1,
          ':hover': { boxShadow: 4 }
        }}
        variant='outlined'
        key={`${pic.id}`}
        onClick={() => {
          handleClick(pic)
        }}
      >
        <ImageListItem>
          <img
            loading='lazy'
            src={pic.presignedUrl}
            alt={pic.originalFileName}
            style={{
              width: '100%',
              height: '50%',
              objectFit: 'contain',
              background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.1))',
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5
            }}
          />
          <ImageListItemBar sx={{ textAlign: 'center' }} title={pic.originalFileName} />
        </ImageListItem>

        {showCheck && (
          <Checkbox
            color='error'
            sx={{
              position: 'absolute',
              left: 0,
              top: 0
            }}
            checked={checked}
          />
        )}
      </Paper>
      <div className='flex flex-col items-center py-1'>
        <Typography className='text-green-600'>{`${projectPicOption.find(v => v.value === pic.machineProjectPicType)?.label}`}</Typography>
      </div>
    </div>
  )
}
