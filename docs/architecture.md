# フロントエンドのアーキテクチャ

**対象**：`front/src/`

---

## 1. 層と依存の向き

```
presentation  →  application  →  domain
                    ↑
              infrastructure  →  domain
```

| 層 | 置き場所 | 役割 |
|---|---|---|
| domain | `front/src/domain/` | エンティティ・値オブジェクト・不変条件（#9） |
| application | `front/src/application/` | ユースケース・リポジトリの interface |
| infrastructure | `front/src/infrastructure/` | リポジトリの実装・Supabase クライアント・型 |
| presentation | `front/src/presentation/` | 画面と部品 |

**Supabase を呼んでよいのは `infrastructure` 層だけ。**
`presentation` と `application` からの `@supabase/supabase-js` import は ESLint `no-restricted-imports` で禁止している。

---

## 2. Supabase クライアント

```ts
// front/src/infrastructure/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

- アプリ全体で 1 インスタンスのみ。
- `Database` 型は `supabase gen types typescript` で生成した `types.ts` から取る（`npm run db:types`）。
- 環境変数は `.env` に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` で設定する。

---

## 3. エラーの変換

Supabase から返る `PostgrestError` は `infrastructure` 層の中で `AppError` に変換する。
presentation 層は `AppError.code` だけを見て表示を切り替える。

```ts
// front/src/application/AppError.ts
type AppError = {
  code: 'not_found' | 'conflict' | 'naming_violation'
      | 'hierarchy_violation' | 'domain_violation'
      | 'network_error' | 'internal_error'
  message: string   // 画面にそのまま出せる日本語
  details?: unknown[]
}
```

変換関数は `front/src/infrastructure/supabase/toAppError.ts` にある。

| PostgrestError.code | AppError.code |
|---|---|
| `PGRST116` | `not_found` |
| `23505`, `23503` | `conflict` |
| `DR001` | `hierarchy_violation` |
| `DR002` | `naming_violation` |
| `23514`, `DR003` | `domain_violation` |
| TypeError（fetch 失敗） | `network_error` |
| それ以外 | `internal_error`（コンソールのみ） |

---

## 4. リポジトリパターン

### 4.1 interface（application 層）

```ts
// front/src/application/repositories/ProjectRepository.ts
import type { AppError } from '../AppError'
import type { Project } from '../../domain/entities'

export interface ProjectRepository {
  list(): Promise<Project[] | AppError>
  get(id: string): Promise<Project | AppError>
  create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | AppError>
  update(id: string, data: Partial<Project>): Promise<Project | AppError>
  delete(id: string): Promise<void | AppError>
}
```

### 4.2 実装（infrastructure 層）

```ts
// front/src/infrastructure/supabase/repositories/SupabaseProjectRepository.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { ProjectRepository } from '../../../application/repositories/ProjectRepository'
import { toAppError } from '../toAppError'

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async list() {
    const { data, error } = await this.db.from('projects').select()
    if (error) return toAppError(error)
    return data
  }
  // ...
}
```

### 4.3 DI の配線

`front/src/presentation/providers/RepositoriesContext.tsx` でリポジトリのインスタンスを生成し、
React Context 経由で presentation 層に提供する。

```tsx
// 新しいリポジトリ（例: #17 ProjectRepository）を追加するとき:
// 1. Repositories 型に project: ProjectRepository を追加
// 2. value に new SupabaseProjectRepository(supabase) を追加
// 3. main.tsx の <RepositoriesProvider> がすでに最上位にあるため変更不要
```

presentation 層での使い方：

```tsx
import { useRepositories } from '../providers/RepositoriesContext'

function ProjectList() {
  const { project } = useRepositories()
  // ...
}
```

---

## 5. ファイル構成

```
front/src/
├── domain/                         # #9
│   ├── entities.ts
│   ├── enums.ts
│   └── invariants.ts
├── application/
│   ├── AppError.ts                 # #11 ← エラー型
│   └── repositories/               # #11 ← interface 置き場
│       └── index.ts               #      （各 Issue が追加する）
├── infrastructure/
│   └── supabase/
│       ├── client.ts              # #11 ← Supabase クライアント
│       ├── types.ts               # #10 ← 生成型（npm run db:types）
│       ├── toAppError.ts          # #11 ← エラー変換
│       └── repositories/          #      （各 Issue が追加する）
└── presentation/
    └── providers/
        └── RepositoriesContext.tsx # #11 ← DI コンテキスト
```
