import { DialogContent } from '@mui/material'
import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultSelectBox from '@/components/selectbox/defaultSelectBox'

const CareerContent = ({ userData, setUserData }: any) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'grade'}
            label='등급'
            value={userData?.memberCareerResponseDto?.grade || ''}
            loading={true}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  grade: e.target.value
                }
              })
            }
            options={[
              { value: 'BEGINNER', label: '초급' },
              { value: 'INTERMEDIATE', label: '중급' },
              { value: 'ADVANCED', label: '고급' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='직무분야'
            value={userData?.memberCareerResponseDto?.jobField || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  jobField: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='동종업계 경력(월)'
            type='number'
            value={userData?.memberCareerResponseDto?.industrySameMonth || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  industrySameMonth: Number(e.target.value)
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='타업계 경력(월)'
            type='number'
            value={userData?.memberCareerResponseDto?.industryOtherMonth || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  industryOtherMonth: Number(e.target.value)
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='자격증1'
            value={userData?.memberCareerResponseDto?.licenseName1 || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  licenseName1: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='자격증2'
            value={userData?.memberCareerResponseDto?.licenseName2 || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberCareerResponseDto: {
                  ...userData?.memberCareerResponseDto,
                  licenseName2: e.target.value
                }
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  )
}

export default CareerContent
