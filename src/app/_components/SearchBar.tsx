import type { Dispatch, SetStateAction } from 'react'

import { IconButton, Input } from '@mui/material'

interface SearchBarProps {
  name: string
  setName: Dispatch<SetStateAction<string>>
  onClick: () => void
  disabled?: boolean
}

export default function SearchBar({ name, setName, onClick, disabled }: SearchBarProps) {
  return (
    <div className='relative'>
      <Input
        value={name}
        onChange={(e: any) => setName(e.target.value)}
        id='name_search_input'
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            onClick()
          }
        }}
        placeholder='이름으로 검색'
        className='max-sm:is-full'
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
          onClick()
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
