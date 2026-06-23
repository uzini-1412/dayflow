/// <reference path="../pb_data/types.d.ts" />

/**
 * 학습·성적 트래커 (범용): track_groups(학기/분기) + track_items(과목/항목)
 * 학생=학점·평점, 일반=가중치·달성도 로 재사용.
 */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const ownerRule = '@request.auth.id != "" && @request.auth.id = user'
    const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate: !!onUpdate })
    const userRel = { name: 'user', type: 'relation', collectionId: USERS_ID, maxSelect: 1, required: true, cascadeDelete: true }
    const rules = {
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
    }

    app.save(
      new Collection({
        type: 'base',
        name: 'track_groups',
        ...rules,
        fields: [
          userRel,
          { name: 'name', type: 'text', required: true, max: 50 },
          { name: 'order', type: 'number' },
          autodate('created'),
          autodate('updated', true),
        ],
      }),
    )
    const GROUP_ID = app.findCollectionByNameOrId('track_groups').id

    app.save(
      new Collection({
        type: 'base',
        name: 'track_items',
        ...rules,
        fields: [
          userRel,
          { name: 'group', type: 'relation', collectionId: GROUP_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'name', type: 'text', required: true, max: 100 },
          { name: 'credits', type: 'number', min: 0 }, // 학점/가중치
          { name: 'point', type: 'number', min: 0 }, // 평점(0~4.5) 또는 달성도
          { name: 'letter', type: 'text', max: 5 }, // A+, PASS 등
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE INDEX idx_track_items_group ON track_items (group)'],
      }),
    )
  },
  (app) => {
    for (const name of ['track_items', 'track_groups']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {
        // 무시
      }
    }
  },
)
