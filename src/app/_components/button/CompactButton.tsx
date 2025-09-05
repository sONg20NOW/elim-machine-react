import { Button } from '@mui/material'
import classNames from 'classnames'

interface CompactButtonProps {
  tablerIcon: string
  onClick: () => void
  text: string
  disabled?: boolean
}

export default function CompactButton({ tablerIcon, onClick, text, disabled = false }: CompactButtonProps) {
  return (
    <Button
      variant='contained'
      startIcon={<i className={classNames(tablerIcon)} />}
      onClick={() => onClick()}
      className='max-sm:is-full'
      disabled={disabled}
    >
      {text}
    </Button>
  )
}
