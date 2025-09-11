import { IconButton, Input } from '@mui/material'

interface SearchBarProps {
  placeholder: string
  onClick: (name: string) => void
  disabled?: boolean
}

/**
 *
 * @param onClick
 * e.target.value를 인자로 넣는 함수
 * @returns
 */
export default function SearchBar({ placeholder, onClick, disabled }: SearchBarProps) {
  return (
    <div className='relative'>
      <Input
        id='name_search_input'
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            onClick(e.target.value)
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
          borderBottomLeftRadius: 6
        }}
        disableUnderline={true}
      />
      <IconButton
        onClick={() => {
          const nameSearchInput = document.getElementById('name_search_input') as HTMLInputElement

          onClick(nameSearchInput?.value ?? '')
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
