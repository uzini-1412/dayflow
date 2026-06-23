import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@shared/lib/routes'
import { LoginPage, RegisterPage } from '@features/auth'
import { SettingsPage } from '@features/settings'
import { CalendarPage } from '@features/calendar'
import { ListPage } from '@features/schedules'
import { SocialPage } from '@features/social'
import { DashboardPage } from '@features/dashboard'
import { MemosPage } from '@features/memos'
import { TimetablePage } from '@features/timetable'
import { TrackerPage } from '@features/tracker'
import { HabitsPage } from '@features/habits'
import { ProjectsPage } from '@features/projects'
import { SpacesPage } from '@features/spaces'
import { AppLayout } from './layout/AppLayout'
import { MorePage } from './pages/MorePage'
import { ProtectedRoute } from './ProtectedRoute'
import { ModuleRoute } from './ModuleRoute'

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.home, element: <DashboardPage /> },
          { path: ROUTES.calendar, element: <CalendarPage /> },
          { path: ROUTES.list, element: <ListPage /> },
          { path: ROUTES.more, element: <MorePage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
          {
            element: <ModuleRoute module="friends" />,
            children: [
              { path: ROUTES.social, element: <SocialPage /> },
              { path: ROUTES.spaces, element: <SpacesPage /> },
            ],
          },
          {
            element: <ModuleRoute module="memo" />,
            children: [{ path: ROUTES.memos, element: <MemosPage /> }],
          },
          {
            element: <ModuleRoute module="timetable" />,
            children: [{ path: ROUTES.timetable, element: <TimetablePage /> }],
          },
          {
            element: <ModuleRoute module="grades" />,
            children: [{ path: ROUTES.tracker, element: <TrackerPage /> }],
          },
          {
            element: <ModuleRoute module="habits" />,
            children: [{ path: ROUTES.habits, element: <HabitsPage /> }],
          },
          {
            element: <ModuleRoute module="projects" />,
            children: [{ path: ROUTES.projects, element: <ProjectsPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
])
