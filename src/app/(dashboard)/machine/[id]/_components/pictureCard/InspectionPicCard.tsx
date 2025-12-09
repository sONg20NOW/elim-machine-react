import { Checkbox, ImageListItem, ImageListItemBar, Paper, Typography } from '@mui/material'

import type { MachinePicPresignedUrlResponseDtoType } from '@core/types'

// 설비사진 카드 컴포넌트
export default function InspectionPicCard({
  pic,
  showCheck,
  checked,
  handleClick
}: {
  pic: MachinePicPresignedUrlResponseDtoType
  showCheck: boolean
  checked: boolean
  handleClick: (pic: MachinePicPresignedUrlResponseDtoType) => void
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
          ':hover': { boxShadow: 10 }
        }}
        variant='outlined'
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
              height: '100%',
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
        <Typography className='text-green-600'>{pic.machineChecklistItemName}</Typography>
        <Typography
          className='text-gray-700'
          style={pic.alternativeSubTitle ? { textDecoration: 'line-through', opacity: '60%' } : {}}
        >
          {pic.machineChecklistSubItemName}
        </Typography>
        <Typography className='text-blue-500'>{pic.alternativeSubTitle}</Typography>
        <Typography className='text-red-500'>{pic.measuredValue}</Typography>
      </div>
    </div>
  )
}
