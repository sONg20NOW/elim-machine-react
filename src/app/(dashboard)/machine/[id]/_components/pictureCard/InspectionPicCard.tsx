import { Button, Checkbox, ImageListItem, ImageListItemBar, Paper, Typography } from '@mui/material'

import type { MachinePicPresignedUrlResponseDtoType } from '@core/types'

// ! 추후에 카드 아래 텍스트 클릭으로 항목 변경될 수 있도록 수정.
// ! 사유: [ 기내압력 점검 ] 제목창 클릭으로 항목 변경되는 거 너무 구리고 공간낭비가 심함.

interface InspectionPicCardProps {
  pic: MachinePicPresignedUrlResponseDtoType
  showCheck: boolean
  checked: boolean
  handleClick: (pic: MachinePicPresignedUrlResponseDtoType) => void
  handleClickItemName?: () => void
  handleClickSubItemName?: () => void
}

/**
 * 설비사진 컴포넌트
 * @param pic * 사진 정보
 * @param showCheck * 선택삭제 토글 여부 state
 * @param checked * 체크 여부
 * @param handleClick * 사진 카드 클릭 시 동작 함수
 * @param handleClickItemName 점검항목 텍스트 클릭 시 동작 함수
 * @param handleClickSubItemName 하위항목 텍스트 클릭 시 동작 함수
 * @returns
 */
export default function InspectionPicCard({
  pic,
  showCheck,
  checked,
  handleClick,
  handleClickItemName,
  handleClickSubItemName
}: InspectionPicCardProps) {
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
        <Typography
          {...(handleClickItemName && { component: Button, sx: { p: 0 }, onClick: handleClickItemName })}
          className='text-green-600'
        >
          {pic.machineProjectChecklistItemName}
        </Typography>
        <Typography
          {...(handleClickSubItemName && { component: Button, sx: { p: 0 }, onClick: handleClickSubItemName })}
          className='text-gray-700'
          style={pic.alternativeSubTitle ? { textDecoration: 'line-through', opacity: '60%' } : {}}
        >
          {pic.machineProjectChecklistSubItemName}
        </Typography>
        <Typography className='text-blue-500'>{pic.alternativeSubTitle}</Typography>
        <Typography className='text-red-500'>{pic.measuredValue}</Typography>
      </div>
    </div>
  )
}
