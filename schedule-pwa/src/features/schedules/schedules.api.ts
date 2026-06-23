import { pb } from '@shared/lib/pb'
import type { Schedule, ScheduleInput } from './schedules.types'

const COL = 'schedules'

function ownerData(input: ScheduleInput) {
  return {
    ...input,
    user: pb.authStore.record?.id,
    visible: input.visible ?? true,
  }
}

/** schedules 컬렉션 호출 모음 */
export const schedulesApi = {
  /** 기간 내 일정 조회 (달력/리스트 공용) */
  async listRange(fromISO: string, toISO: string): Promise<Schedule[]> {
    return pb.collection(COL).getFullList<Schedule>({
      filter: `start_at >= "${fromISO}" && start_at <= "${toISO}"`,
      sort: 'start_at',
    })
  },

  async listAll(): Promise<Schedule[]> {
    return pb.collection(COL).getFullList<Schedule>({ sort: 'start_at' })
  },

  /** 반복 전개용: 범위 끝(toISO) 이전에 시작한 모든 일정 (과거 반복 마스터 포함) */
  async listUpTo(toISO: string): Promise<Schedule[]> {
    return pb.collection(COL).getFullList<Schedule>({
      filter: `start_at <= "${toISO}"`,
      sort: 'start_at',
    })
  },

  /** 프로젝트에 묶인 일정 전체 */
  async listWithProjects(): Promise<Schedule[]> {
    return pb.collection(COL).getFullList<Schedule>({ filter: 'project != ""', sort: 'start_at' })
  },

  /** 스페이스의 일정 */
  async listBySpace(spaceId: string): Promise<Schedule[]> {
    return pb.collection(COL).getFullList<Schedule>({ filter: `space = "${spaceId}"`, sort: 'start_at' })
  },

  /** 제목 검색 */
  async search(q: string): Promise<Schedule[]> {
    if (!q.trim()) return []
    const res = await pb.collection(COL).getList<Schedule>(1, 20, {
      filter: `title ~ "${q}"`,
      sort: '-start_at',
    })
    return res.items
  },

  async create(input: ScheduleInput): Promise<Schedule> {
    return pb.collection(COL).create<Schedule>(ownerData(input))
  },

  async update(id: string, input: Partial<ScheduleInput>): Promise<Schedule> {
    return pb.collection(COL).update<Schedule>(id, input)
  },

  async toggleComplete(id: string, completed: boolean): Promise<Schedule> {
    return pb.collection(COL).update<Schedule>(id, { completed })
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },

  async getOne(id: string): Promise<Schedule> {
    return pb.collection(COL).getOne<Schedule>(id)
  },

  /** 첨부파일 추가 (기존 유지하며 append) */
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

  /** 실시간 구독 (변경 시 콜백) */
  subscribe(cb: () => void): () => void {
    const p = pb.collection(COL).subscribe('*', cb)
    return () => void p.then((u) => u())
  },
}
