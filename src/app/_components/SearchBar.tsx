export default function SearchBar() {
  return (
    <div className='flex justify-center items-center gap-2'>
      <Input
        value={name}
        onChange={(e: any) => setName(e.target.value)}
        id='name_search_input'
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            setNameToFilter(name)
            setPage(0)
          }
        }}
        placeholder='이름으로 검색'
        className='max-sm:is-full'
        disabled={disabled}
        sx={{
          borderTop: '1px solid var(--mui-palette-customColors-inputBorder)',
          borderBottom: '1px solid var(--mui-palette-customColors-inputBorder)',
          borderLeft: '1px solid var(--mui-palette-customColors-inputBorder)',
          borderRight: '1px solid var(--mui-palette-customColors-inputBorder)',
          borderRadius: 0,
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
        tablerIcon='tabler-search'
        onClick={() => {
          setNameToFilter(name)
          setPage(0)
        }}
        disabled={disabled}
      />
    </div>
  )
}
