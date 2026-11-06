export type AppErrorCode =
  | 'not_found'
  | 'conflict'
  | 'naming_violation'
  | 'hierarchy_violation'
  | 'domain_violation'
  | 'network_error'
  | 'internal_error'

export type AppError = {
  code: AppErrorCode
  message: string
  details?: unknown[]
}
