# SNS Rejoice 가이드 페이지 - Phase 1 Tasks

## 프로젝트 개요
- **목표**: SNS Rejoice 순장 가이드 웹페이지 개발
- **기술 스택**: React + Vite + React Router
- **배포**: GitHub Pages
- **레이아웃**: 반응형 (Web/Mobile)
- **구조**: 멀티 페이지 (메인 + 각 섹션별 페이지)

## 페이지 구조
```
/ (메인)           - Hero + 네비게이션 카드
/about            - Rejoice 소개 + 순장의 역할
/guide            - 순모임 가이드 (진행 순서, 준비 체크리스트 등)
/weekly           - 매주 해야하는 일
/places           - 순모임 장소
/events           - 행사 정보
/contents         - 순모임 콘텐츠 (아이스브레이킹, 찬양 등)
```

---

## Task 1: 프로젝트 초기 설정 ✅

### 1.1 Vite + React 프로젝트 생성
- [x] `npm create vite@latest . -- --template react`
- [x] 불필요한 기본 파일 정리
- [x] 폴더 구조 설정

### 1.2 기본 설정
- [x] `vite.config.js` - base path 설정 (GitHub Pages용)
- [x] ESLint/Prettier 설정 (선택)
- [x] 폰트 설정 (Pretendard 또는 Noto Sans KR)

### 1.3 CSS 기본 구조
- [x] `index.css` - 전역 스타일, CSS 변수
- [x] `App.css` - 컴포넌트 스타일
- [x] 반응형 breakpoint 정의 (768px)

---

## Task 2: 공통 컴포넌트 및 라우팅 설정 ✅

### 2.1 React Router 설정
- [x] react-router-dom 설치
- [x] 라우터 구성 (HashRouter - GitHub Pages 호환)
- [x] 페이지별 라우트 설정

### 2.2 Header 컴포넌트
- [x] 로고/타이틀 영역
- [x] 네비게이션 메뉴 (Web: 가로 나열)
- [x] 햄버거 메뉴 (Mobile: 드롭다운)
- [x] Sticky header 구현
- [x] 페이지 간 이동 (React Router Link)

### 2.3 Footer 컴포넌트
- [x] 온누리교회 정보
- [x] SNS Rejoice 연락처/문의
- [x] Copyright

### 2.4 공통 UI 컴포넌트
- [x] Button 컴포넌트
- [x] Card 컴포넌트
- [x] Accordion 컴포넌트 (접기/펼치기)

---

## Task 3: 메인 페이지 (/) 개발 ✅

### 3.1 Hero 섹션
- [x] 메인 타이틀: "SNS Rejoice"
- [x] 부제목/슬로건 (2025 주제 말씀: Worship like a child, 사무엘하 6:14)
- [x] 배경 이미지 또는 그라데이션 (회색 그라데이션 + 십자가 패턴)
- [x] CTA 버튼 (글래스모피즘 스타일)

### 3.2 네비게이션 카드
- [ ] 각 페이지로 이동하는 카드 그리드
- [ ] 아이콘 + 제목 + 설명
- [ ] 호버/터치 효과

### 3.3 반응형
- [x] 세로 중앙 정렬
- [x] 폰트 크기 조정
- [x] 배경 모바일 최적화

---

## Task 4: About 페이지 (/about) ✅

### 4.1 콘텐츠 구성
- [x] Rejoice 소개 텍스트
- [x] 2025 비전 (Worship like a child)
- [x] 순장의 역할 (순모임 인도, QT & 기도, 에센스)

### 4.2 Web 레이아웃
- [x] 섹션별 카드 형태 (글래스모피즘 스타일)
- [x] 순장 역할 3열 그리드
- [x] Hero와 동일한 배경 스타일

### 4.3 Mobile 레이아웃
- [x] 단일 열 (세로 스택)
- [x] 카드 풀너비

---

## Task 5: Guide 페이지 (/guide) ✅

### 5.1 콘텐츠 구성
- [x] 순모임 진행 순서
- [x] 첫 만남 가이드 (순모임 서약)
- [ ] 순모임 준비 체크리스트
- [x] 팁 & 노하우 (GQS 팁)

### 5.2 Web 레이아웃
- [x] 플로팅 카드 형태
- [x] 타임라인 UI

### 5.3 Mobile 레이아웃
- [x] 반응형 레이아웃
- [x] 터치 친화적 UI

---

## Task 6: Weekly 페이지 (/weekly) ✅

### 6.1 콘텐츠 구성
- [x] 순모임 출첵 링크 작성 섹션
- [x] iCare 정보 등록 섹션 (출석체크, 기도제목, 순모임 현황, 특이사항)
- [x] 외부 링크 버튼 (Google Forms, iCare)

