# 시작하는 방법

1. npm install

2. npm run dev

# 메뉴 추가하는 위치

C:\Users\MS\Desktop\full-version\src\components\layout\vertical\VerticalMenu.tsx

# 작동방식
## 직원관리
필터를 변경할 때마다 새로 데이터를 받아온다.

필터 내에 페이지 번호, 페이지 사이즈가 포함되어 페이지네이션 동작 시에도 새로 데이터를 받아온다.

### 중요 데이터 설명 (app/_schema에 위치)
1. type.tsx: 각종 유저 타입들을 설명
2. EmployeeTabInfo.tsx: employee(직원관리) 탭의 정보들 총괄 관리 (filter, modal tab 관련)
3. src\app\_constant\constants.tsx: 테이블 생성에 필요한 헤더를 (테이블이 필요한) 페이지별로 목차를 나누어 보관.


### 컴포넌트 설명
#### 직원관리
1. TableFilters.tsx: 필터바
2. src\app\_components\table\CustomizedTable.tsx: 생성된 table 인스턴스와 data를 이용해서 테이블 생성 -> header 정보를 가지고 table 인스턴스 생성을 하는 하부 컴포넌트 작업 필요.
3. memberTabContent.tsx: UserModal에서 사용되는 탭 컨텐츠들을 컴포넌트화. (UserModal.tsx에서 사용)
