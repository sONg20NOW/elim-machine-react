'use client'

import type { MouseEvent, SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import { CardContent, Tab, Typography } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import axios from 'axios'

import SiteInfoContent from './siteInfoContent'
import PlanContent from './planContent'
import MachineContent from './machineContent'
import MachinePictures from './machinePictures'
import NoteContent from './noteContent'
import type { MachineProjectDetailDtoType } from '@/app/_type/types'

const MachineUpdatePage = () => {
  const params = useParams()
  const id = params?.id as string

  const [projectData, setProjectData] = useState<MachineProjectDetailDtoType | null>(null)
  const [engineerOptions, setEngineerOptions] = useState([])
  const [value, setValue] = useState<string>('1')

  const init = async (machineId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machine-projects/${machineId}`, {
      method: 'GET'
    })

    const result = await response.json()

    setProjectData(result.data)
  }

  const initEngineer = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/engineers/options`)
    const options = response.data.data.engineers

    setEngineerOptions(options)
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (id) init(id)
    if (id) initEngineer()
  }, [id])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='기계설비현장 자세히보기' className='pbe-4' />
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
  )
}

export default MachineUpdatePage
