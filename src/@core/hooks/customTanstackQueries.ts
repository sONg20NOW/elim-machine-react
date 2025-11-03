import { useCallback } from 'react'

import type { QueryFunction } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { auth } from '@/lib/auth' // 실제 auth 임포트 경로 사용
import { QUERY_KEYS } from '@/app/_constants/queryKeys' // 실제 쿼리 키 임포트 경로 사용
import type {
  MachineCategoryResponseDtoType,
  MachineEnergyTypeResponseDtoType,
  MachineEngineerOptionResponseDtoType,
  MachineInspectionChecklistItemResultResponseDtoType,
  MachineInspectionDetailResponseDtoType,
  MachineInspectionPageResponseDtoType,
  machineInspectionSummaryResponseDtoType,
  MachineLeafCategoryResponseDtoType,
  machineProjectEngineerDetailDtoType,
  MachineProjectPicReadResponseDtoType,
  MachineProjectResponseDtoType,
  MachineProjectScheduleAndEngineerResponseDtoType,
  MachineReportCategoryReadResponseDtoType,
  MachineReportStatusResponseDtoType,
  targetType
} from '@/@core/types' // 타입 임포트

// ------------------------- MachineInspection 관련 -------------------------
// GET /api/machine-projects/${machineProjectId}/machine-inspections : 특정 프로젝트의 설비목록 가져오기
interface MachineInspectionSimpleResponseDtoType {
  id: number
  name: string
}

