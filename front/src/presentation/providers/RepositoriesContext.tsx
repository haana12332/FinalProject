import { createContext } from 'react'
import type { OperationLogRepository } from '../../application/repositories/OperationLogRepository'
import type { ProjectRepository } from '../../application/repositories/ProjectRepository'
import type { GuiRepository } from '../../application/repositories/GuiRepository'
import type { GuiTreeRepository } from '../../application/repositories/GuiTreeRepository'
import type { LinkRepository } from '../../application/repositories/LinkRepository'
import type { AttributeRepository } from '../../application/repositories/AttributeRepository'
import type { RequirementDocumentRepository } from '../../application/repositories/RequirementDocumentRepository'

// 各 Issue がリポジトリを追加するたびに下記 2 箇所を更新する:
//   1. Repositories 型にプロパティを追加
//   2. RepositoriesProvider の value に実装を渡す

export type Repositories = {
  operationLog: OperationLogRepository   // #13
  project: ProjectRepository             // #17
  gui: GuiRepository                     // #17
  guiTree: GuiTreeRepository             // #18
  link: LinkRepository                   // #24
  attribute: AttributeRepository         // #24
  requirementDocument: RequirementDocumentRepository  // #21
}

export const RepositoriesContext = createContext<Repositories | null>(null)
