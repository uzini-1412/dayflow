/// <reference path="../pb_data/types.d.ts" />

/** 달력 꾸미기(day_decorations) + 목표(goals) 컬렉션 */
migrate(
  (app) => {
    const USERS_ID = '_pb_users_auth_'
    const ownerRule = '@request.auth.id != "" && @request.auth.id = user'
    const autodate = (name, onUpdate) => ({
      name,
      type: 'autodate',
      onCreate: true,
      onUpdate: !!onUpdate,
    })
    const userRel = {
      name: 'user',
      type: 'relation',
      collectionId: USERS_ID,
      maxSelect: 1,
      required: true,
      cascadeDelete: true,
    }

    const decorations = new Collection({
      type: 'base',
      name: 'day_decorations',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        userRel,
        { name: 'date', type: 'text', required: true, max: 10 }, // yyyy-MM-dd
        { name: 'emoji', type: 'text', max: 10 },
        { name: 'star_rating', type: 'number', min: 0, max: 5 },
        { name: 'bg_color', type: 'text', max: 20 },
        { name: 'note', type: 'text', max: 200 },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: ['CREATE UNIQUE INDEX idx_decoration_user_date ON day_decorations (user, date)'],
    })
    app.save(decorations)

    const goals = new Collection({
      type: 'base',
      name: 'goals',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        userRel,
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'period', type: 'select', maxSelect: 1, values: ['year', 'month'] },
        { name: 'period_key', type: 'text', required: true, max: 7 }, // yyyy 또는 yyyy-MM
        { name: 'achieved', type: 'bool' },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: ['CREATE INDEX idx_goals_user_period ON goals (user, period_key)'],
    })
    app.save(goals)
  },
  (app) => {
    for (const name of ['day_decorations', 'goals']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {
        // 무시
      }
    }
  },
)