// GET /api/machine-projects/${machineProjectId}/machine-inspections/simple : 설비 목록 조회 (SIMPLE)
export const useGetInspectionsSimple = (machineProjectId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTIONS_SIMPLE(machineProjectId),
    queryFn: async data => {
      const [keytype, machineProjectId] = data.queryKey

      const response = await auth
        .get<{
          data: { machineInspections: MachineInspectionSimpleResponseDtoType[] }
        }>(`/api/machine-projects/${machineProjectId}/machine-inspections/simple`)
        .then(v => v.data.data.machineInspections)

      console.log(`!!! queryFn ${keytype}:`, response)

      return response
    },
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/${machineProjectId}/machine-inspections : 설비 목록 조회
export const useGetEveryInspections = (machineProjectId: string) => {
  const maxCnt = 100

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTIONS_SIMPLE(machineProjectId),
    queryFn: async data => {
      const [keytype, machineProjectId] = data.queryKey

      const response = await auth
        .get<{
          data: { content: MachineInspectionPageResponseDtoType[] }
        }>(`/api/machine-projects/${machineProjectId}/machine-inspections?size=${maxCnt}`)
        .then(v => v.data.data.content)

      console.log(`!!! queryFn ${keytype}:`, response)

      return response
    },
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/${machineProjectId}/machine-inspections/${machineInspectionId}
const fetchSingleInspection: QueryFunction<MachineInspectionDetailResponseDtoType, string[]> = async data => {
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

// 단일 설비 정보 전체 가져오기
export const useGetSingleInspection = (machineProjectId: string, machineInspectionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchSingleInspection,
    staleTime: 1000 * 60 * 5, // 5분
    enabled: Number(machineInspectionId) > 0
  })
}

// 단일 설비 정보에서 체크리스트 정보만 샘플링
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
    queryFn: fetchSingleInspection,
    select: selectMachineChecklistItemsWithPicCountResponseDtos,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// 단일 설비 정보에서 machineInspectionResponseDto만 샘플링
export const useGetSingleInspectionSumamry = (machineProjectId: string, machineInspectionId: string) => {
  const selectMachineInspectionResponseDto = useCallback((data: MachineInspectionDetailResponseDtoType) => {
    console.log('select machineInspectionResponseDto!')

    return data.machineInspectionResponseDto
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION.GET_INSPECTION_INFO(machineProjectId, machineInspectionId),
    queryFn: fetchSingleInspection,
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

// GET /api/machine-projects/${machineProjectId}/machine-project-pics/overview?machineProjectPicType=OVERVIEW
export const useGetOverviewPics = (machineProjectId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_PROJECT_PIC.GET_OVERVIEW(machineProjectId),
    queryFn: async data => {
      const [keytype, machineProjectId] = data.queryKey

      const response = await auth
        .get<{
          data: { machineProjectPics: MachineProjectPicReadResponseDtoType[] }
        }>(`/api/machine-projects/${machineProjectId}/machine-project-pics/overview?machineProjectPicType=OVERVIEW`)
        .then(v => v.data.data.machineProjectPics)

      console.log(`!!! queryFn ${keytype}:`, response)

      return response
    },
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-categories
export const useGetCategories = () => {
  const fetchCategories: QueryFunction<MachineCategoryResponseDtoType[], string[]> = useCallback(async data => {
    const response = await auth
      .get<{ data: { machineCategoryResponseDtos: MachineCategoryResponseDtoType[] } }>(`/api/machine-categories`)
      .then(v => v.data.data.machineCategoryResponseDtos)

    const [keyType] = data.queryKey

    console.log(`!!! queryFn ${keyType}:`, response)

    return response
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_CATEGORY.GET_MACHINE_CATEGORY,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-categories/leaf
export const useGetLeafCategories = () => {
  const fetchLeafCategories: QueryFunction<MachineLeafCategoryResponseDtoType[], string[]> = useCallback(async data => {
    const response = await auth
      .get<{ data: { leafCategories: MachineLeafCategoryResponseDtoType[] } }>(`/api/machine-categories/leaf`)
      .then(v => v.data.data.leafCategories)

    const [keyType] = data.queryKey

    console.log(`!!! queryFn ${keyType}:`, response)

    return response
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_CATEGORY.GET_MACHINE_LEAF_CATEGORY,
    queryFn: fetchLeafCategories,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-energy-types
export const useGetEnergyTypes = () => {
  const fetchEnergyTypes: QueryFunction<MachineEnergyTypeResponseDtoType[], string[]> = useCallback(async data => {
    const response = await auth
      .get<{ data: { machineEnergyTypes: MachineEnergyTypeResponseDtoType[] } }>(`/api/machine-energy-types`)
      .then(v => v.data.data.machineEnergyTypes)

    const [keyType] = data.queryKey

    console.log(`!!! queryFn ${keyType}:`, response)

    return response
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_ENERGY_TYPE,
    queryFn: fetchEnergyTypes,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/machine-energy-targets
export const useGetEnergyTargets = (machineProjectId: string, machineEnergyTypeId: string) => {
  const fetchEnergyTargets: QueryFunction<targetType[], string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: { machineEnergyTargets: targetType[] }
        }>(
          `/api/machine-projects/${machineProjectId}/machine-energy-targets?machineEnergyTypeId=${machineEnergyTypeId}`
        )
        .then(v => v.data.data.machineEnergyTargets)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId, machineEnergyTypeId]
  )

  const isEnabled = machineEnergyTypeId !== 'undefined'

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_ENERGY_TARGET.GET_ENERGY_TARGETS(machineProjectId, machineEnergyTypeId),
    queryFn: fetchEnergyTargets,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/machine-energy-usages 에너지 사용량 전체 조회
export const useGetEnergyUsages = (machineProjectId: string, machineEnergyTypeId: string) => {
  const fetchEnergyUsages: QueryFunction<
    { targetId: number; year: number; monthlyValues: Record<string, number> }[],
    string[]
  > = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: { machineEnergyUsages: { targetId: number; year: number; monthlyValues: Record<string, number> }[] }
        }>(
          `/api/machine-projects/${machineProjectId}/machine-energy-usages?machineEnergyTypeId=${machineEnergyTypeId}&years=${'2022, 2023, 2024, 2025'}`
        )
        .then(v => v.data.data.machineEnergyUsages)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId, machineEnergyTypeId]
  )

  const isEnabled = machineEnergyTypeId !== 'undefined'

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_ENERGY_USAGE.GET_ENERGY_USAGES(machineProjectId, machineEnergyTypeId),
    queryFn: fetchEnergyUsages,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-report-categories
export const useGetReportCategories = () => {
  const fetchReportCategories: QueryFunction<MachineReportCategoryReadResponseDtoType[], string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: { machineReportCategories: MachineReportCategoryReadResponseDtoType[] }
        }>(`/api/machine-report-categories`)
        .then(v => v.data.data.machineReportCategories)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    []
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_REPORT_CATEGORY_CONTROLLER,
    queryFn: fetchReportCategories,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/machine-reports/status
export const useGetReportStatuses = (machineProjectId: string, machineReportCategoryIds: number[]) => {
  const fetchReportStatuses: QueryFunction<MachineReportStatusResponseDtoType[], string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: { machineReports: MachineReportStatusResponseDtoType[] }
        }>(
          `/api/machine-projects/${machineProjectId}/machine-reports/status?machineReportCategoryIds=${machineReportCategoryIds.join(', ')}`
        )
        .then(v => v.data.data.machineReports)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId, machineReportCategoryIds]
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_REPORT.GET_MACHINE_REPORT_STATUS(machineProjectId, machineReportCategoryIds),
    queryFn: fetchReportStatuses,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/machine-inspection-opinions/summary
export const useGetInspectionOpinions = (machineProjectId: string) => {
  const fetchInspectionOpinions: QueryFunction<machineInspectionSummaryResponseDtoType, string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: machineInspectionSummaryResponseDtoType
        }>(`/api/machine-projects/${machineProjectId}/machine-inspection-opinions/summary`)
        .then(v => v.data.data)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId]
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_INSPECTION_OPINION.GET_INSPECTION_OPINION(machineProjectId),
    queryFn: fetchInspectionOpinions,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// ------------------------- MachineProject 관련 -------------------------
// GET /api/machine-projects/{machineProjectId}/machine-project-engineers
export const useGetParticipatedEngineerList = (machineProjectId: string) => {
  const fetchParticipatedEngineers: QueryFunction<machineProjectEngineerDetailDtoType[], string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: { machineProjectEngineerResponseDtos: machineProjectEngineerDetailDtoType[] }
        }>(`/api/machine-projects/${machineProjectId}/machine-project-engineers`)
        .then(v => v.data.data.machineProjectEngineerResponseDtos)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId]
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_PROJECT.GET_MACHINE_PROJECT_ENGINEERS(machineProjectId),
    queryFn: fetchParticipatedEngineers,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/schedule-tab
export const useGetScheduleTab = (machineProjectId: string) => {
  const fetchScheduleTab: QueryFunction<MachineProjectScheduleAndEngineerResponseDtoType, string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: MachineProjectScheduleAndEngineerResponseDtoType
        }>(`/api/machine-projects/${machineProjectId}/schedule-tab`)
        .then(v => v.data.data)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId]
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_PROJECT.GET_MACHINE_PROJECT_SCHEDULE_TAB(machineProjectId),
    queryFn: fetchScheduleTab,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// GET /api/machine-projects/{machineProjectId}/
export const useGetMachineProject = (machineProjectId: string) => {
  const fetchMachineProjectData: QueryFunction<MachineProjectResponseDtoType, string[]> = useCallback(
    async data => {
      const response = await auth
        .get<{
          data: MachineProjectResponseDtoType
        }>(`/api/machine-projects/${machineProjectId}`)
        .then(v => v.data.data)

      const [keyType] = data.queryKey

      console.log(`!!! queryFn ${keyType}:`, response)

      return response
    },
    [machineProjectId]
  )

  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_PROJECT.GET_MACHINE_PROJECT(machineProjectId),
    queryFn: fetchMachineProjectData,
    staleTime: 1000 * 60 * 5 // 5분
  })
}

// ------------------------- Engineer 관련 -------------------------
// GET /api/machine-projects/{machineProjectId}/machine-project-engineers
export const useGetEngineerList = () => {
  const fetchEngineers: QueryFunction<MachineEngineerOptionResponseDtoType[], string[]> = useCallback(async data => {
    const response = await auth
      .get<{
        data: { engineers: MachineEngineerOptionResponseDtoType[] }
      }>(`/api/engineers/options`)
      .then(v => v.data.data.engineers)

    const [keyType] = data.queryKey

    console.log(`!!! queryFn ${keyType}:`, response)

    return response
  }, [])

  return useQuery({
    queryKey: QUERY_KEYS.ENGINEER.GET_ENGINEERS_OPTIONS,
    queryFn: fetchEngineers,
    staleTime: 1000 * 60 * 5 // 5분
  })
}
