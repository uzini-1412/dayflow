import { pb } from '@shared/lib/pb'
import { isOnline } from './netStatus'
import { cacheUpsert, cacheUpsertMany, cacheGet, cacheGetAll, cacheDelete } from './cache'
import { outboxAdd, queueDelete, makeTempId } from './outbox'
import { emitChange } from './events'
import { refreshPending } from './syncEngine'

/**
 * 오프라인 인지 읽기/쓰기 헬퍼.
 * feature 의 `*.api.ts` 가 PocketBase 호출을 이 함수들로 감싸면
 * 온라인=정상 동작 + 캐시 적재, 오프라인=캐시 읽기 + 대기열 적재(낙관적)가 된다.
 */
interface HasId {
  id: string
}

interface ListOpts<T> {
  /** 오프라인 캐시 조회 시 적용할 필터(서버 filter 와 동등하게) */
  filter?: (r: T) => boolean
  /** 오프라인 캐시 조회 시 정렬 */
  sort?: (a: T, b: T) => number
}

/** 온라인 우선 목록 조회 → 캐시 적재. 오프라인/실패 시 캐시에서 읽음. */
export async function offlineList<T extends HasId>(
  collection: string,
  fetcher: () => Promise<T[]>,
  opts: ListOpts<T> = {},
): Promise<T[]> {
  if (isOnline()) {
    try {
      const items = await fetcher()
      await cacheUpsertMany(collection, items)
      return items
    } catch (e) {
      if (isOnline()) throw e // 진짜 서버 오류면 전파, 연결 끊김이면 아래로
    }
  }
  let all = await cacheGetAll<T>(collection)
  if (opts.filter) all = all.filter(opts.filter)
  if (opts.sort) all = all.sort(opts.sort)
  return all
}

/** 단건 조회 (온라인 우선, 오프라인 캐시 폴백) */
export async function offlineGetOne<T extends HasId>(
  collection: string,
  id: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (isOnline()) {
    try {
      const rec = await fetcher()
      await cacheUpsert(collection, rec)
      return rec
    } catch (e) {
      if (isOnline()) throw e
    }
  }
  const cached = await cacheGet<T>(collection, id)
  if (!cached) throw new Error('오프라인: 캐시에 없는 항목입니다.')
  return cached
}

/** payload + 시스템필드로 만드는 기본 낙관적 레코드 (대부분의 단순 컬렉션에 충분) */
function defaultOptimistic<T extends HasId>(
  collection: string,
  tempId: string,
  payload: Record<string, unknown>,
): T {
  const now = new Date().toISOString()
  return {
    id: tempId,
    created: now,
    updated: now,
    collectionId: '',
    collectionName: collection,
    ...payload,
  } as unknown as T
}

/**
 * 생성. 오프라인이면 임시 ID 로 낙관적 레코드를 만들어 캐시+대기열에 넣고 반환.
 * @param buildOptimistic 임시 ID 를 받아 화면에 보일 레코드를 구성(생략 시 payload+시스템필드로 자동 구성)
 */
export async function offlineCreate<T extends HasId>(
  collection: string,
  payload: Record<string, unknown>,
  buildOptimistic?: (tempId: string) => T,
): Promise<T> {
  if (isOnline()) {
    try {
      const rec = await pb.collection(collection).create<T>(payload)
      await cacheUpsert(collection, rec)
      return rec
    } catch (e) {
      if (isOnline()) throw e
    }
  }
  const tempId = makeTempId()
  const temp = buildOptimistic ? buildOptimistic(tempId) : defaultOptimistic<T>(collection, tempId, payload)
  await cacheUpsert(collection, temp)
  await outboxAdd({ collection, op: 'create', recordId: temp.id, tempId: temp.id, payload, createdAt: Date.now() })
  emitChange(collection)
  await refreshPending()
  return temp
}

/** 수정. 오프라인이면 캐시본에 payload 를 병합해 낙관적 반환 + 대기열 적재. */
export async function offlineUpdate<T extends HasId>(
  collection: string,
  id: string,
  payload: Record<string, unknown>,
): Promise<T> {
  if (isOnline()) {
    try {
      const rec = await pb.collection(collection).update<T>(id, payload)
      await cacheUpsert(collection, rec)
      return rec
    } catch (e) {
      if (isOnline()) throw e
    }
  }
  const existing = await cacheGet<T>(collection, id)
  const merged = { ...(existing ?? { id }), ...payload, id } as T
  await cacheUpsert(collection, merged)
  await outboxAdd({ collection, op: 'update', recordId: id, payload, createdAt: Date.now() })
  emitChange(collection)
  await refreshPending()
  return merged
}

/** 삭제. 오프라인이면 캐시에서 지우고 대기열에 삭제를 넣는다(임시본이면 생성 자체를 취소). */
export async function offlineDelete(collection: string, id: string): Promise<void> {
  if (isOnline()) {
    try {
      await pb.collection(collection).delete(id)
      await cacheDelete(collection, id)
      return
    } catch (e) {
      if (isOnline()) throw e
    }
  }
  await cacheDelete(collection, id)
  await queueDelete(collection, id)
  emitChange(collection)
  await refreshPending()
}
