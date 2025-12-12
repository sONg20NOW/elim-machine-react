import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 로그인과 리프레쉬 반환값으로 오는 유저 정보를 전역 상태로 관리하기 위해 zustand 스토어 생성
// 사용처: 반갑습니다 멘트에 들어가는 유저 이름, 클릭 시 나오는 유저 모달

export type projectSummaryType = {
  machineProjectName: string | null
  beginDate: string | null
  endDate: string | null
  engineerNames: string[] | null
} | null

interface ProjectSummaryState {
  projectSummary: projectSummaryType
  setProjectSummary: (value: projectSummaryType) => void
  removeProjectSummary: () => void
}

const ProjectSumamryCreator: StateCreator<ProjectSummaryState> = set => ({
  // ⭐ 초기 상태 (State)
  projectSummary: null,

  // ⭐ 액션 (Action)
  setProjectSummary: (value: projectSummaryType) => {
    set({ projectSummary: value }) // set 함수를 통해 상태 업데이트
    console.log(`zustand call (setProjectSummary : ${value})!`)
  },

  removeProjectSummary: () => {
    set({ projectSummary: null })
  }
})

const useProjectSummaryStore = create<ProjectSummaryState>()(
  persist(ProjectSumamryCreator, {
    name: 'projectSumamry'
  })
)

export default useProjectSummaryStore
