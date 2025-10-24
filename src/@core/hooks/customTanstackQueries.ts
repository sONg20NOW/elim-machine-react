// src/hooks/useGetChecklistInfo.ts (예시)

import { useCallback } from 'react'

import type { QueryFunction } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { auth } from '@/lib/auth' // 실제 auth 임포트 경로 사용
import { QUERY_KEYS } from '@/app/_constants/queryKeys' // 실제 쿼리 키 임포트 경로 사용
import type {
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType
} from '@/@core/types' // 타입 임포트

// GET /api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}
const fetchDetailInspection: QueryFunction<MachineInspectionDetailResponseDtoType, string[]> = async data => {
  const [keyInfo, machineProjectId, machineInspectionId] = data.queryKey

  // API 호출 로직
  const response = await auth
    .get<{
      data: MachineInspectionDetailResponseDtoType
    }>(`/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}`)
    .then(v => v.data.data)

  console.log(`!!! queryFn ${keyInfo}:`, response)

  return response
}

export const useGetChecklistInfo = (machineProjectId: string, machineInspectionId: string) => {
  const selectMachineChecklistItemsWithPicCountResponseDtos = useCallback(
    (data: MachineInspectionDetailResponseDtoType) => {
      console.log('select machineChecklistItemsWithPicCountResponseDtos!')

      return data.machineChecklistItemsWithPicCountResponseDtos
    },
    []
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchDetailInspection,
    select: selectMachineChecklistItemsWithPicCountResponseDtos,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

export const useGetSingleInspection = (machineProjectId: string, machineInspectionId: string) => {
  const selectMachineInspectionResponseDto = useCallback((data: MachineInspectionDetailResponseDtoType) => {
    console.log('select machineInspectionResponseDto!')

    return data.machineInspectionResponseDto
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchDetailInspection,
    select: selectMachineInspectionResponseDto,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-inspection-checklist-item-results/${checklistResultId}
const fetchChecklistResult: QueryFunction<
  MachineInspectionChecklistItemResultResponseDtoType,
  string[]
> = async data => {
  const [keyInfo, machineProjectId, machineInspectionId, checklistResultId] = data.queryKey

  const response = await auth
    .get<{
      data: MachineInspectionChecklistItemResultResponseDtoType
    }>(
      `/api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}/machine-inspection-checklist-item-results/${checklistResultId}`
    )
    .then(v => v.data.data)

  console.log(`!!! queryFn ${keyInfo}:`, response)

  return response
}

export const useGetChecklistResult = (
  machineProjectId: string,
  machineInspectionId: string,
  checklistResultId: string
) => {
  const isEnabled = checklistResultId !== 'undefined'

  return useQuery({
    enabled: isEnabled,
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_CHECKLIST_RESULT(
      machineProjectId,
      machineInspectionId,
      checklistResultId
    ),
    queryFn: fetchChecklistResult,
    staleTime: 1000 * 60 * 5 // 5분
  })
}
