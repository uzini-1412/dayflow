/** PocketBase 모든 레코드 공통 필드 */
export interface BaseRecord {
  id: string
  created: string
  updated: string
  collectionId: string
  collectionName: string
}

/** 인증 사용자 레코드 (users 컬렉션) */
export interface UserRecord extends BaseRecord {
  email: string
  name: string
  nickname: string
  birthdate?: string
  avatar?: string
  verified: boolean
}
