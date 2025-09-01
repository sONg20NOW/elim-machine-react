import { DialogContent, Divider, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'

const PrivacyContent = ({ userData, setUserData }: any) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='외국인 여부'
            value={userData?.memberPrivacyResponseDto?.foreignYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  foreignYn: e.target.value
                }
              })
            }
          >
            <MenuItem value=''>전체</MenuItem>
            <MenuItem value='Y'>예</MenuItem>
            <MenuItem value='N'>아니오</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='주민번호'
            value={userData?.memberPrivacyResponseDto?.juminNum || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  juminNum: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='생년월일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberPrivacyResponseDto?.birthday || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  birthday: e.target.value
                }
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='전화번호'
            value={userData?.memberPrivacyResponseDto?.phoneNumber || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  phoneNumber: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='비상연락처1'
            value={userData?.memberPrivacyResponseDto?.emerNum1 || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  emerNum1: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='비상연락처2'
            value={userData?.memberPrivacyResponseDto?.emerNum2 || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  emerNum2: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='가족 수'
            type='number'
            value={userData?.memberPrivacyResponseDto?.familyCnt || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  familyCnt: Number(e.target.value)
                }
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='종교'
            value={userData?.memberPrivacyResponseDto?.religion || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  religion: e.target.value
                }
              })
            }
          />
        </Grid>

        <Grid size={12}>
          <CustomTextField
            fullWidth
            label='도로명 주소'
            value={userData?.memberPrivacyResponseDto?.address?.roadAddress || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  address: {
                    ...userData?.memberPrivacyResponseDto?.address,
                    roadAddress: e.target.value
                  }
                }
              })
            }
          />
        </Grid>
        <Grid size={12}>
          <CustomTextField
            fullWidth
            label='상세 주소'
            value={userData?.memberPrivacyResponseDto?.address?.detailAddress || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  address: {
                    ...userData?.memberPrivacyResponseDto?.address,
                    detailAddress: e.target.value
                  }
                }
              })
            }
          />
        </Grid>
        <Grid size={12}>
          <CustomTextField
            fullWidth
            label='지번 주소'
            value={userData?.memberPrivacyResponseDto?.address?.jibunAddress || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  address: {
                    ...userData?.memberPrivacyResponseDto?.address,
                    jibunAddress: e.target.value
                  }
                }
              })
            }
          />
        </Grid>
      </Grid>

      <Divider className='my-[20px]' />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='최종학력'
            value={userData?.memberPrivacyResponseDto?.educationLevel || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  educationLevel: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='전공'
            value={userData?.memberPrivacyResponseDto?.educationMajor || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  educationMajor: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='차량 보유 여부'
            value={userData?.memberPrivacyResponseDto?.carYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  carYn: e.target.value
                }
              })
            }
          >
            <MenuItem value='Y'>예</MenuItem>
            <MenuItem value='N'>아니오</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='차량번호'
            value={userData?.memberPrivacyResponseDto?.carNumber || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  carNumber: e.target.value
                }
              })
            }
          />
        </Grid>
      </Grid>

      <Divider className='my-[20px]' />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='은행명'
            value={userData?.memberPrivacyResponseDto?.bankName || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  bankName: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='계좌번호'
            value={userData?.memberPrivacyResponseDto?.bankNumber || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberPrivacyResponseDto: {
                  ...userData?.memberPrivacyResponseDto,
                  bankNumber: e.target.value
                }
              })
            }
          />
        </Grid>
      </Grid>
    </DialogContent>
  )
}

export default PrivacyContent
