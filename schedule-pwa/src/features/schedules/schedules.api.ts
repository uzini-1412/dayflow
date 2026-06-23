import { pb } from '@shared/lib/pb'
import {
  offlineList,
  offlineGetOne,
  offlineCreate,
  offlineUpdate,
  offlineDelete,
  onOfflineChange,
} from '@shared/lib/offline'
import type { Schedule, ScheduleInput } from './schedules.types'

const COL = 'schedules'

function ownerData(input: ScheduleInput) {
  return {
    ...input,
    user: pb.authStore.record?.id,
    visible: input.visible ?? true,
  }
}

const byStart = (a: Schedule, b: Schedule) => a.start_at.localeCompare(b.start_at)

/** 오프라인 낙관적 레코드(임시) 구성 — 서버 미반영분을 화면에 즉시 노출 */
function optimistic(tempId: string, data: ReturnType<typeof ownerData>): Schedule {
  const now = new Date().toISOString()
  return {
    id: tempId,
    created: now,
    updated: now,
    collectionId: '',
    collectionName: COL,
    user: data.user ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    start_at: data.start_at ?? now,
    end_at: data.end_at ?? '',
    all_day: data.all_day ?? false,
    importance: data.importance ?? 'mid',
    category: data.category ?? '',
    color: data.color ?? '',
    repeat_rule: data.repeat_rule ?? null,
    auto_delete: data.auto_delete ?? false,
    visible: data.visible ?? true,
    completed: false,
    location: data.location ?? '',
    cost: data.cost ?? 0,
    attachments: [],
    project: data.project ?? '',
    space: data.space ?? '',
  }
}

/** schedules 컬렉션 호출 모음 (오프라인 인지) */
export const schedulesApi = {
  /** 기간 내 일정 조회 (달력/리스트 공용) */
  async listRange(fromISO: string, toISO: string): Promise<Schedule[]> {
    return offlineList<Schedule>(
      COL,
      () =>
        pb.collection(COL).getFullList<Schedule>({
          filter: `start_at >= "${fromISO}" && start_at <= "${toISO}"`,
          sort: 'start_at',
        }),
      { filter: (s) => s.start_at >= fromISO && s.start_at <= toISO, sort: byStart },
    )
  },

  async listAll(): Promise<Schedule[]> {
    return offlineList<Schedule>(COL, () => pb.collection(COL).getFullList<Schedule>({ sort: 'start_at' }), {
      sort: byStart,
    })
  },

  /** 반복 전개용: 범위 끝(toISO) 이전에 시작한 모든 일정 (과거 반복 마스터 포함) */
  async listUpTo(toISO: string): Promise<Schedule[]> {
    return offlineList<Schedule>(
      COL,
      () =>
        pb.collection(COL).getFullList<Schedule>({
          filter: `start_at <= "${toISO}"`,
          sort: 'start_at',
        }),
      { filter: (s) => s.start_at <= toISO, sort: byStart },
    )
  },

  /** 프로젝트에 묶인 일정 전체 */
  async listWithProjects(): Promise<Schedule[]> {
    return offlineList<Schedule>(
      COL,
      () => pb.collection(COL).getFullList<Schedule>({ filter: 'project != ""', sort: 'start_at' }),
      { filter: (s) => !!s.project, sort: byStart },
    )
  },

  /** 스페이스의 일정 */
  async listBySpace(spaceId: string): Promise<Schedule[]> {
    return offlineList<Schedule>(
      COL,
      () => pb.collection(COL).getFullList<Schedule>({ filter: `space = "${spaceId}"`, sort: 'start_at' }),
      { filter: (s) => s.space === spaceId, sort: byStart },
    )
  },

  /** 제목 검색 (오프라인 시 캐시에서 부분일치) */
  async search(q: string): Promise<Schedule[]> {
    const query = q.trim()
    if (!query) return []
    const all = await offlineList<Schedule>(
      COL,
      () =>
        pb
          .collection(COL)
          .getList<Schedule>(1, 20, { filter: `title ~ "${query}"`, sort: '-start_at' })
          .then((r) => r.items),
      {
        filter: (s) => s.title.toLowerCase().includes(query.toLowerCase()),
        sort: (a, b) => b.start_at.localeCompare(a.start_at),
      },
    )
    return all.slice(0, 20)
  },

  async create(input: ScheduleInput): Promise<Schedule> {
    const data = ownerData(input)
    return offlineCreate<Schedule>(COL, data, (tempId) => optimistic(tempId, data))
  },

  async update(id: string, input: Partial<ScheduleInput>): Promise<Schedule> {
    return offlineUpdate<Schedule>(COL, id, input as Record<string, unknown>)
  },

  async toggleComplete(id: string, completed: boolean): Promise<Schedule> {
    return offlineUpdate<Schedule>(COL, id, { completed })
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },

  async getOne(id: string): Promise<Schedule> {
    return offlineGetOne<Schedule>(COL, id, () => pb.collection(COL).getOne<Schedule>(id))
  },

  /** 첨부파일 추가 (온라인 전용 — 파일 업로드) */
  async addAttachments(id: string, files: File[]): Promise<Schedule> {
    const fd = new FormData()
    for (const f of files) fd.append('attachments+', f)
    return pb.collection(COL).update<Schedule>(id, fd)
  },

  async removeAttachment(id: string, filename: string): Promise<Schedule> {
    return pb.collection(COL).update<Schedule>(id, { 'attachments-': filename })
  },

  fileUrl(record: Schedule, filename: string): string {
    return pb.files.getURL(record, filename)
  },

  /** 실시간 구독 — 서버 realtime + 로컬(오프라인) 변경 모두를 콜백으로 */
  subscribe(cb: () => void): () => void {
    let unsubPb = () => {}
    pb.collection(COL)
      .subscribe('*', cb)
      .then((u) => {
        unsubPb = u
      })
      .catch(() => {
        /* 오프라인이면 구독 실패 — 로컬 이벤트로만 갱신 */
      })
    const offLocal = onOfflineChange(COL, cb)
    return () => {
      unsubPb()
      offLocal()
    }
  },
}
