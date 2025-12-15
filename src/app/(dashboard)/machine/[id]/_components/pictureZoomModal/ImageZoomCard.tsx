import { useState } from 'react'

import { Backdrop } from '@mui/material'
import { createPortal } from 'react-dom'

/**
 * 이미지 확대 컴포넌트
 * @param src * src string
 * @param alt * alt string
 * @returns
 */
export default function ImageZoomCard({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(false)

  return (
    <>
      <div
        className='h-full p-2 flex items-center justify-center'
        style={{
          border: '2px solid gray',
          borderRadius: 5,
          background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.1))'
        }}
      >
        <img
          className='object-contain'
          src={src}
          alt={alt}
          style={{ maxHeight: '100%', maxWidth: '100%', cursor: 'zoom-in' }}
          onClick={() => setZoom(true)}
        />
      </div>
      {createPortal(
        <Backdrop open={zoom} sx={theme => ({ zIndex: theme.zIndex.modal + 2 })}>
          <img
            src={src}
            alt={alt}
            style={{
              cursor: 'zoom-out',
              objectFit: 'contain',
              maxHeight: '90%',
              background: 'none'
            }}
            onClick={() => setZoom(false)}
          />
        </Backdrop>,
        document.body
      )}
    </>
  )
}
