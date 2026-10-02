# 일정 관리 PWA

일정·달력·소셜 공유를 지원하는 반응형 **PWA**(설치형 웹앱). React + TypeScript + Vite, 백엔드는 로컬 **PocketBase**.

> 학부 소프트웨어공학 팀플(일정관리 SRS)을 기반으로, 당시 미구현 상태였던 핵심 기능을
> 현재 실력으로 직접 설계·구현한 개인 리메이크 프로젝트입니다.

## 기술 스택
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Zustand
- **Backend**: PocketBase (로컬 단일 바이너리 · 무료 · 계정 불필요)
- **PWA**: vite-plugin-pwa (설치형 + 오프라인 동기화)

## 주요 특징
- 📅 달력 / 리스트 / 주간(루틴) 뷰, 일정 CRUD(반복·카테고리·체크리스트·첨부·비용)
- 🔔 알람 — 인앱 실시간 토스트(SSE) · 일정 리마인더
- 👥 협업 — 친구 · 일정 공유 · 일정 단위 실시간 댓글 · 공유 스페이스(그룹 캘린더)
- 🧩 모듈 토글 — 학생/직장인/미니멀 모드로 기능 on/off (모듈형 아키텍처)
- 📝 메모 · 🔁 습관 트래커 · 📁 프로젝트 · 🎓 학습 플래너(GPA)
- 🌙 다크모드·폰트 설정 · 📱 모바일/태블릿/데스크탑 반응형 · 설치형 PWA
- 📴 오프라인 동기화 — 연결이 끊겨도 조회/생성/수정/삭제 가능, 복귀 시 자동 전송(outbox)

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

## 배포
| 구분 | 위치 | 방식 |
|---|---|---|
| 프론트 | GitHub Pages (`https://<user>.github.io/dayflow/`) | `main` push 시 `.github/workflows/deploy-pages.yml` 이 자동 빌드·배포 |
| 백엔드 | GCP e2-micro VM (us-west1, 무료 등급) — PocketBase v0.39.4 + Caddy(HTTPS 자동) | `https://dayflow.34-168-96-154.sslip.io`, 마이그레이션은 기동 시 자동 적용 |

### 최초 1회 설정
1. **백엔드 VM** (Ubuntu, 80/443 허용): `deploy/` 와 `pb/pb_migrations/` 를 VM 에 복사 → `sudo bash server-setup.sh` (최초 1회) → `sudo bash add-pb-app.sh dayflow 8090 dayflow.<IP를-대시로>.sslip.io ./pb_migrations` → 출력된 명령으로 관리자(superuser) 생성. 한 VM 에 앱 이름·포트만 바꿔 여러 프로젝트 백엔드를 추가할 수 있음.
2. **GitHub 저장소 Settings**
   - Pages → Build and deployment → Source: **GitHub Actions**
   - Secrets and variables → Actions → **Variables** → `VITE_PB_URL` = 백엔드 주소 (예: `https://1-2-3-4.sslip.io`)
3. `main` 에 push(또는 Actions 탭에서 수동 실행) → 배포 완료.

- 하위 경로 대응: 빌드 시 `VITE_BASE=/dayflow/` 로 Vite `base`·라우터 `basename`·manifest `scope` 를 맞춤. 로컬 개발은 기본값 `/`.
- 새로고침 404 대응: 빌드 결과 `index.html` 을 `404.html` 로 복사.

## 비활성화된 기능

### Web Push (앱을 닫아도 오는 기기 알림) — 현재 비활성화
- **이유**: 처음 배포 대상(PocketHost)에서는 푸시 발송용 상시 Node 워커(`scripts/push-worker.mjs`)를 띄울 수 없어 비활성화. 현재 VM 에서는 워커 실행이 가능하므로 필요 시 재활성화 가능.
- **영향**: 앱을 연 상태의 인앱 실시간 알림(친구 요청·공유·댓글 토스트, 일정 리마인더 토스트)은 그대로 동작. 앱을 닫았을 때의 OS 푸시만 동작하지 않음.
- **처리**: 설정 화면의 "푸시 알림" 토글만 주석 처리(`src/features/settings/pages/SettingsPage.tsx`). 구독 로직(`features/notifications/push`), 서비스워커 `push` 핸들러(`src/sw.ts`), `push_subscriptions` 컬렉션, 워커 코드는 삭제하지 않고 유지.
- **재활성화 방법**
  1. 워커를 상시 실행할 수 있는 서버(Fly.io, VPS 등)에 PocketBase와 워커를 함께 배포
  2. `npx web-push generate-vapid-keys` 로 키 생성 → `.env` 의 `VITE_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` 에 입력
  3. `SettingsPage.tsx` 의 `PushToggle` import와 "푸시 알림" 설정 행 주석 해제
  4. `npm run push` 로 워커 실행
  - 흐름: `pushManager` 구독 → `push_subscriptions` 저장 → 워커가 `web-push` 로 발송 → `src/sw.ts` 가 알림 표시·클릭 시 딥링크

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
