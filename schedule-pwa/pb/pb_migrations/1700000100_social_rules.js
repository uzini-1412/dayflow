/// <reference path="../pb_data/types.d.ts" />

/**
 * 소셜 접근규칙:
 *  - users: 인증 사용자는 닉네임으로 검색/조회 가능 (친구 추가용)
 *  - schedules: 본인 OR 공유받은(schedule_shares) 일정까지 조회 허용
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    app.save(users)

    const schedules = app.findCollectionByNameOrId('schedules')
    const sharedRule =
      '@request.auth.id = user || ' +
      '(@collection.schedule_shares.schedule ?= id && @collection.schedule_shares.shared_with ?= @request.auth.id)'
    schedules.listRule = sharedRule
    schedules.viewRule = sharedRule
    app.save(schedules)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = null
    users.viewRule = null
    app.save(users)

    const schedules = app.findCollectionByNameOrId('schedules')
    const owner = '@request.auth.id != "" && @request.auth.id = user'
    schedules.listRule = owner
    schedules.viewRule = owner
    app.save(schedules)
  },
)
