export default function OnProgressPage() {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <img src='/images/onBuilding.png' width={'50%'} />
      <div style={{ fontSize: 20, color: 'dimgray', textAlign: 'center' }}>
        <p>현재 페이지는 작업 중입니다.</p>
        <p>조금만 기다려주세요.</p>
      </div>
    </div>
  )
}
