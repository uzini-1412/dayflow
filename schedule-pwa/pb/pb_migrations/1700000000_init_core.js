/// <reference path="../pb_data/types.d.ts" />

/**
 * 코어 스키마: users 확장 + settings/categories/schedules/friendships/
 * schedule_shares/notifications/push_subscriptions
 * 모든 사용자 데이터는 user(또는 owner) 관계로 소유자를 가지며 행단위 접근제어를 건다.
 */
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
    const rel = (name, collectionId, opts = {}) => ({
      name,
      type: 'relation',
      collectionId,
      maxSelect: 1,
      minSelect: 0,
      cascadeDelete: opts.cascadeDelete ?? false,
      required: opts.required ?? false,
    })

    // --- 1. users 확장 ---
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new Field({ name: 'name', type: 'text', max: 50 }))
    users.fields.add(new Field({ name: 'nickname', type: 'text', max: 30 }))
    users.fields.add(new Field({ name: 'birthdate', type: 'date' }))
    users.addIndex('idx_users_nickname', true, 'nickname', '')
    app.save(users)

    // --- 2. settings (1인 1행) ---
    const settings = new Collection({
      type: 'base',
      name: 'settings',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        rel('user', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'theme', type: 'select', maxSelect: 1, values: ['light', 'dark', 'system'] },
        { name: 'font', type: 'select', maxSelect: 1, values: ['pretendard', 'gothic', 'serif'] },
        { name: 'locale', type: 'select', maxSelect: 1, values: ['ko', 'en'] },
        { name: 'week_start', type: 'select', maxSelect: 1, values: ['sun', 'mon'] },
        { name: 'default_view', type: 'select', maxSelect: 1, values: ['calendar', 'list'] },
        { name: 'alarm_enabled', type: 'bool' },
        { name: 'push_enabled', type: 'bool' },
        { name: 'reminder_offsets', type: 'json', maxSize: 2000 },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: ['CREATE UNIQUE INDEX idx_settings_user ON settings (user)'],
    })
    app.save(settings)

    // --- 3. categories ---
    const categories = new Collection({
      type: 'base',
      name: 'categories',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        rel('user', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'name', type: 'text', required: true, max: 30 },
        { name: 'color', type: 'text', required: true, max: 20 },
        autodate('created'),
        autodate('updated', true),
      ],
    })
    app.save(categories)
    const CATEGORIES_ID = app.findCollectionByNameOrId('categories').id

    // --- 4. schedules ---
    const schedules = new Collection({
      type: 'base',
      name: 'schedules',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        rel('user', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'description', type: 'editor' },
        { name: 'start_at', type: 'date', required: true },
        { name: 'end_at', type: 'date' },
        { name: 'all_day', type: 'bool' },
        { name: 'importance', type: 'select', maxSelect: 1, values: ['low', 'mid', 'high'] },
        rel('category', CATEGORIES_ID, { cascadeDelete: false }),
        { name: 'color', type: 'text', max: 20 },
        { name: 'repeat_rule', type: 'json', maxSize: 4000 },
        { name: 'auto_delete', type: 'bool' },
        { name: 'visible', type: 'bool' },
        { name: 'completed', type: 'bool' },
        { name: 'location', type: 'text', max: 200 },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: [
        'CREATE INDEX idx_schedules_user_start ON schedules (user, start_at)',
      ],
    })
    app.save(schedules)
    const SCHEDULES_ID = app.findCollectionByNameOrId('schedules').id

    // --- 5. friendships ---
    const friendships = new Collection({
      type: 'base',
      name: 'friendships',
      listRule: '@request.auth.id = requester || @request.auth.id = addressee',
      viewRule: '@request.auth.id = requester || @request.auth.id = addressee',
      createRule: '@request.auth.id = requester',
      updateRule: '@request.auth.id = requester || @request.auth.id = addressee',
      deleteRule: '@request.auth.id = requester || @request.auth.id = addressee',
      fields: [
        rel('requester', USERS_ID, { required: true, cascadeDelete: true }),
        rel('addressee', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'status', type: 'select', maxSelect: 1, values: ['pending', 'accepted', 'blocked'] },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_friend_pair ON friendships (requester, addressee)',
      ],
    })
    app.save(friendships)

    // --- 6. schedule_shares ---
    const shares = new Collection({
      type: 'base',
      name: 'schedule_shares',
      listRule: '@request.auth.id = owner || @request.auth.id = shared_with',
      viewRule: '@request.auth.id = owner || @request.auth.id = shared_with',
      createRule: '@request.auth.id = owner',
      updateRule: '@request.auth.id = owner',
      deleteRule: '@request.auth.id = owner || @request.auth.id = shared_with',
      fields: [
        rel('schedule', SCHEDULES_ID, { required: true, cascadeDelete: true }),
        rel('owner', USERS_ID, { required: true, cascadeDelete: true }),
        rel('shared_with', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'permission', type: 'select', maxSelect: 1, values: ['view', 'edit'] },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_share_pair ON schedule_shares (schedule, shared_with)',
      ],
    })
    app.save(shares)

    // --- 7. notifications ---
    const notifications = new Collection({
      type: 'base',
      name: 'notifications',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        rel('user', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'type', type: 'select', maxSelect: 1, values: ['schedule_due', 'friend_request', 'share', 'system'] },
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'body', type: 'text', max: 500 },
        rel('schedule', SCHEDULES_ID, { cascadeDelete: true }),
        { name: 'link', type: 'text', max: 200 },
        { name: 'read', type: 'bool' },
        { name: 'fire_at', type: 'date' },
        { name: 'sent', type: 'bool' },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: ['CREATE INDEX idx_notif_user_read ON notifications (user, read)'],
    })
    app.save(notifications)

    // --- 8. push_subscriptions ---
    const push = new Collection({
      type: 'base',
      name: 'push_subscriptions',
      listRule: ownerRule,
      viewRule: ownerRule,
      createRule: ownerRule,
      updateRule: ownerRule,
      deleteRule: ownerRule,
      fields: [
        rel('user', USERS_ID, { required: true, cascadeDelete: true }),
        { name: 'endpoint', type: 'text', required: true, max: 500 },
        { name: 'p256dh', type: 'text', required: true, max: 300 },
        { name: 'auth', type: 'text', required: true, max: 300 },
        { name: 'user_agent', type: 'text', max: 300 },
        autodate('created'),
        autodate('updated', true),
      ],
      indexes: ['CREATE UNIQUE INDEX idx_push_endpoint ON push_subscriptions (endpoint)'],
    })
    app.save(push)
  },
  (app) => {
    // down: 역순 삭제
    for (const name of [
      'push_subscriptions',
      'notifications',
      'schedule_shares',
      'friendships',
      'schedules',
      'categories',
      'settings',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {
        // 이미 없으면 무시
      }
    }
    const users = app.findCollectionByNameOrId('users')
    for (const f of ['name', 'nickname', 'birthdate']) {
      const field = users.fields.getByName(f)
      if (field) users.fields.removeByName(f)
    }
    app.save(users)
  },
)
