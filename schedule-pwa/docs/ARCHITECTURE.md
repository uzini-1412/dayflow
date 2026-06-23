# 아키텍처 & 코딩 컨벤션

> 이 문서가 **모든 파일의 기준**. 새 파일은 반드시 이 규칙을 따른다.

## 1. 폴더 구조 (기능별 = feature-based)

```
src/
├─ app/                  # 앱 진입/전역 설정
│  ├─ App.tsx            # 라우터 마운트만 (로직 X)
│  ├─ router.tsx         # 라우트 정의
│  └─ providers.tsx      # 전역 Provider 합성(Auth/Settings/Modal/Query)
├─ features/             # ★ 기능별 모듈 (핵심)
│  ├─ auth/
│  ├─ settings/
│  ├─ schedules/
│  ├─ calendar/
│  ├─ social/
│  └─ notifications/
├─ shared/               # 여러 기능이 공유
│  ├─ ui/                # 공통 프리미티브 (Modal, Button, Input …)
│  ├─ hooks/             # 범용 훅 (useDisclosure, useMediaQuery …)
│  ├─ lib/               # pb 클라이언트, 유틸, 상수
│  └─ types/             # 전역 타입
└─ main.tsx
```

### 각 feature 폴더 내부 (통일 구조)
```
features/<name>/
├─ components/           # 이 기능 전용 UI 컴포넌트
├─ hooks/                # 이 기능 전용 훅 (데이터/상태 로직)
├─ <name>.api.ts         # PocketBase 호출 모음
├─ <name>.types.ts       # 이 기능 타입
├─ <name>.store.ts       # (필요시) zustand 스토어
└─ index.ts              # 외부 공개 export (배럴)
```

## 2. 파일명 규칙 (통일)

| 종류 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 | `PascalCase.tsx` | `ScheduleCard.tsx` |
| 페이지 | `PascalCasePage.tsx` | `CalendarPage.tsx` |
| 훅 | `useCamelCase.ts` | `useSchedules.ts` |
| API 모듈 | `<feature>.api.ts` | `schedules.api.ts` |
| 타입 | `<feature>.types.ts` | `schedules.types.ts` |
| 스토어 | `<feature>.store.ts` | `settings.store.ts` |
| 유틸 | `camelCase.ts` | `dateRange.ts` |
| 상수 | `UPPER_SNAKE` (값) / `camelCase.ts`(파일) | `constants.ts` |

- 폴더명: 소문자 케밥/단수 기능명 (`schedules`, `calendar`).
- 한 파일 = 한 주요 export (배럴 `index.ts` 제외).

## 3. 500줄 규칙 (강제)

**어떤 파일도 500줄을 넘지 않는다.** 페이지/컴포넌트가 커지면:

1. **로직은 훅으로** — 페이지는 "조립"만. 데이터 패칭/상태/이벤트 핸들러는 `useXxx.ts`로 추출.
2. **UI는 하위 컴포넌트로** — 섹션 단위로 쪼갠다 (`CalendarHeader`, `CalendarGrid`, `DayCell`).
3. 페이지 컴포넌트의 역할 = 레이아웃 + 훅 호출 + 하위 컴포넌트 배치.

> 기준선: 컴포넌트 ~200줄, 훅 ~150줄 권장. 넘으면 분리 신호.

```tsx
// ❌ 한 파일에 패칭+상태+렌더 다 넣기
// ✅ 페이지는 조립만
function CalendarPage() {
  const { days, selected, select } = useCalendar();   // 로직 = 훅
  return <CalendarLayout><CalendarGrid days={days} onSelect={select} /></CalendarLayout>;
}
```

## 4. 공통 모달 (★ 전부 공통 따르기)

모든 모달은 **단일 베이스 `shared/ui/Modal.tsx`** 위에서만 만든다. 개별 모달이 오버레이/애니메이션/ESC/스크롤락을 각자 구현하지 않는다.

- `shared/ui/Modal.tsx` — 오버레이, 포커스 트랩, ESC 닫기, 스크롤 락, 반응형(모바일=바텀시트/태블릿·PC=센터) 한 곳에서 처리.
- `shared/ui/ConfirmDialog.tsx` — 확인/취소 표준 다이얼로그(삭제 등 재사용).
- `shared/hooks/useDisclosure.ts` — `{ isOpen, open, close, toggle }` 표준 훅.
- 전역 모달이 필요하면 `ModalProvider` + `useModal()`로 명령형 호출.

