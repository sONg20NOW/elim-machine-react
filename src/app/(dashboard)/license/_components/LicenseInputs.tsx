import { TextField, Typography } from '@mui/material'

import type { UseFormReturn } from 'react-hook-form'

import classNames from 'classnames'

import type { LicenseCreateRequestDto } from '@core/types'
import styles from '@core/styles/customTable.module.css'
import TextFieldTd from '@/@core/components/elim-inputbox/TextFieldTd'
import PostCodeButton from '@/@core/components/elim-button/PostCodeButton'

export default function LicenseInputs({ form }: { form: UseFormReturn<LicenseCreateRequestDto, any, undefined> }) {
  function onChangePostcodeAddress(value: string) {
    form.setValue('roadAddress', value, { shouldDirty: true })
  }

  return (
    <div className={classNames('grid gap-5 pt-2 overflow-visible sm:pli-16', styles.container)}>
      <table style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col width={'15%'} />
          <col width={'35%'} />
          <col width={'15%'} />
          <col width={'35%'} />
        </colgroup>
        <tbody>
          <tr>
            <th className={styles.required}>업체명</th>
            <TextFieldTd form={form} name='companyName' placeholder='업체명은 필수입력입니다' />
            <th>영문약어</th>
            <TextFieldTd form={form} name='companyNameAbbr' />
          </tr>

          <tr>
            <th>사업자번호</th>
            <TextFieldTd form={form} name='bizno' />
            <th>대표자명</th>
            <TextFieldTd form={form} name='ceoName' />
          </tr>
        </tbody>
      </table>
      <div>
        <Typography>담당자 정보</Typography>
        <table style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col width={'15%'} />
            <col width={'35%'} />
            <col width={'15%'} />
            <col width={'35%'} />
          </colgroup>
          <tbody>
            <tr>
              <th>이름</th>
              <TextFieldTd form={form} name='managerName' />
              <th>이메일</th>
              <TextFieldTd form={form} name='managerEmail' />
            </tr>

            <tr>
              <th>휴대폰번호</th>
              <TextFieldTd form={form} name='managerPhoneNumber' />
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <Typography>기업 정보</Typography>
        <table style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col width={'15%'} />
            <col width={'35%'} />
            <col width={'15%'} />
            <col width={'35%'} />
          </colgroup>
          <tbody>
            <tr>
              <th>계산서메일</th>
              <TextFieldTd form={form} name='taxEmail' />
              <th>홈페이지</th>
              <TextFieldTd form={form} name='homepageAddr' />
            </tr>

            <tr>
              <th>팩스번호</th>
              <TextFieldTd form={form} name='fax' />
              <th>전화번호</th>
              <TextFieldTd form={form} name='tel' />
            </tr>

            <tr>
              <th>업종</th>
              <TextFieldTd form={form} name='businessCategory' />
              <th>업태</th>
              <TextFieldTd form={form} name='businessType' />
            </tr>

            <tr>
              <th>주소</th>
              <TextFieldTd
                colSpan={3}
                form={form}
                name='roadAddress'
                slotProps={{ input: { endAdornment: <PostCodeButton onChange={onChangePostcodeAddress} /> } }}
              />
            </tr>
            <tr>
              <th>상세주소</th>
              <TextFieldTd colSpan={3} form={form} name='detailAddress' />
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <Typography>계약 정보</Typography>
        <table style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col width={'15%'} />
            <col width={'35%'} />
            <col width={'15%'} />
            <col width={'35%'} />
          </colgroup>
          <tbody>
            <tr>
              <th>계약일</th>
              <TextFieldTd form={form} name='contractDate' type='date' />
              <th>만료일</th>
              <TextFieldTd form={form} name='expireDate' type='date' />
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <Typography>비고</Typography>
        <TextField fullWidth multiline rows={3} {...form.register('remark')} />
      </div>
    </div>
  )
}
