-- テーブル定義
-- db-schema.md §3 に従う。ドメイン層（entities.ts）が正。
-- 主キー: uuid default gen_random_uuid()
-- created_at / updated_at: timestamptz not null default now()
-- operation_logs は updated_at を持たない

-- ----------------------------------------------------------------
-- §3.1 GUI と設計根拠
-- ----------------------------------------------------------------

create table users (
  id         uuid        not null default gen_random_uuid() primary key,
  name       text        not null,
  role       user_roles  not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id         uuid        not null default gen_random_uuid() primary key,
  user_id    uuid        not null references users (id) on delete restrict,
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table requirement_documents (
  id         uuid        not null default gen_random_uuid() primary key,
  project_id uuid        not null references projects (id) on delete cascade,
  name       text        not null,
  summary    text,
  todo       text[]      not null default '{}',
  notodo     text[]      not null default '{}',
  dod        text,
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table guis (
  id          uuid        not null default gen_random_uuid() primary key,
  project_id  uuid        not null references projects (id) on delete cascade,
  name        text        not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- nodes.layer_type は NULL 可（図形は null）
-- entities.ts: layer_type: LayerType | null
create table nodes (
  id             uuid        not null default gen_random_uuid() primary key,
  gui_id         uuid        not null references guis (id) on delete cascade,
  parent_node_id uuid        references nodes (id) on delete cascade,
  layer_name     text        not null,
  layer_type     layer_types,                 -- NULL 可: 図形は null
  node_kind      node_kinds  not null,
  sort_order     integer     not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table links (
  id             uuid        not null default gen_random_uuid() primary key,
  source_node_id uuid        not null references nodes (id) on delete cascade,
  target_node_id uuid        not null references nodes (id) on delete cascade,
  name           text        not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table attributes (
  id             uuid             not null default gen_random_uuid() primary key,
  node_id        uuid             references nodes (id) on delete cascade,
  link_id        uuid             references links (id) on delete cascade,
  attribute_type attribute_types  not null,
  value          jsonb,
  source         attribute_sources not null,
  created_at     timestamptz      not null default now(),
  updated_at     timestamptz      not null default now()
);

create table design_decisions (
  id             uuid           not null default gen_random_uuid() primary key,
  attribute_id   uuid           not null references attributes (id) on delete cascade,
  determine_type determine_types not null,
  comments       text,
  created_at     timestamptz    not null default now(),
  updated_at     timestamptz    not null default now()
);

-- ----------------------------------------------------------------
-- §3.2 実験の運用（案）
-- ----------------------------------------------------------------

create table sessions (
  id             uuid        not null default gen_random_uuid() primary key,
  participant_id uuid        not null references users (id) on delete restrict,
  project_id     uuid        not null references projects (id) on delete restrict,
  method         methods     not null,
  order_index    integer     not null,
  started_at     timestamptz,
  ended_at       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- operation_logs は updated_at なし（追記専用）
create table operation_logs (
  id             uuid        not null default gen_random_uuid() primary key,
  session_id     uuid        not null references sessions (id) on delete restrict,
  event_type     text        not null,
  target_node_id uuid        references nodes (id) on delete set null,
  payload        jsonb       not null default '{}',
  occurred_at    timestamptz not null,
  created_at     timestamptz not null default now()
);

create table questions (
  id           uuid        not null default gen_random_uuid() primary key,
  session_id   uuid        not null references sessions (id) on delete restrict,
  body         text        not null,
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table answers (
  id           uuid        not null default gen_random_uuid() primary key,
  question_id  uuid        not null references questions (id) on delete restrict,
  body         text        not null,
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table timeline_events (
  id             uuid        not null default gen_random_uuid() primary key,
  project_id     uuid        not null references projects (id) on delete cascade,
  step_index     integer     not null,
  target_node_id uuid        references nodes (id) on delete set null,
  action         text        not null,
  rationale      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