→ **모달 동작을 한 번 수정하면 전체 모달에 일괄 반영**되도록 베이스를 단일화한다.

```tsx
// 개별 모달은 베이스를 "감싸기"만
export function CreateScheduleModal({ isOpen, onClose }: ModalBaseProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="일정 추가">
      {/* 폼 내용만 */}
    </Modal>
  );
}
```

## 5. 반응형 / PWA

- **모바일 우선** + 태블릿/데스크탑 분기. Tailwind 브레이크포인트: `sm`(모바일) `md`(태블릿) `lg`(데스크탑).
- 모달: 모바일=바텀시트, `md`↑=센터 다이얼로그.
- 네비: 모바일=하단 탭바, `md`↑=사이드바.
- PWA: `vite-plugin-pwa` (manifest + service worker), 설치 가능 + 오프라인 캐시 + Web Push.

## 6. 데이터 레이어

- PocketBase 클라이언트 단일 인스턴스: `shared/lib/pb.ts`.
- 호출은 feature의 `*.api.ts`에만. 컴포넌트가 pb를 직접 부르지 않는다.
- 서버 상태/캐시·실시간 구독은 훅(`useSchedules` 등)에서.
- 환경변수: `VITE_PB_URL` (`.env`, 절대 하드코딩 금지).

## 6-1. 오프라인 동기화 (offline-first)

연결이 끊겨도 앱이 동작하고, 복귀하면 변경이 자동 전송된다. 전부 `shared/lib/offline/` 에 모여 있고
feature 의 `*.api.ts` 가 PocketBase 호출을 이 헬퍼로 감싸기만 하면 적용된다.

```
shared/lib/offline/
├─ idb.ts           # 의존성 없는 IndexedDB 래퍼 (records 미러 + outbox 큐)
├─ cache.ts         # 컬렉션 레코드 미러 (키 = `${collection}/${id}`)
├─ outbox.ts        # 송신 대기열(create/update/delete) + 임시ID 재매핑
├─ syncEngine.ts    # 온라인 복귀 시 대기열을 seq 순서로 재생(flush)
├─ events.ts        # 로컬 변경 버스(오프라인 쓰기는 realtime 이 없으므로 직접 신호)
├─ netStatus.ts     # 연결/동기화 상태 zustand 스토어 + isOnline()
├─ offlineMutate.ts # offlineList/Create/Update/Delete (api 가 쓰는 래퍼)
└─ useOfflineSync.ts# 앱 셸 부트스트랩(online/offline 구독 + 자동 flush)
```

**읽기**: 온라인이면 서버 조회 → 캐시에 적재, 오프라인이면 캐시에서 필터/정렬해 반환.
**쓰기**: 온라인이면 즉시 PB 호출, 오프라인이면 임시 ID 로 낙관적 레코드를 캐시에 넣고 outbox 에 적재 →
연결 복귀 시 `flushOutbox()` 가 순서대로 재생(create 성공 시 임시ID→실ID 재매핑, 4xx 는 폐기, 5xx/네트워크는 재시도).
오프라인 쓰기 직후 `emitChange()` 로 읽기 훅(`useSchedules` 등)을 다시 그린다. 상단바 `SyncIndicator` 가 상태(오프라인·대기 N·동기화 중)를 표시.

> 적용 예: `schedules.api.ts`. 다른 feature 도 `offlineList/Create/Update/Delete` 로 감싸면 동일하게 오프라인 대응됨.
> SPA 셸은 `sw.ts` 의 NavigationRoute 폴백으로 오프라인에서도 모든 경로가 열린다.

## 7. 타입

- 전부 TypeScript. `any` 지양.
- DB 레코드 타입은 feature `*.types.ts`에 정의, `SCHEMA.md`와 일치 유지.

## 8. 금지/원칙 요약
- ❌ 시크릿/IP/비번 하드코딩 (전부 env)
- ❌ 모달 개별 구현 (베이스 필수)
- ❌ 500줄 초과 파일
- ❌ 컴포넌트에서 pb 직접 호출
- ✅ 기능별 폴더 + 통일 파일명
- ✅ 페이지=조립, 로직=훅
