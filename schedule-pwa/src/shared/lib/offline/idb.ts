/**
 * 의존성 없는 최소 IndexedDB 래퍼 (Promise 기반).
 * 오프라인 동기화의 저장소: 캐시 미러(records) + 송신 대기열(outbox).
 * 외부에선 cache.ts / outbox.ts 를 통해서만 사용한다.
 */

const DB_NAME = 'dayflow-offline'
const DB_VERSION = 1

export const STORES = {
  /** 컬렉션 레코드 미러. 키 = `${collection}/${id}` */
  records: 'records',
  /** 송신 대기 변경(create/update/delete). seq 자동증가 */
  outbox: 'outbox',
} as const

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORES.records)) db.createObjectStore(STORES.records)
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        db.createObjectStore(STORES.outbox, { keyPath: 'seq', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode)
        const req = fn(tx.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  return run<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>)
}

export function idbSet(store: string, key: IDBValidKey, value: unknown): Promise<IDBValidKey> {
  return run(store, 'readwrite', (s) => s.put(value, key))
}

export function idbDelete(store: string, key: IDBValidKey): Promise<undefined> {
  return run(store, 'readwrite', (s) => s.delete(key) as IDBRequest<undefined>)
}

/** keyPath 스토어(outbox)용: 키 없이 put */
export function idbPut(store: string, value: unknown): Promise<IDBValidKey> {
  return run(store, 'readwrite', (s) => s.put(value))
}

/** 키 범위(prefix)로 값 전체 조회. records 미러에서 컬렉션 단위 조회에 사용 */
export function idbGetAll<T>(store: string, range?: IDBKeyRange): Promise<T[]> {
  return run<T[]>(store, 'readonly', (s) => s.getAll(range) as IDBRequest<T[]>)
}

/** `${prefix}/...` 키만 묶는 범위 헬퍼 */
export function prefixRange(prefix: string): IDBKeyRange {
  return IDBKeyRange.bound(`${prefix}/`, `${prefix}/￿`)
}
