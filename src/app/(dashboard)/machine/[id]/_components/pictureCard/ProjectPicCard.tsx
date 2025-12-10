import { Button, Checkbox, ImageListItem, ImageListItemBar, Paper, Typography } from '@mui/material'

import type { MachineProjectPicReadResponseDtoType } from '@core/types'
import { projectPicOption } from '@/@core/data/options'

interface ProjectPicCardProps {
  pic: MachineProjectPicReadResponseDtoType
  showCheck: boolean
  checked: boolean
  handleClick: (pic: MachineProjectPicReadResponseDtoType) => void
  handleClickLabel?: () => void
}

/**
 * 현장사진 컴포넌트
 * @param pic * 사진 정보
 * @param showCheck * 선택삭제 토글 여부 state
 * @param checked * 체크 여부
 * @param handleClick * 사진 카드 클릭 시 동작 함수
 * @param handleClickLabel 사진 종류 텍스트 클릭 시 동작 함수
 * @returns
 */
export default function ProjectPicCard({
  pic,
  showCheck,
  checked,
  handleClick,
  handleClickLabel
}: ProjectPicCardProps) {
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
        <Typography
          {...(handleClickLabel && { component: Button, sx: { p: 0 }, onClick: handleClickLabel })}
          className='text-green-600'
        >{`${projectPicOption.find(v => v.value === pic.machineProjectPicType)?.label}`}</Typography>
      </div>
    </div>
  )
}
