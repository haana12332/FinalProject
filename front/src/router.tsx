import { createBrowserRouter, Navigate } from 'react-router'
import { AdminLayout } from './presentation/layouts/AdminLayout'
import { DesignLayout } from './presentation/layouts/DesignLayout'
import { SessionLayout } from './presentation/layouts/SessionLayout'
import {
  ProjectListPage,
  GuiListPage,
  AdminDesignPage,
  AdminRequirementsPage,
  ParticipantsPage,
  SessionStartPage,
  SessionDesignPage,
  SessionRequirementsPage,
} from './presentation/pages'

export const router = createBrowserRouter([
  // / → /admin/projects にリダイレクト
  { path: '/', element: <Navigate to="/admin/projects" replace /> },

  // 研究者用
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="projects" replace /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/:project_id', element: <GuiListPage /> },
      { path: 'projects/:project_id/requirements', element: <AdminRequirementsPage /> },
      { path: 'projects/:project_id/participants', element: <ParticipantsPage /> },
    ],
  },
  {
    path: '/admin/projects/:project_id/guis/:gui_id',
    element: <DesignLayout />,
    children: [{ index: true, element: <AdminDesignPage /> }],
  },

  // 被験者用
  {
    path: '/session',
    element: <SessionLayout />,
    children: [
      { index: true, element: <SessionStartPage /> },
      { path: ':session_id', element: <SessionDesignPage /> },
      { path: ':session_id/requirements', element: <SessionRequirementsPage /> },
    ],
  },
])
