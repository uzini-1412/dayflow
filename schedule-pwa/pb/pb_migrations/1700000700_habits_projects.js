/// <reference path="../pb_data/types.d.ts" />

/** 습관 트래커(habits/habit_logs) + 프로젝트(projects) + 일정 project 연결 */
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

    // --- 습관 ---
    app.save(
      new Collection({
        type: 'base',
        name: 'habits',
        ...rules,
        fields: [
          userRel,
          { name: 'name', type: 'text', required: true, max: 50 },
          { name: 'emoji', type: 'text', max: 10 },
          { name: 'color', type: 'text', max: 20 },
          { name: 'active', type: 'bool' },
          autodate('created'),
          autodate('updated', true),
        ],
      }),
    )
    const HABITS_ID = app.findCollectionByNameOrId('habits').id

    // --- 습관 수행 로그 (존재=완료) ---
    app.save(
      new Collection({
        type: 'base',
        name: 'habit_logs',
        ...rules,
        fields: [
          userRel,
          { name: 'habit', type: 'relation', collectionId: HABITS_ID, maxSelect: 1, required: true, cascadeDelete: true },
          { name: 'date', type: 'text', required: true, max: 10 },
          autodate('created'),
          autodate('updated', true),
        ],
        indexes: ['CREATE UNIQUE INDEX idx_habit_log ON habit_logs (habit, date)'],
      }),
    )

    // --- 프로젝트 ---
    app.save(
      new Collection({
        type: 'base',
        name: 'projects',
        ...rules,
        fields: [
          userRel,
          { name: 'name', type: 'text', required: true, max: 100 },
          { name: 'color', type: 'text', max: 20 },
          { name: 'archived', type: 'bool' },
          autodate('created'),
          autodate('updated', true),
        ],
      }),
    )
    const PROJECTS_ID = app.findCollectionByNameOrId('projects').id

    // --- 일정 ↔ 프로젝트 연결 ---
    const schedules = app.findCollectionByNameOrId('schedules')
    schedules.fields.add(
      new Field({ name: 'project', type: 'relation', collectionId: PROJECTS_ID, maxSelect: 1, cascadeDelete: false }),
    )
    app.save(schedules)
  },
  (app) => {
    const schedules = app.findCollectionByNameOrId('schedules')
    if (schedules.fields.getByName('project')) schedules.fields.removeByName('project')
    app.save(schedules)
    for (const name of ['habit_logs', 'habits', 'projects']) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {
        // 무시
      }
    }
  },
)
