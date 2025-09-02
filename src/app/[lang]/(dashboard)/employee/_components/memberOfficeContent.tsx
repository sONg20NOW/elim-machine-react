import { DialogContent, Divider, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2'

import CustomTextField from '@/@core/components/mui/TextField'
import DefaultSelectBox from '@/components/selectbox/defaultSelectBox'

const MemberOfficeContent = ({ userData, setUserData }: any) => {
  return (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='사번'
            value={userData?.memberOfficeResponseDto?.staffNum || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  staffNum: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'officeDepartmentName'}
            label='부서'
            value={userData?.memberOfficeResponseDto?.officeDepartmentName || ''}
            loading={false}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  officeDepartmentName: e.target.value
                }
              })
            }
            options={[
              { value: '건설사업', label: '건설사업' },
              { value: '건설안전', label: '건설안전' },
              { value: '기술개발', label: '기술개발' },
              { value: '경영지원', label: '경영지원' },
              { value: '영업', label: '영업' },
              { value: '총무', label: '총무' },
              { value: '인사', label: '인사' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'officePosition'}
            label='직위'
            value={userData?.memberOfficeResponseDto?.officePosition || ''}
            loading={false}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  officePosition: e.target.value
                }
              })
            }
            options={[
              { value: 'TEMPORARY', label: '단기' },
              { value: 'INTERN', label: '인턴' },
              { value: 'STAFF', label: '사원' },
              { value: 'JUNIOR_STAFF', label: '주임' },
              { value: 'ASSISTANT_MANAGER', label: '대리' },
              { value: 'SENIOR_ASSISTANT_MANAGER', label: '선임' },
              { value: 'RESPONSIBLE', label: '책임' },
              { value: 'TEAM_LEADER', label: '팀장' },
              { value: 'SECTION_CHIEF', label: '소장' },
              { value: 'DEPUTY_GENERAL_MANAGER', label: '본부장' },
              { value: 'MANAGER', label: '과장' },
              { value: 'SENIOR_MANAGER', label: '부장' },
              { value: 'DEPUTY_MANAGER', label: '차장' },
              { value: 'DIRECTOR', label: '이사' },
              { value: 'EXECUTIVE_DIRECTOR', label: '상무' },
              { value: 'SENIOR_EXECUTIVE_DIRECTOR', label: '전무' },
              { value: 'ADVISOR', label: '고문' },
              { value: 'VICE_PRESIDENT', label: '부사장' },
              { value: 'PRESIDENT', label: '사장' }
            ]}
          />
        </Grid>
      </Grid>

      <Divider className='my-[20px]' />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='수습'
            value={userData?.memberOfficeResponseDto?.apprentice || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  apprentice: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'contractType'}
            label='계약 유형'
            value={userData?.memberOfficeResponseDto?.contractType || ''}
            loading={false}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  contractType: e.target.value
                }
              })
            }
            options={[
              { value: 'REGULAR', label: '정규직' },
              { value: 'CONTRACT_1Y', label: '계약직1년' },
              { value: 'CONTRACT_2Y', label: '계약직2년' },
              { value: 'NON_REGULAR', label: '무기계약직' },
              { value: 'DAILY', label: '일용직' },
              { value: 'TEMPORARY', label: '단기시급' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='계약 여부'
            value={userData?.memberOfficeResponseDto?.contractYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  contractYn: e.target.value
                }
              })
            }
          >
            <MenuItem value='Y'>예</MenuItem>
            <MenuItem value='N'>아니오</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'laborForm'}
            label='상근/비상근'
            value={userData?.memberOfficeResponseDto?.laborForm || ''}
            loading={false}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  laborForm: e.target.value
                }
              })
            }
            options={[
              { value: 'RESIDENT', label: '상근' },
              { value: 'NON_RESIDENT', label: '비상근' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DefaultSelectBox
            id={'workForm'}
            label='근무형태'
            value={userData?.memberOfficeResponseDto?.workForm || ''}
            loading={false}
            onChange={(e: any) =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  workForm: e.target.value
                }
              })
            }
            options={[
              { value: 'DEEMED', label: '간주근로' },
              { value: 'SPECIAL', label: '별정근로' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='현장근무 여부'
            value={userData?.memberOfficeResponseDto?.fieldworkYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  fieldworkYn: e.target.value
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
            select
            fullWidth
            label='사원증 여부'
            value={userData?.memberOfficeResponseDto?.staffCardYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  staffCardYn: e.target.value
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
            label='수습 조건'
            value={userData?.memberOfficeResponseDto?.apprentice || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  apprentice: e.target.value
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
            label='입사일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberOfficeResponseDto?.joinDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  joinDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='퇴사일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberOfficeResponseDto?.resignDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  resignDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='보험 취득일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberOfficeResponseDto?.insuranceAcquisitionDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  insuranceAcquisitionDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label='보험 상실일'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={userData?.memberOfficeResponseDto?.insuranceLostDate || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  insuranceLostDate: e.target.value
                }
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            label='단체보험 가입여부'
            value={userData?.memberOfficeResponseDto?.groupInsuranceYn || ''}
            onChange={e =>
              setUserData({
                ...userData,
                memberOfficeResponseDto: {
                  ...userData?.memberOfficeResponseDto,
                  groupInsuranceYn: e.target.value
                }
              })
            }
          >
            <MenuItem value='Y'>예</MenuItem>
            <MenuItem value='N'>아니오</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </DialogContent>
  )
}

export default MemberOfficeContent
