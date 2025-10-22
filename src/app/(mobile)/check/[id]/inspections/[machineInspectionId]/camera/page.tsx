'use client'
import  { useRef, useState } from 'react'


const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user'
}

const WebcamCapture = () => (
  <Webcam
)

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null)
  const [imgSrc, setImgSrc] = useState<string>()

  const capture = () => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()

    if (!imageSrc) return
    setImgSrc(imageSrc)
  }

  return (
    <>
      <WebcamCapture />
      <button onClick={capture}>캡처</button>
      {imgSrc && <img src={imgSrc} alt='Captured' />}
    </>
  )
}
