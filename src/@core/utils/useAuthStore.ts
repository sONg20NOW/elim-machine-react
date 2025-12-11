import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 현재 선택된 설비를 전역 상태로 관리하기 위해 zustand 스토어 생성
// 사용처: 기계설비현장 - 설비목록 - 설비 선택 시 (상태 props drilling하기 싫어서 사용)
interface AccessTokenState {
  accessToken: string | null
  setAccessToken: (value: string | null) => void
}

const accessTokenCreator: StateCreator<AccessTokenState> = set => ({
  // ⭐ 초기 상태 (State)
  accessToken: '',

  // ⭐ 액션 (Action)
  setAccessToken: (value: string | null) => {
    set({ accessToken: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call: accessToken`)
  }
})

const useAccessTokenStore = create<AccessTokenState>()(
  persist(accessTokenCreator, {
    name: 'accessToken'
  })
)

export default useAccessTokenStore
