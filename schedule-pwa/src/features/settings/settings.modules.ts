/** 켜고 끌 수 있는 선택 기능 모듈 (코어=달력/리스트/설정은 항상 on) */
export type ModuleKey =
  | 'friends'
  | 'memo'
  | 'budget'
  | 'timetable'
  | 'grades'
  | 'habits'
  | 'projects'

export type AppMode = 'student' | 'worker' | 'minimal' | 'custom'

export interface ModuleMeta {
  key: ModuleKey
  label: string
  icon: string
  description: string
}

export const MODULES: ModuleMeta[] = [
  { key: 'friends', label: '친구·공유', icon: '👥', description: '친구 추가와 일정 공유' },
  { key: 'memo', label: '메모', icon: '📝', description: '간단한 메모장' },
  { key: 'budget', label: '비용 기록', icon: '💰', description: '일정에 지출을 기록하고 합산' },
  { key: 'timetable', label: '루틴/타임블록', icon: '🗓️', description: '주간 고정 루틴 뷰' },
  { key: 'grades', label: '학습 플래너', icon: '🎓', description: '학기별 과목·학점·평점(GPA) 관리' },
  { key: 'habits', label: '습관 트래커', icon: '🔁', description: '매일 반복하는 습관 체크·연속 기록' },
  { key: 'projects', label: '프로젝트', icon: '📁', description: '여러 일정을 묶어 진행 관리' },
]

export type ActiveModules = Record<ModuleKey, boolean>

/** 모드 프리셋 → 활성 모듈 */
export const MODE_PRESETS: Record<Exclude<AppMode, 'custom'>, ActiveModules> = {
  student: { friends: true, memo: true, budget: false, timetable: true, grades: true, habits: true, projects: false },
  worker: { friends: true, memo: true, budget: true, timetable: true, grades: false, habits: true, projects: true },
  minimal: { friends: false, memo: false, budget: false, timetable: false, grades: false, habits: false, projects: false },
}

export const MODE_OPTIONS: { value: AppMode; label: string }[] = [
  { value: 'student', label: '학생' },
  { value: 'worker', label: '직장인' },
  { value: 'minimal', label: '미니멀' },
  { value: 'custom', label: '커스텀' },
]

export const DEFAULT_ACTIVE_MODULES: ActiveModules = {
  friends: true,
  memo: true,
  budget: true,
  timetable: false,
  grades: false,
  habits: false,
  projects: false,
}
