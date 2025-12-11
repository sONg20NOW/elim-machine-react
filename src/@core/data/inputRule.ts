export const emailRule = {
  pattern: {
    value: /^([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+)\.([a-zA-Z]{2,})$/,
    message: '이메일 형식에 맞춰서 입력하세요'
  }
}

export const phoneRule = {
  pattern: {
    value: /^01[0-9]-\d{3,4}-\d{4}$/,
    message: '010-0000-0000 형식에 맞춰주세요'
  }
}
