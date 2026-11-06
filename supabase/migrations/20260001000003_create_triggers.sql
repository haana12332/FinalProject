-- トリガー
-- 1. set_updated_at: updated_at を持つ全テーブルの自動更新
-- 2. check_node_hierarchy: 親子の layer_type の組み合わせを強制（DR001）

-- ----------------------------------------------------------------
-- 1. set_updated_at
-- ----------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- updated_at を持つすべてのテーブルに付ける（operation_logs は除く）

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger requirement_documents_set_updated_at
  before update on requirement_documents
  for each row execute function set_updated_at();

create trigger guis_set_updated_at
  before update on guis
  for each row execute function set_updated_at();

create trigger nodes_set_updated_at
  before update on nodes
  for each row execute function set_updated_at();

create trigger links_set_updated_at
  before update on links
  for each row execute function set_updated_at();

create trigger attributes_set_updated_at
  before update on attributes
  for each row execute function set_updated_at();

create trigger design_decisions_set_updated_at
  before update on design_decisions
  for each row execute function set_updated_at();

create trigger sessions_set_updated_at
  before update on sessions
  for each row execute function set_updated_at();

create trigger questions_set_updated_at
  before update on questions
  for each row execute function set_updated_at();

create trigger answers_set_updated_at
  before update on answers
  for each row execute function set_updated_at();

create trigger timeline_events_set_updated_at
  before update on timeline_events
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------
-- 2. check_node_hierarchy
-- ----------------------------------------------------------------
-- db-schema.md §4.2 の SQL をベースに、図形（layer_type IS NULL）の規則を追加。
-- invariants.ts の checkNodeHierarchy + checkShapeParent と同じ規則。
--
-- 判定ルール:
--   parent_node_id が null → ページ（OK、以降の判定なし）
--   parent_gui <> new.gui_id → DR001（別 GUI の親子）
--   new.layer_type IS NULL（子が図形）:
--     parent_layer IS NULL or parent_layer = 'page' → DR001
--   parent_layer IS NULL（親が図形）:
--     → DR001（図形は子を持てない）
--   レイヤー同士の組み合わせ（既存ルール）:
--     page → template のみ
--     template → organism / molecule / atom
--     organism → molecule / atom
--     molecule → atom のみ
--     atom → 子を持てない
-- ----------------------------------------------------------------

create or replace function check_node_hierarchy()
returns trigger
language plpgsql
as $$
declare
  parent_layer layer_types;
  parent_gui   uuid;
begin
  -- ページ（parent_node_id が null）はチェック不要
  if new.parent_node_id is null then
    return new;
  end if;

  select layer_type, gui_id
    into parent_layer, parent_gui
    from nodes
   where id = new.parent_node_id;

  -- 同じ GUI チェック
  if parent_gui <> new.gui_id then
    raise exception '親子のノードは同じ GUI に属する必要があります'
      using errcode = 'DR001';
  end if;

  -- 子が図形（layer_type IS NULL）
  if new.layer_type is null then
    if parent_layer is null or parent_layer = 'page' then
      raise exception '図形の親は template / organism / molecule / atom のどれかにしてください（現在: %）',
        coalesce(parent_layer::text, '図形')
        using errcode = 'DR001';
    end if;
    return new;
  end if;

  -- 親が図形（layer_type IS NULL）→ 子を持てない
  if parent_layer is null then
    raise exception '図形（%）は子ノードを持てません', new.layer_name
      using errcode = 'DR001';
  end if;

  -- レイヤー同士の組み合わせチェック
  if not (
       (parent_layer = 'page'     and new.layer_type = 'template')
    or (parent_layer = 'template' and new.layer_type in ('organism', 'molecule', 'atom'))
    or (parent_layer = 'organism' and new.layer_type in ('molecule', 'atom'))
    or (parent_layer = 'molecule' and new.layer_type = 'atom')
  ) then
    raise exception '% の下に % は置けません', parent_layer, new.layer_type
      using errcode = 'DR001';
  end if;

  return new;
end;
$$;

create trigger nodes_check_hierarchy
  before insert or update of parent_node_id, layer_type, gui_id on nodes
  for each row execute function check_node_hierarchy();
