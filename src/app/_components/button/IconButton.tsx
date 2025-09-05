import { Button } from '@mui/material'

import classNames from 'classnames'

import type { BoxSizeType } from '@/app/_schema/types'

interface IconButtonProps {
  tablerIcon: string
  onClick: () => void
  size?: BoxSizeType
  disabled?: boolean
}

// TODO: size prop에 맞게 크기 변경
// TODO: variant에 따라 스타일 변경
export default function IconButton({ tablerIcon, onClick, disabled = false }: IconButtonProps) {
  return (
    <Button
      variant={'contained'}
      disabled={disabled}
      className='text-color-primary-light  hover:text-color-primary-dark grid place-items-center p-[5px]'
    >
      <i
        className={classNames('text-3xl text-white', tablerIcon)}
        onClick={() => {
          onClick()
        }}
      />
    </Button>
  )
}
