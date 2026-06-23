/**
 * 로컬 변경 알림 버스.
 * 오프라인 쓰기는 PocketBase realtime 이벤트가 없으므로, 캐시를 바꾼 직후
 * 이 버스로 신호를 쏴서 읽기 훅이 다시 그리도록 한다.
 *
 * collection 단위 구독 + `'*'`(전체) 브로드캐스트 지원.
 */
type Listener = () => void

const listeners = new Map<string, Set<Listener>>()

/** 특정 컬렉션(또는 '*' 전체)의 로컬 변경을 구독. 해제 함수 반환 */
export function onOfflineChange(collection: string, cb: Listener): () => void {
  let set = listeners.get(collection)
  if (!set) {
    set = new Set()
    listeners.set(collection, set)
  }
  set.add(cb)
  return () => set?.delete(cb)
}

/** 변경 브로드캐스트. 해당 컬렉션 구독자 + '*' 구독자 + collection==='*' 이면 전체 */
export function emitChange(collection: string): void {
  if (collection === '*') {
    for (const set of listeners.values()) set.forEach((cb) => cb())
    return
  }
  listeners.get(collection)?.forEach((cb) => cb())
  if (collection !== '*') listeners.get('*')?.forEach((cb) => cb())
}
