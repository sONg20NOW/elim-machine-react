import { create } from 'zustand'

// 현재 선택된 설비를 전역 상태로 관리하기 위해 zustand 스토어 생성
// 사용처: 기계설비현장 - 설비목록 - 설비 선택 시 (상태 props drilling하기 싫어서 사용)
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
    console.log(`zustand call (currentInspectionId : ${value})!`)
  }
}))

export default useCurrentInspectionIdStore
