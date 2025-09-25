import { IconButton, Input } from '@mui/material'

interface SearchBarProps {
  placeholder: string
  setSearchKeyword: (name: string) => void
  disabled?: boolean
  className?: string
}

/**
 *
 * @param onClick
 * e.target.value를 인자로 넣는 함수
 * @returns
 */
export default function SearchBar({ placeholder, setSearchKeyword, disabled = false, className }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        id={placeholder}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            setSearchKeyword(e.target.value)
          }
        }}
        placeholder={placeholder}
        className='max-sm:is-full min-w-60'
        disabled={disabled}
        sx={{
          border: '1px solid var(--mui-palette-customColors-inputBorder)',
          borderRadius: 6,
          background: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'var(--mui-palette-primary-main)'
          },
          '&.Mui-focused': {
            borderColor: 'var(--mui-palette-primary-main)'
          },
          padding: '3px 10px',
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
          backgroundColor: 'white'
        }}
        disableUnderline={true}
      />
      <IconButton
        onClick={() => {
          const searchInput = document.getElementById(placeholder) as HTMLInputElement

          setSearchKeyword(searchInput?.value ?? '')
        }}
        disabled={disabled}
        color='primary'
        className='absolute right-0'
      >
        <i className='tabler-search' />
      </IconButton>
    </div>
  )
}
