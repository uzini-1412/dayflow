import { pb } from '@shared/lib/pb'
import { isOnline, netState } from './netStatus'
import { cacheDelete, cacheReplaceId } from './cache'
import { emitChange } from './events'
import {
  outboxAll,
  outboxCount,
  outboxRemove,
  outboxRemapTempId,
  type OutboxMutation,
} from './outbox'

/**
 * 대기열 플러시 엔진.
 * 온라인 복귀 시 outbox 의 변경을 seq 순서대로 서버에 재생한다.
 * - create 성공 → 임시ID를 실ID로 캐시/대기열 재매핑
 * - 4xx(복구 불가) → 해당 항목 폐기하고 계속
 * - 네트워크/5xx(일시적) → 멈추고 다음 기회에 재시도
 */

let flushing = false

interface PbError {
  status?: number
}

async function applyMutation(m: OutboxMutation): Promise<void> {
  if (m.op === 'create') {
    const created = await pb.collection(m.collection).create<{ id: string }>(m.payload ?? {})
    if (m.tempId) {
      await cacheReplaceId(m.collection, m.tempId, created)
      await outboxRemapTempId(m.tempId, created.id)
    }
  } else if (m.op === 'update') {
    await pb.collection(m.collection).update(m.recordId, m.payload ?? {})
  } else {
    await pb.collection(m.collection).delete(m.recordId)
    await cacheDelete(m.collection, m.recordId)
  }
}

/** 대기열을 가능한 만큼 비운다. 동시 호출/오프라인은 무시. */
export async function flushOutbox(): Promise<void> {
  if (flushing || !isOnline()) return
  flushing = true
  netState.setSyncing(true)
  try {
    const items = await outboxAll()
    for (const m of items) {
      if (!isOnline()) break
      try {
        await applyMutation(m)
        if (m.seq != null) await outboxRemove(m.seq)
      } catch (err) {
        const status = (err as PbError)?.status
        if (typeof status === 'number' && status >= 400 && status < 500) {
          // 검증 실패/대상 없음 등 — 재시도해도 안 됨. 폐기 후 진행.
          if (m.seq != null) await outboxRemove(m.seq)
          continue
        }
        break // 네트워크/서버 일시 오류 — 다음 기회에 재시도
      }
    }
  } finally {
    flushing = false
    netState.setSyncing(false)
    netState.setPending(await outboxCount())
    emitChange('*')
  }
}

/** 대기 개수만 갱신 (UI 초기 표시용) */
export async function refreshPending(): Promise<void> {
  netState.setPending(await outboxCount())
}
