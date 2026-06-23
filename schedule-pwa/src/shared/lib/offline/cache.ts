import { STORES, idbGet, idbSet, idbDelete, idbGetAll, prefixRange } from './idb'

/**
 * 컬렉션 레코드 미러. 온라인 조회 결과를 IndexedDB 에 적재해 두고,
 * 오프라인일 땐 여기서 읽는다. 키 = `${collection}/${id}`.
 *
 * 최소한 `id` 를 가진 레코드면 무엇이든 저장 가능(제네릭).
 */
interface HasId {
  id: string
}

function key(collection: string, id: string): string {
  return `${collection}/${id}`
}

export async function cacheUpsert<T extends HasId>(collection: string, record: T): Promise<void> {
  await idbSet(STORES.records, key(collection, record.id), record)
}

export async function cacheUpsertMany<T extends HasId>(collection: string, records: T[]): Promise<void> {
  await Promise.all(records.map((r) => cacheUpsert(collection, r)))
}

export async function cacheGet<T extends HasId>(collection: string, id: string): Promise<T | undefined> {
  return idbGet<T>(STORES.records, key(collection, id))
}

/** 컬렉션 전체 레코드 (오프라인 목록 조회용) */
export async function cacheGetAll<T extends HasId>(collection: string): Promise<T[]> {
  return idbGetAll<T>(STORES.records, prefixRange(collection))
}

export async function cacheDelete(collection: string, id: string): Promise<void> {
  await idbDelete(STORES.records, key(collection, id))
}

/** 오프라인 생성분이 서버 ID 를 받았을 때: 임시 ID 레코드를 실 ID 로 교체 */
export async function cacheReplaceId<T extends HasId>(
  collection: string,
  tempId: string,
  real: T,
): Promise<void> {
  await cacheDelete(collection, tempId)
  await cacheUpsert(collection, real)
}
