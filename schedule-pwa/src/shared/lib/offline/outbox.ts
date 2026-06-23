import { STORES, idbPut, idbDelete, idbGetAll } from './idb'

/**
 * 송신 대기열(outbox). 오프라인에서 발생한 변경을 순서대로(seq) 쌓아두고
 * 온라인 복귀 시 sync engine 이 재생한다.
 */
export type OutboxOp = 'create' | 'update' | 'delete'

export interface OutboxMutation {
  /** autoIncrement 키 (저장 후 채워짐) */
  seq?: number
  collection: string
  op: OutboxOp
  /** create=임시ID, update/delete=대상ID(임시일 수도 있음) */
  recordId: string
  /** create 일 때만: 재매핑용 임시ID */
  tempId?: string
  /** create/update 페이로드 (JSON 직렬화 가능해야 함) */
  payload?: Record<string, unknown>
  createdAt: number
}

const TEMP_PREFIX = 'tmp_'

/** 오프라인 낙관적 레코드용 임시 ID 생성 */
export function makeTempId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${performance.now()}-${Math.floor(Math.random() * 1e9)}`
  return `${TEMP_PREFIX}${rand}`
}

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX)
}

export async function outboxAll(): Promise<OutboxMutation[]> {
  const items = await idbGetAll<OutboxMutation>(STORES.outbox)
  return items.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
}

export async function outboxCount(): Promise<number> {
  return (await outboxAll()).length
}

export async function outboxAdd(m: Omit<OutboxMutation, 'seq'>): Promise<void> {
  await idbPut(STORES.outbox, m)
}

export async function outboxRemove(seq: number): Promise<void> {
  await idbDelete(STORES.outbox, seq)
}

async function outboxReplace(m: OutboxMutation): Promise<void> {
  if (m.seq == null) return
  await idbDelete(STORES.outbox, m.seq)
  await idbPut(STORES.outbox, m)
}

/**
 * 대상 레코드를 가리키는 대기 중인 변경을 큐에 넣는다.
 * - 아직 서버에 안 올라간(temp) 레코드를 삭제하면: 그 레코드의 create/update 항목을
 *   모두 제거하고 delete 도 넣지 않는다(서버엔 존재한 적 없음).
 */
export async function queueDelete(collection: string, recordId: string): Promise<void> {
  if (isTempId(recordId)) {
    const all = await outboxAll()
    for (const m of all) {
      if (m.collection === collection && (m.recordId === recordId || m.tempId === recordId)) {
        if (m.seq != null) await outboxRemove(m.seq)
      }
    }
    return
  }
  await outboxAdd({ collection, op: 'delete', recordId, createdAt: Date.now() })
}

/**
 * create 가 서버 ID 를 받은 뒤, 남아있는 대기 변경의 임시 ID 를 실 ID 로 치환.
 * (세션이 끊겨도 update/delete 가 올바른 대상을 가리키도록)
 */
export async function outboxRemapTempId(tempId: string, realId: string): Promise<void> {
  const all = await outboxAll()
  for (const m of all) {
    if (m.recordId === tempId) {
      await outboxReplace({ ...m, recordId: realId, tempId: undefined })
    }
  }
}
