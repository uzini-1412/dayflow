# 일정 관리 PWA

일정·달력·소셜 공유를 지원하는 반응형 **PWA**(설치형 웹앱). React + TypeScript + Vite, 백엔드는 로컬 **PocketBase**.

> 학부 소프트웨어공학 팀플(일정관리 SRS)을 기반으로, 당시 미구현 상태였던 핵심 기능을
> 현재 실력으로 직접 설계·구현한 개인 리메이크 프로젝트입니다.

## 기술 스택
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Zustand
- **Backend**: PocketBase (로컬 단일 바이너리 · 무료 · 계정 불필요)
- **PWA**: vite-plugin-pwa (설치형 + 오프라인 + Web Push 예정)

## 주요 특징
- 📅 달력 / 리스트 / 주간(루틴) 뷰, 일정 CRUD(반복·카테고리·체크리스트·첨부·비용)
- 🔔 알람 — 인앱 실시간 토스트(SSE) + Web Push(앱 닫혀도)
- 👥 협업 — 친구 · 일정 공유 · 일정 단위 실시간 댓글 · 공유 스페이스(그룹 캘린더)
- 🧩 모듈 토글 — 학생/직장인/미니멀 모드로 기능 on/off (모듈형 아키텍처)
- 📝 메모 · 🔁 습관 트래커 · 📁 프로젝트 · 🎓 학습 플래너(GPA)
- 🌙 다크모드·폰트 설정 · 📱 모바일/태블릿/데스크탑 반응형 · 설치형 PWA

## 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. PocketBase 실행 (터미널 1)
> PocketBase는 무료 오픈소스 단일 실행파일입니다. 클라우드 계정/요금 없음. 데이터는 `pb/pb_data`(로컬)에만 저장됩니다.

```bash
npm run pb:migrate   # 스키마 마이그레이션 적용 (최초 1회)
npm run pb:admin     # 로컬 관리자 생성 (admin@local.test / admin12345) — 선택
npm run pb           # http://127.0.0.1:8090 에서 서버 실행
```

### 3. 프론트 실행 (터미널 2)
```bash
npm run dev          # http://localhost:5173
```

### 4. (선택) Web Push 발송 워커 (터미널 3)
> 앱이 닫혀 있어도 친구 요청·공유·댓글 등의 알림을 기기로 푸시. VAPID 키를 `.env` 에 설정 후 실행.
```bash
npx web-push generate-vapid-keys   # 키 생성 → .env 의 VITE_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 에 입력
npm run push                       # 알림 생성 시 구독 기기로 Web Push 발송
```
- 흐름: 클라이언트가 `pushManager` 로 구독 → `push_subscriptions` 저장 → 알림 생성 시 워커가 `web-push` 로 발송 → 서비스워커(`src/sw.ts`)가 알림 표시·클릭 시 딥링크.

## 문서
- [docs/SCHEMA.md](docs/SCHEMA.md) — DB 스키마 설계 (PocketBase 컬렉션)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 폴더 구조·코딩 컨벤션(파일명 규칙·500줄 규칙·공통 모달)

## 프로젝트 구조
```
src/
├─ app/         # 진입·라우터·providers·레이아웃
├─ features/    # 기능별 모듈 (auth, settings, schedules, calendar, social, notifications)
└─ shared/      # 공통 ui(Modal 등)·hooks·lib·types
pb/             # PocketBase 바이너리 + 마이그레이션 (pb_data 는 git 제외)
```
