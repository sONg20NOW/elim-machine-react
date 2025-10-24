// src/hooks/useGetChecklistInfo.ts (예시)

import type { QueryFunction } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { auth } from '@/lib/auth' // 실제 auth 임포트 경로 사용
import { QUERY_KEYS } from '@/app/_constants/queryKeys' // 실제 쿼리 키 임포트 경로 사용
import type { MachineInspectionDetailResponseDtoType } from '@/@core/types' // 타입 임포트

const fetchDetailInspection: QueryFunction<MachineInspectionDetailResponseDtoType, string[]> = async data => {
  const [keyInfo, machineProjectId, machineInspectionId] = data.queryKey

  // API 호출 로직
  const response = await auth.get<{
    data: MachineInspectionDetailResponseDtoType
  }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}`)

  console.log(`get ${keyInfo}!`, response.data.data.machineChecklistItemsWithPicCountResponseDtos)

  return response.data.data
}

export const useGetChecklistInfo = (machineProjectId: string, machineInspectionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchDetailInspection,
    select: data => {
      console.log('select machineChecklistItemsWithPicCountResponseDtos!')

      return data.machineChecklistItemsWithPicCountResponseDtos
    },

    // select 로직은 queryFn 내부에서 처리하여 반환 타입을 단순화했습니다.
    // 이전 코드의 select 로직을 queryFn에 통합했습니다.
    // select: v => v.data.data.machineChecklistItemsWithPicCountResponseDtos,

    // 페이지 이동 시 불필요한 재요청을 막기 위해 staleTime 설정 권장
    staleTime: 1000 * 60 * 5 // 5분
  })
}

export const useGetSingleInspection = (machineProjectId: string, machineInspectionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchDetailInspection,
    select: data => {
      console.log('select machineInspectionResponseDto!')

      return data.machineInspectionResponseDto
    },

    // select 로직은 queryFn 내부에서 처리하여 반환 타입을 단순화했습니다.
    // 이전 코드의 select 로직을 queryFn에 통합했습니다.
    // select: v => v.data.data.machineChecklistItemsWithPicCountResponseDtos,

    // 페이지 이동 시 불필요한 재요청을 막기 위해 staleTime 설정 권장
    staleTime: 1000 * 60 * 5 // 5분
  })
}
