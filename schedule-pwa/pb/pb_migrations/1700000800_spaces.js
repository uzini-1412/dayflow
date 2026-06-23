/// <reference path="../pb_data/types.d.ts" />

/**
 * 공유 스페이스(그룹 캘린더): spaces + space_members + 일정 space 연결.
 * 교차 참조 규칙(서로의 컬렉션을 참조) 때문에 컬렉션을 먼저 만들고 규칙은 나중에 설정한다.
 */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate: !!onUpdate })

    // 1) spaces (우선 owner 전용 규칙)
    app.save(
      new Collection({
        type: 'base',
        name: 'spaces',
        listRule: '@request.auth.id = owner',
        viewRule: '@request.auth.id = owner',
        createRule: '@request.auth.id = owner',
        updateRule: '@request.auth.id = owner',
        deleteRule: '@request.auth.id = owner',
        fields: [
          { name: 'owner', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'name', type: 'text', required: true, max: 60 },
          { name: 'color', type: 'text', max: 20 },
          autodate('created'),
          autodate('updated', true),
        ],
      }),
    )
    const SPACES_ID = app.findCollectionByNameOrId('spaces').id

    // 2) space_members (spaces 참조 — 존재함)
    app.save(
      new Collection({
        type: 'base',
        name: 'space_members',
        listRule: '@request.auth.id = user || space.owner = @request.auth.id',
        viewRule: '@request.auth.id = user || space.owner = @request.auth.id',
        createRule: 'space.owner = @request.auth.id',
        updateRule: 'space.owner = @request.auth.id',
        deleteRule: 'space.owner = @request.auth.id || @request.auth.id = user',
        fields: [
          { name: 'space', type: 'relation', collectionId: SPACES_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'user', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'role', type: 'select', maxSelect: 1, values: ['owner', 'member'] },
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE UNIQUE INDEX idx_space_member ON space_members (space, user)'],
      }),
    )

    // 3) 이제 space_members 가 존재하므로 spaces 규칙에 멤버 조회 허용 추가
    const spaces = app.findCollectionByNameOrId('spaces')
    const spaceAccess =
      '@request.auth.id = owner || (@collection.space_members.space ?= id && @collection.space_members.user ?= @request.auth.id)'
    spaces.listRule = spaceAccess
    spaces.viewRule = spaceAccess
    app.save(spaces)

    // 4) space_members 규칙에 동료 멤버 조회 허용 추가
    const members = app.findCollectionByNameOrId('space_members')
    const memberAccess =
      '@request.auth.id = user || space.owner = @request.auth.id || (@collection.space_members.space ?= space && @collection.space_members.user ?= @request.auth.id)'
    members.listRule = memberAccess
    members.viewRule = memberAccess
    app.save(members)

    // 5) 일정 ↔ 스페이스 연결 + 접근규칙 확장
    const schedules = app.findCollectionByNameOrId('schedules')
    schedules.fields.add(
      new Field({ name: 'space', type: 'relation', collectionId: SPACES_ID, maxSelect: 1, cascadeDelete: false }),
    )
    const rule =
      '@request.auth.id = user || ' +
      '(@collection.schedule_shares.schedule ?= id && @collection.schedule_shares.shared_with ?= @request.auth.id) || ' +
      '(@collection.space_members.space ?= space && @collection.space_members.user ?= @request.auth.id)'
    schedules.listRule = rule
    schedules.viewRule = rule
    app.save(schedules)
  },
  (app) => {
    const schedules = app.findCollectionByNameOrId('schedules')
    if (schedules.fields.getByName('space')) schedules.fields.removeByName('space')
    const rule =
      '@request.auth.id = user || ' +
      '(@collection.schedule_shares.schedule ?= id && @collection.schedule_shares.shared_with ?= @request.auth.id)'
    schedules.listRule = rule
    schedules.viewRule = rule
    app.save(schedules)
    for (const name of ['space_members', 'spaces']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {
        // 무시
      }
    }
  },
)
