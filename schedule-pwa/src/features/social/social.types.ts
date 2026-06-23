import type { BaseRecord, UserRecord } from '@shared/types/pb.types'

export type FriendStatus = 'pending' | 'accepted' | 'blocked'
export type SharePermission = 'view' | 'edit'

export interface Friendship extends BaseRecord {
  requester: string
  addressee: string
  status: FriendStatus
  expand?: {
    requester?: UserRecord
    addressee?: UserRecord
  }
}

export interface ScheduleShare extends BaseRecord {
  schedule: string
  owner: string
  shared_with: string
  permission: SharePermission
  expand?: {
    shared_with?: UserRecord
  }
}

/** 친구 목록 표시용 (상대방 정보 + 관계 id) */
export interface Friend {
  friendshipId: string
  user: UserRecord
  status: FriendStatus
  incoming: boolean // 내가 받은 요청인지
}
