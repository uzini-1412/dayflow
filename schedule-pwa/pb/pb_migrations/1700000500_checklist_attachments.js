/// <reference path="../pb_data/types.d.ts" />

/** 일정 종속 기능: 준비물 체크리스트 + 첨부파일 */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const ownerRule = '@request.auth.id != "" && @request.auth.id = user'
    const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate: !!onUpdate })

    const schedules = app.findCollectionByNameOrId('schedules')
    const SCHEDULES_ID = schedules.id

    // --- 체크리스트(준비물) ---
    app.save(
      new Collection({
        type: 'base',
        name: 'checklist_items',
        listRule: ownerRule,
        viewRule: ownerRule,
        createRule: ownerRule,
        updateRule: ownerRule,
        deleteRule: ownerRule,
        fields: [
          { name: 'user', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'schedule', type: 'relation', collectionId: SCHEDULES_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'text', type: 'text', required: true, max: 200 },
          { name: 'done', type: 'bool' },
          { name: 'order', type: 'number' },
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE INDEX idx_checklist_schedule ON checklist_items (schedule)'],
      }),
    )

    // --- 일정 첨부파일 (사진/PDF 등 최대 5개) ---
    schedules.fields.add(
      new Field({
        name: 'attachments',
        type: 'file',
        maxSelect: 5,
        maxSize: 5242880,
        mimeTypes: [],
      }),
    )
    app.save(schedules)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('checklist_items'))
    } catch (_) {
      // 무시
    }
    const schedules = app.findCollectionByNameOrId('schedules')
    if (schedules.fields.getByName('attachments')) schedules.fields.removeByName('attachments')
    app.save(schedules)
  },
)
