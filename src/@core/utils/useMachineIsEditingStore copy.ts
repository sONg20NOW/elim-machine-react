import { create } from 'zustand'

interface CurrentInspectionIdState {
  currentInspectionId: number
  setCurrentInspectionId: (value: number) => void
}

const useCurrentInspectionIdStore = create<CurrentInspectionIdState>(set => ({
  // ⭐ 초기 상태 (State)
  currentInspectionId: 0,

  // ⭐ 액션 (Action)
  setCurrentInspectionId: (value: number) => {
    set({ currentInspectionId: value }) // set 함수를 통해 상태 업데이트
    console.log('zustand call (currentInspectionId)!')
  }
}))

export default useCurrentInspectionIdStore
