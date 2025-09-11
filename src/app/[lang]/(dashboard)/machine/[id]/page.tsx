'use client'

import type { MouseEvent, SyntheticEvent } from 'react'
import { createContext, useEffect, useState } from 'react'

import { redirect, useParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { CardContent, Tab, Typography } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import axios from 'axios'

import SiteInfoContent from './_components/siteInfoContent'
import PlanContent from './_components/planContent'
import MachineContent from './_components/machineContent'
import MachinePictures from './_components/machinePictures'
import NoteContent from './_components/noteContent'
import type { MachineProjectDetailDtoType, machineProjectEngineerDetailDtoType } from '@/app/_type/types'

export const ProjectDataContext = createContext(null)

const MachineUpdatePage = () => {
  const params = useParams()
  const id = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectDetailDtoType | null>(null)
  const [engineerOptions, setEngineerOptions] = useState<machineProjectEngineerDetailDtoType[]>([])
  const [value, setValue] = useState<string>('1')

  // 프로젝트 데이터 가져오기.
  const getProjectData = async (machineId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineId}`, {
      method: 'GET'
    })

    const result = await response.json()

    setProjectData(result.data)
  }

  // 엔지니어 목록 가져오기
  const getEngineerList = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`)
    const options = response.data.data.engineers

    setEngineerOptions(options)
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (id) getProjectData(id)
    if (id) getEngineerList()
  }, [id])

  return (
    <ProjectDataContext.Provider value={{ projectData, setProjectData }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <div className='flex gap-0 p-6 items-center'>
              <CardHeader
                title='기계설비현장'
                sx={{ cursor: 'pointer', padding: 0 }}
                slotProps={{ title: { sx: { ':hover': { color: 'primary.main' } } } }}
                onClick={() => redirect('/machine')}
              />
              <i className='tabler-chevron-right' />
              <CardHeader title={projectData?.machineProjectResponseDto.machineProjectName} sx={{ padding: 0 }} />
            </div>

            <CardContent>
              <TabContext value={value}>
                <TabList onChange={handleChange} aria-label='nav tabs example'>
                  <Tab
                    value='1'
                    component='a'
                    label='현장정보'
                    href='/site'
                    onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                  />
                  <Tab
                    value='2'
                    component='a'
                    label='점검일정 / 참여기술진'
                    href='/plan'
                    onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                  />
                  <Tab
                    value='3'
                    component='a'
                    label='설비목록'
                    href='/list'
                    onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                  />
                  <Tab
                    value='4'
                    component='a'
                    label='전체사진'
                    href='/pictures'
                    onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                  />
                  <Tab
                    value='5'
                    component='a'
                    label='특이사항'
                    href='/memo'
                    onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                  />
                </TabList>
                <TabPanel value='1'>
                  {projectData?.machineProjectResponseDto ? (
                    <SiteInfoContent projectData={projectData} />
                  ) : (
                    <Typography>프로젝트 정보를 불러오는 중입니다.</Typography>
                  )}
                </TabPanel>
                <TabPanel value='2'>
                  {projectData?.machineProjectScheduleAndEngineerResponseDto ? (
                    <PlanContent projectData={projectData} engineerOptions={engineerOptions} />
                  ) : (
                    <Typography>점검일정 및 참여기술진 정보를 불러오는 중입니다.</Typography>
                  )}
                </TabPanel>
                <TabPanel value='3'>
                  <MachineContent id={id} engineerOptions={engineerOptions} />
                </TabPanel>
                <TabPanel value='4'>
                  <MachinePictures id={id} />
                </TabPanel>
                <TabPanel value='5'>
                  {projectData ? (
                    <NoteContent id={id} projectData={projectData} />
                  ) : (
                    <Typography>특이사항 정보를 불러오는 중입니다.</Typography>
                  )}
                </TabPanel>
              </TabContext>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ProjectDataContext.Provider>
  )
}

export default MachineUpdatePage
