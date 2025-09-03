import { DialogContent } from '@mui/material'
import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultSelectBox from '@/components/selectbox/MultiSelectBox'

const BasicContent = ({ userData, setUserData }: any) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='이름'
            value={userData?.memberBasicResponseDto?.name || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  name: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='이메일'
            value={userData?.memberBasicResponseDto?.email || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  email: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'companyName'}
            label='소속'
            value={userData?.memberBasicResponseDto?.companyName || ''}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  companyName: e.target.value
                }
              })
            }
            options={[
              { value: '엘림기술원(주)', label: '엘림기술원(주)' },
              { value: '엘림주식회사', label: '엘림주식회사' },
              { value: '엘림테크원(주)', label: '엘림테크원(주)' },
              { value: '이엘엔지니어링(주)', label: '이엘엔지니어링(주)' },
              { value: '이엘테크원(주)', label: '이엘테크원(주)' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'role'}
            label='권한'
            value={userData?.memberBasicResponseDto?.role || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  role: e.target.value
                }
              })
            }
            options={[
              { value: 'USER', label: '유저' },
              { value: 'STAFF', label: '직원' },
              { value: 'MANAGER', label: '매니저' },
              { value: 'ADMIN', label: '어드민' },
              { value: 'SUPERADMIN', label: '슈퍼어드민' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'memberStatusDescription'}
            label='재직 상태'
            value={userData?.memberBasicResponseDto?.memberStatus || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  memberStatus: e.target.value
                }
              })
            }
            options={[
              { value: 'NORMAL', label: '재직중' },
              { value: 'QUIT', label: '퇴사' },
              { value: 'PENDING', label: '가입 승인대기' },
              { value: 'LEAVE', label: '휴직' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label='비고'
            value={userData?.memberBasicResponseDto?.note || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberBasicResponseDto: {
                  ...userData?.memberBasicResponseDto,
                  note: e.target.value
                }
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  )
}

export default BasicContent
