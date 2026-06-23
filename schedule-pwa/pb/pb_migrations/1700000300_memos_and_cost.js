/// <reference path="../pb_data/types.d.ts" />

/** 메모 컬렉션 + 일정 비용(cost) 필드 (일정 연동형 비용 기록) */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const ownerRule = '@request.auth.id != "" && @request.auth.id = user'
    const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate: !!onUpdate })

    // --- 메모 ---
    app.save(
      new Collection({
        type: 'base',
        name: 'memos',
        listRule: ownerRule,
        viewRule: ownerRule,
        createRule: ownerRule,
        updateRule: ownerRule,
        deleteRule: ownerRule,
        fields: [
          { name: 'user', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'title', type: 'text', max: 200 },
          { name: 'content', type: 'editor' },
          { name: 'color', type: 'text', max: 20 },
          { name: 'pinned', type: 'bool' },
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE INDEX idx_memos_user_pinned ON memos (user, pinned)'],
      }),
    )

    // --- 일정에 비용 필드 추가 (일정 연동형 비용 기록) ---
    const schedules = app.findCollectionByNameOrId('schedules')
    schedules.fields.add(new Field({ name: 'cost', type: 'number', min: 0 }))
    app.save(schedules)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('memos'))
    } catch (_) {
      // 무시
    }
    const schedules = app.findCollectionByNameOrId('schedules')
    if (schedules.fields.getByName('cost')) schedules.fields.removeByName('cost')
    app.save(schedules)
  },
)
