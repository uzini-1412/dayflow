import { openAuthModal, useAuth } from '@features/auth'
import { useModuleEnabled } from '@features/settings'
import {
  ScheduleFormModal,
  ScheduleItem,
  useScheduleEditor,
  useScheduleMutations,
} from '@features/schedules'
import { useDashboard } from '../useDashboard'
import { quoteOfTheDay } from '../quotes'
import { Clock } from '../components/Clock'
import { DdayBanner } from '../components/DdayBanner'
import { StatCard } from '../components/StatCard'

export function DashboardPage() {
  const { user } = useAuth()
  const budgetOn = useModuleEnabled('budget')
  const { now, today, todoLeft, weekCount, weekDone, dday, monthSpend } = useDashboard()
  const editor = useScheduleEditor()
  const { toggleComplete } = useScheduleMutations()
  const quote = quoteOfTheDay(now)

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {user ? `안녕하세요, ${user.nickname || user.name}님 👋` : '둘러보는 중이에요 👀'}
          </p>
          <Clock />
        </div>
      </div>

      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-700 dark:text-zinc-200">
            로그인하면 일정·메모를 저장할 수 있어요. 데모 계정으로 바로 체험해 볼 수도 있어요.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            시작하기
          </button>
        </div>
      )}

      <blockquote className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        “{quote.text}” <span className="text-zinc-400">— {quote.author}</span>
      </blockquote>

      <DdayBanner schedule={dday} now={now} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="오늘 남은 일" value={`${todoLeft}건`} />
        <StatCard label="이번 주 일정" value={`${weekCount}건`} hint={`완료 ${weekDone}`} />
        {budgetOn && (
          <StatCard label="이번 달 지출" value={`${monthSpend.toLocaleString()}원`} />
        )}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">오늘 일정</h2>
        {today.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
            오늘 일정이 없어요.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-3 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {today.map((s) => (
              <ScheduleItem
                key={`${s.id}-${s.start_at}`}
                schedule={s}
                onToggle={(it) => toggleComplete(it.id, !it.completed)}
                onClick={editor.openEdit}
              />
            ))}
          </div>
        )}
      </section>

      {editor.isOpen && (
        <ScheduleFormModal
          isOpen={editor.isOpen}
          onClose={editor.close}
          schedule={editor.selected}
        />
      )}
    </div>
  )
}
