-- RLS の無効化と anon ロールへの GRANT
-- db-schema.md §7: セキュリティは扱わない。すべてのテーブルで RLS を無効にし、
-- フロントエンドから anon キーだけで読み書きする。

-- ----------------------------------------------------------------
-- RLS を無効化
-- ----------------------------------------------------------------

alter table users                  disable row level security;
alter table projects               disable row level security;
alter table requirement_documents  disable row level security;
alter table guis                   disable row level security;
alter table nodes                  disable row level security;
alter table links                  disable row level security;
alter table attributes             disable row level security;
alter table design_decisions       disable row level security;
alter table sessions               disable row level security;
alter table operation_logs         disable row level security;
alter table questions              disable row level security;
alter table answers                disable row level security;
alter table timeline_events        disable row level security;

-- ----------------------------------------------------------------
-- anon ロールに全テーブルの読み書き権限を付与
-- PostgREST（Supabase REST API）は anon ロールで動く
-- ----------------------------------------------------------------

grant select, insert, update, delete
  on all tables in schema public
  to anon;

grant usage on schema public to anon;
