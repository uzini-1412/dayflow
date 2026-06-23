/// <reference path="../pb_data/types.d.ts" />

/**
 * 일정 단위 댓글/실시간 대화.
 * 접근: 일정 소유자 또는 공유받은(schedule_shares) 사람만 보기/작성.
 * 수정/삭제는 작성자 본인만.
 */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const SCHEDULES_ID = app.findCollectionByNameOrId('schedules').id
    const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate: !!onUpdate })

    const canAccess =
      "@request.auth.id != '' && (schedule.user = @request.auth.id || " +
      '(@collection.schedule_shares.schedule ?= schedule.id && @collection.schedule_shares.shared_with ?= @request.auth.id))'

    app.save(
      new Collection({
        type: 'base',
        name: 'schedule_comments',
        listRule: canAccess,
        viewRule: canAccess,
        createRule: `@request.auth.id = user && (${canAccess})`,
        updateRule: '@request.auth.id = user',
        deleteRule: '@request.auth.id = user',
        fields: [
          { name: 'user', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'schedule', type: 'relation', collectionId: SCHEDULES_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'text', type: 'text', required: true, max: 1000 },
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE INDEX idx_comments_schedule ON schedule_comments (schedule, created)'],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('schedule_comments'))
    } catch (_) {
      // 무시
    }
  },
)
