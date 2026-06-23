# DB 스키마 설계 (PocketBase)

> 백엔드는 PocketBase. 컬렉션 = 테이블. 모든 사용자 데이터는 `user` 관계(relation)로 소유자를 가지며,
> PocketBase API Rule로 `@request.auth.id = user` 형태의 행 단위 접근제어를 건다.
>
> 범례: `*` 필수, `(rel)` 관계, `(enum)` 단일선택, `[json]` JSON 필드, `@auto` 시스템 자동.

---

## 1. 인증 / 사용자

### `users` (PocketBase auth 컬렉션 확장)
| 필드 | 타입 | 비고 |
|---|---|---|
| id `@auto` | text | |
| email `*` | email | 로그인 ID |
| password `*` | password | PB 관리 |
| name `*` | text | 실명 |
| nickname | text | 표시명(친구 검색용, unique 권장) |
| birthdate | date | SRS: 생년월일 |
| avatar | file | 프로필 이미지 |
| created/updated `@auto` | date | |

> 회원가입 검증(SRS): 비밀번호 문자+숫자 조합, nickname 중복확인 → 프런트 + PB rule 양쪽.

### `settings` (사용자 1:1)
| 필드 | 타입 | 기본 | 비고 |
|---|---|---|---|
| user `*` (rel→users, unique) | | | 1인 1행 |
| theme (enum) | light \| dark \| system | system | 다크모드 |
| font (enum) | pretendard \| gothic \| serif … | pretendard | 폰트 변경 |
| locale (enum) | ko \| en | ko | |
| week_start (enum) | sun \| mon | sun | 달력 시작요일 |
| default_view (enum) | calendar \| list | calendar | 기본 진입 탭 |
| alarm_enabled (bool) | | true | 앱 내 알람 on/off |
| push_enabled (bool) | | false | 푸시 on/off |
| reminder_offsets [json] | | [10,60] | 일정 N분 전 알림(분) |

---

## 2. 일정 (코어)

### `categories` (사용자별 분류)
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | |
| name `*` | text | 직장/가족/학교… |
| color `*` | text | hex |

### `schedules`
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | 소유자 |
| title `*` | text | |
| description | editor | |
| start_at `*` | date | |
| end_at | date | 선택 |
| all_day (bool) | | 종일 일정 |
| importance (enum) | low \| mid \| high | 중요도 → 달력 색상 |
| category (rel→categories) | | |
| color | text | 표시 색 |
| repeat_rule [json] | | 아래 RepeatRule 구조 |
| auto_delete (bool) | | 기간 지나면 자동삭제 |
| visible (bool) | true | false면 메모처럼(리스트 미표시) |
| completed (bool) | | 투두 완료 여부 |
| location | text | |
| created/updated `@auto` | | |

```ts
// repeat_rule JSON 구조
type RepeatRule = {
  freq: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'interval';
  interval?: number;            // interval: N일마다
  weekdays?: number[];          // weekly: [0=일..6=토]
  monthDay?: number;            // monthly: 날짜
  lastDayOfMonth?: boolean;     // 월말 반복
  month?: number; day?: number; // yearly
  lunar?: boolean;              // 음력
  until?: string;               // 종료일(ISO)
};
```

---

## 3. 달력 부가

### `day_decorations` (날짜 꾸미기)
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | |
| date `*` | date | 하루 1행(user+date unique) |
| emoji | text | 기분 스티커 |
| star_rating (number) | | 0~5 별점 |
| bg_color | text | 배경색 |
| note | text | 한줄 메모 |

### `goals` (목표)
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | |
| title `*` | text | |
| period (enum) | year \| month | 연/월 목표 |
| start_at `*` / end_at `*` | date | 연초~연말 / 월초~월말 자동 |
| achieved (bool) | | |

---

## 4. 소셜 (1차 포함)

### `friendships`
| 필드 | 타입 | 비고 |
|---|---|---|
| requester `*` (rel→users) | | 보낸 사람 |
| addressee `*` (rel→users) | | 받은 사람 |
| status (enum) | pending \| accepted \| blocked | |
| created `@auto` | | (requester+addressee unique) |

### `schedule_shares` (일정 공유)
| 필드 | 타입 | 비고 |
|---|---|---|
| schedule `*` (rel) | | 공유 대상 일정 |
| owner `*` (rel→users) | | 원 소유자 |
| shared_with `*` (rel→users) | | 공유받는 사람 |
| permission (enum) | view \| edit | |

> 공유 일정은 양쪽 달력에 표시. edit 권한이면 수정 시 양쪽 동기화(PocketBase realtime).

---

## 5. 알람 / 푸시

### `notifications` (인앱 알림함)
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | 수신자 |
| type (enum) | schedule_due \| friend_request \| share \| system | |
| title `*` / body | text | |
| schedule (rel) | | 클릭 시 바로가기 대상 |
| link | text | 딥링크 경로 |
| read (bool) | | 읽음 |
| fire_at | date | 예약 발송 시각 |
| sent (bool) | | 푸시 발송됨 |

### `push_subscriptions` (Web Push)
| 필드 | 타입 | 비고 |
|---|---|---|
| user `*` (rel) | | |
| endpoint `*` | text | 브라우저 푸시 endpoint |
| p256dh `*` / auth `*` | text | 암호화 키 |
| user_agent | text | 기기 식별 |

> 서버측 발송은 PocketBase 훅(JS) 또는 별도 워커에서 `web-push`로 처리(2차).

---

## 6. 부가 기능 (2차)

### `memos`
| user`*` | title | content (editor) | color | pinned(bool) |

### `ledger_categories` (가계부 분류)
| user`*` | name`*` | type (enum: income\|expense) | color |

### `ledger_entries` (가계부)
| user`*` | date`*` | type (enum: income\|expense) | amount(number)`*` | category(rel) | memo |

### `grade_requirements` / `semesters` / `grades` (학점관리)
- `grade_requirements`: user`*`, total_credits, min_liberal, min_major
- `semesters`: user`*`, name`*` (예 "3학년 2학기")
- `grades`: semester(rel)`*`, course_name`*`, type(enum: liberal\|major), credits(number)`*`, score(enum: A+..F)

> 날씨(도시/기상청 API)는 보류 — 추후 `weather_cities` 컬렉션으로 확장.

---

## 접근제어 원칙
- 본인 데이터: `listRule/viewRule/createRule/updateRule/deleteRule = @request.auth.id = user`
- 공유 일정: `schedule_shares`를 통한 조회 허용 rule 추가
- 친구: 양방향 조회 허용(`requester` 또는 `addressee`가 본인)

## 재현성
- 스키마는 `pb_migrations/`의 JS 마이그레이션으로 버전관리(코드로 재생성 가능) → 레포에 포함, 실제 `pb_data`(데이터)는 `.gitignore`.