### 6.2 Web 레이아웃
- [x] 섹션별 카드 형태
- [x] iCare 항목 2열 그리드

### 6.3 Mobile 레이아웃
- [x] 카드 리스트 형태 (단일 열)
- [x] 반응형 레이아웃

---

## Task 7: Places 페이지 (/places) ✅

### 7.1 콘텐츠 구성
- [x] 장소 데이터 정리 (JSON 또는 상수)
  - 장소명 (사랑홀, 아론홀, 훌홀, 신관 202호)
  - 이번 달 다락방 배정
  - 쓰레기 처리 방법
- [x] 로테이션 안내
- [x] 쓰레기 정리 안내 섹션

### 7.2 Web 레이아웃
- [x] 카드 그리드 (2열)
- [x] 호버 효과

### 7.3 Mobile 레이아웃
- [x] 카드 리스트 (단일 열)
- [x] 반응형 레이아웃

---

## Task 8: Events 페이지 (/events) ✅

### 8.1 콘텐츠 구성
- [x] 행사 데이터 정리
  - 공동체 행사: Christmas Blessing (12월)
  - 리조이스 행사 5가지 카테고리
    - 예배: 리조이스 워십 위크
    - 말씀: 작심한달
    - 기도: Re-Live
    - 감사: 에브리땡스
    - 교제: 리조인어스 (매달 변경)
- [x] 이미지 적용

### 8.2 Web 레이아웃
- [x] 카드 그리드 (2~3열)
- [x] 섹션 구분 Divider

### 8.3 Mobile 레이아웃
- [x] 카드 리스트 (단일 열)
- [x] 반응형 레이아웃

---

## Task 9: Contents 페이지 (/contents)

### 9.1 콘텐츠 구성
- [ ] 카테고리별 정리
  - 아이스브레이킹 게임
  - 찬양 목록/링크
  - 말씀 자료
  - 기도 가이드
  - 나눔 질문

### 9.2 Web 레이아웃
- [ ] 탭으로 카테고리 분류
- [ ] 링크 카드 그리드

### 9.3 Mobile 레이아웃
- [ ] 아코디언 카테고리
- [ ] 링크 리스트

---

## Task 10: 통합 및 최적화

### 10.1 라우팅 통합
- [ ] 모든 페이지 라우트 설정
- [ ] 네비게이션 링크 연결
- [ ] 404 페이지 (선택)

### 10.2 반응형 테스트
- [ ] Desktop (1200px+) 테스트
- [ ] Tablet (768px~1199px) 테스트
- [ ] Mobile (767px-) 테스트

### 10.3 성능 최적화
- [ ] 이미지 최적화
- [ ] 컴포넌트 lazy loading (선택)

---

## Task 11: 배포

### 11.1 GitHub Pages 배포
- [ ] `gh-pages` 패키지 설치
- [ ] `package.json` 배포 스크립트 추가
- [ ] 빌드 및 배포 테스트
- [ ] 최종 URL 확인

### 11.2 메타 태그 설정
- [ ] Open Graph 태그 (카카오톡 공유용)
- [ ] Twitter Card 태그
- [ ] favicon 설정

---

## 우선순위 요약

| 순서 | Task | 중요도 |
|------|------|--------|
| 1 | Task 1: 프로젝트 초기 설정 | 필수 |
| 2 | Task 2: 공통 컴포넌트 | 필수 |
| 3 | Task 3: Hero 섹션 | 필수 |
| 4 | Task 4: About Rejoice | 필수 |
| 5 | Task 5: 순모임 가이드 | 필수 |
| 6 | Task 6: 매주 해야하는 일 | 필수 |
| 7 | Task 7: 순모임 장소 | 필수 |
| 8 | Task 8: 행사 정보 | 필수 |
| 9 | Task 9: 순모임 콘텐츠 | 필수 |
| 10 | Task 10: 통합 및 최적화 | 필수 |
| 11 | Task 11: 배포 | 필수 |

---

## 예상 산출물

```
src/
├── assets/
│   └── images/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Accordion.jsx
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── Footer.jsx
│   └── Layout.jsx
├── pages/
│   ├── HomePage.jsx        # / (메인)
│   ├── AboutPage.jsx       # /about
│   ├── GuidePage.jsx       # /guide
│   ├── WeeklyPage.jsx      # /weekly
│   ├── PlacesPage.jsx      # /places
│   ├── EventsPage.jsx      # /events
│   └── ContentsPage.jsx    # /contents
├── data/
│   ├── places.js
│   ├── events.js
│   └── contents.js
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```
