import { generatePath } from 'react-router'

// ルート定義（パスパターン）
export const ROUTES = {
  // 研究者用
  adminProjects: '/admin/projects',
  adminProject: '/admin/projects/:project_id',
  adminDesign: '/admin/projects/:project_id/guis/:gui_id',
  adminParticipants: '/admin/projects/:project_id/participants',
  // 被験者用
  sessionStart: '/session',
  sessionDesign: '/session/:session_id',
} as const

// 遷移先 URL を組み立てるヘルパー（Link / navigate で使う）
export const paths = {
  adminProjects: () => ROUTES.adminProjects,
  adminProject: (projectId: string) =>
    generatePath(ROUTES.adminProject, { project_id: projectId }),
  adminDesign: (projectId: string, guiId: string) =>
    generatePath(ROUTES.adminDesign, { project_id: projectId, gui_id: guiId }),
  adminParticipants: (projectId: string) =>
    generatePath(ROUTES.adminParticipants, { project_id: projectId }),
  sessionStart: () => ROUTES.sessionStart,
  sessionDesign: (sessionId: string) =>
    generatePath(ROUTES.sessionDesign, { session_id: sessionId }),
}
