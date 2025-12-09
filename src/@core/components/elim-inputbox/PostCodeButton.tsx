import { useRef, useState } from 'react'

import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { IconMapPinFilled, IconX } from '@tabler/icons-react'

interface PostCodeButtonProps {
  onChange: (value: string) => void
}

/**
 * DaumPostCode 서비스 창이 뜨는 버튼
 * @param onChange 값을 받아서 저장하는 함수
 */
export default function PostCodeButton({ onChange }: PostCodeButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Button size='small' variant='contained' type='button' color='primary' onClick={() => setOpen(true)}>
        <Typography>검색</Typography>
      </Button>
      <Dialog
        fullWidth
        open={open}
        slotProps={{
          transition: {
            onEntered: () => {
              if (!containerRef.current) return

              // @ts-ignore
              new daum.Postcode({
                oncomplete: (data: any) => {
                  setOpen(false)
                  onChange && onChange(data.address)
                },
                width: '100%',
                height: '100%'
              }).embed(containerRef.current)
            }
          }
        }}
      >
        <DialogTitle sx={{ alignItems: 'center', display: 'flex', gap: 2, position: 'relative' }} variant='h4'>
          <IconMapPinFilled />
          우편번호 검색
          <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 4, right: 4 }}>
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div
            ref={containerRef}
            style={{ width: '100%', height: '40dvh', position: 'relative', boxSizing: 'border-box' }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
