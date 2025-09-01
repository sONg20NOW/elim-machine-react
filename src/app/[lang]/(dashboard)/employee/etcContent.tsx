import { DialogContent } from '@mui/material'
import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'

const EtcContent = ({ userData, setUserData }: any) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='취업자 유형'
            value={userData?.memberEtcResponseDto?.employedType || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  employedType: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='소득세 감면 시작일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberEtcResponseDto?.incomeTaxReducedBeginDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  incomeTaxReducedBeginDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='소득세 감면 종료일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberEtcResponseDto?.incomeTaxReducedEndDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  incomeTaxReducedEndDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='군복무 기간'
            value={userData?.memberEtcResponseDto?.militaryPeriod || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  militaryPeriod: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='신중년 적합직무'
            value={userData?.memberEtcResponseDto?.newMiddleAgedJobs || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  newMiddleAgedJobs: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='시니어 인턴십'
            value={userData?.memberEtcResponseDto?.seniorInternship || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  seniorInternship: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='청년 디지털'
            value={userData?.memberEtcResponseDto?.youthDigital || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  youthDigital: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='청년 채용 특별 장려금'
            value={userData?.memberEtcResponseDto?.youthEmploymentIncentive || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  youthEmploymentIncentive: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='청년 일자리 도약'
            value={userData?.memberEtcResponseDto?.youthJobLeap || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberEtcResponseDto: {
                  ...userData?.memberEtcResponseDto,
                  youthJobLeap: e.target.value
                }
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  )
}

export default EtcContent
