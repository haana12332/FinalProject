import { createContext } from 'react'
import type { OperationLogRepository } from '../../application/repositories/OperationLogRepository'
import type { ProjectRepository } from '../../application/repositories/ProjectRepository'
import type { GuiRepository } from '../../application/repositories/GuiRepository'

// 各 Issue がリポジトリを追加するたびに下記 2 箇所を更新する:
//   1. Repositories 型にプロパティを追加
//   2. RepositoriesProvider の value に実装を渡す

export type Repositories = {
  operationLog: OperationLogRepository   // #13
  project: ProjectRepository             // #17
  gui: GuiRepository                     // #17
}

export const RepositoriesContext = createContext<Repositories | null>(null)
