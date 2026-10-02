/// <reference path="../pb_data/types.d.ts" />

/**
 * 공용 데모 계정(demo@dayflow.app) 보호: 방문자가 비밀번호를 바꾸거나 탈퇴해
 * 다른 방문자가 체험할 수 없게 되는 것을 막는다. 일반 사용자 규칙은 그대로.
 * (프론트 상수: src/features/auth/auth.demo.ts)
 */
const DEMO_EMAIL = 'demo@dayflow.app'
const SELF = 'id = @request.auth.id'
const SELF_NOT_DEMO = `id = @request.auth.id && @request.auth.email != "${DEMO_EMAIL}"`

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.updateRule = SELF_NOT_DEMO
    users.deleteRule = SELF_NOT_DEMO
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.updateRule = SELF
    users.deleteRule = SELF
    app.save(users)
  },
)
