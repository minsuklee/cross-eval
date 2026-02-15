# 상호평가 시스템 - 설정 및 배포 가이드

## 1단계: Google Spreadsheet 생성

1. `@kookmin.ac.kr` 계정으로 [Google Sheets](https://sheets.google.com) 접속
2. **새 스프레드시트** 생성
3. URL에서 스프레드시트 ID 복사
   - 예: `https://docs.google.com/spreadsheets/d/여기가_ID/edit`

## 2단계: Google Apps Script 설정

1. 스프레드시트 메뉴 → **확장 프로그램** → **Apps Script**
2. 기본 `Code.gs` 파일의 내용을 `apps-script/Code.gs` 내용으로 교체
3. **파일 추가** (+) → 스크립트 → `TestRunner` → `apps-script/TestRunner.gs` 내용 붙여넣기
4. `Code.gs` 첫 부분의 `SPREADSHEET_ID` 를 실제 ID로 교체:
   ```javascript
   const SPREADSHEET_ID = '실제_스프레드시트_ID';
   ```

## 3단계: 시스템 초기화

1. Apps Script 에디터에서 함수 선택 드롭다운 → `initializeSystem` 선택 → ▶ 실행
2. 권한 승인 팝업 → 허용
3. 스프레드시트에 `_config`, `학생_마스터`, `과제_목록` 시트가 생성되었는지 확인

## 4단계: Web App 배포

1. Apps Script 에디터 → 오른쪽 상단 **배포** → **새 배포**
2. 유형 선택: **웹 앱**
3. 설정:
   - **설명**: 상호평가 시스템 API v1
   - **다음 사용자로 실행**: **나 (본인)**
   - **액세스 권한이 있는 사용자**: **모든 사용자**
4. **배포** 클릭
5. 생성된 **웹 앱 URL** 복사 (형식: `https://script.google.com/macros/s/.../exec`)

## 5단계: 프론트엔드 설정

1. `frontend/js/api.js` 파일에서 URL 교체:
   ```javascript
   const BASE_URL = '복사한_웹앱_URL';
   ```
2. GitHub에 private 레포지토리 생성 (Pro 계정 필요)
3. `frontend/` 폴더의 내용을 레포지토리에 push
4. Settings → Pages → Source: `main` branch → Save
5. 배포된 URL 확인 (예: `https://username.github.io/repo-name/`)

## 6단계: 테스트 실행

### 자동 테스트
1. Apps Script 에디터 → `runAllTests` 선택 → ▶ 실행
2. 스프레드시트 `_test_log` 시트에서 결과 확인
3. 모든 테스트가 PASS인지 확인

### 수동 테스트
1. GitHub Pages URL 접속
2. 학번 `20210001`, 비밀번호 `test1234!`로 학생 로그인 테스트
3. 관리자 비밀번호 `prof2026!`로 교수 로그인 테스트

## 7단계: 운영 준비

1. 테스트 모드 해제: `_config` 시트에서 `test_mode` → `false`
2. 관리자 비밀번호 변경: Apps Script 에디터에서 실행
   ```javascript
   function changeAdminPassword() {
     setConfig('admin_password', hashPassword('새로운비밀번호'));
   }
   ```
3. 테스트 데이터 삭제: `resetAllData()` 실행
4. 실제 수강생 명단 등록 (교수 대시보드 → 학생 관리)

---

## 파일 구조

```
cross-eval/
├── apps-script/
│   ├── Code.gs          ← Google Apps Script 메인 코드
│   └── TestRunner.gs    ← 테스트 러너 + 테스트 데이터
├── frontend/
│   ├── index.html       ← 로그인 페이지
│   ├── css/
│   │   └── style.css    ← 공통 스타일
│   ├── js/
│   │   ├── api.js       ← API 통신 모듈
│   │   └── auth.js      ← 인증/세션 관리
│   ├── student/
│   │   ├── dashboard.html  ← 학생 대시보드
│   │   ├── evaluate.html   ← 평가 수행
│   │   └── results.html    ← 내 결과 확인
│   └── admin/
│       └── dashboard.html  ← 교수 대시보드 (과제관리/학생관리/평가 통합)
├── SETUP.md             ← 이 문서
└── cross-evaluation-prd.md ← PRD 문서
```

## Apps Script 재배포 시 주의사항

코드 수정 후 반드시 **새 배포**를 해야 변경사항이 반영됩니다:
1. **배포** → **배포 관리** → **새 버전** 편집 → **배포**
2. URL은 동일하게 유지됩니다 (기존 배포 수정 시)

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| CORS 에러 | Content-Type 설정 | api.js에서 `text/plain` 확인 |
| 401/403 오류 | Apps Script 권한 | "모든 사용자" 접근 확인, 재배포 |
| 응답 없음 | 배포 URL 오류 | URL이 `/exec`로 끝나는지 확인 |
| 로그인 안됨 | 비밀번호 미설정 | `_config` 시트에 admin_password 확인 |
| 시트 없음 | 초기화 미실행 | `initializeSystem()` 재실행 |
