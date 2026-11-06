-- CHECK 制約・一意制約・インデックス
-- db-schema.md §4.1 + svg-import-spec.md §12 に従う

-- ----------------------------------------------------------------
-- CHECK 制約
-- ----------------------------------------------------------------

-- attributes: node_id と link_id のどちらか一方だけ（不変条件1）
alter table attributes
  add constraint attributes_exclusive_owner
    check (num_nonnulls(node_id, link_id) = 1);

-- nodes: ページ（layer_type = 'page'）だけが parent_node_id = null を持つ
-- layer_type が null（図形）のとき (layer_type = 'page') は null になり制約が効かなくなるため
-- is not distinct from を使う（svg-import-spec.md §12 / 実装指示より）
alter table nodes
  add constraint nodes_page_has_no_parent
    check ((layer_type is not distinct from 'page') = (parent_node_id is null));

-- nodes: レイヤー（layer_type not null）は frame / group のみ
--        図形（layer_type is null）は frame / group 以外
-- svg-import-spec.md §12 が要求
alter table nodes
  add constraint nodes_kind_matches_layer_type
    check ((layer_type is not null) = (node_kind in ('frame', 'group')));

-- ----------------------------------------------------------------
-- 一意制約
-- ----------------------------------------------------------------

-- nodes: 兄弟の中で sort_order が重ならない
-- nulls not distinct は付けない
-- （ページは parent_node_id = null・sort_order = 0 → 付けると2ページ目が入らない）
alter table nodes
  add constraint nodes_unique_sort_order
    unique (gui_id, parent_node_id, sort_order);

-- design_decisions: 属性と判断は 1 対 1
alter table design_decisions
  add constraint design_decisions_unique_attribute
    unique (attribute_id);

-- answers: 質問と回答は 1 対 1
alter table answers
  add constraint answers_unique_question
    unique (question_id);

-- sessions: 1 人の被験者の中で order_index が重ならない
alter table sessions
  add constraint sessions_unique_participant_order
    unique (participant_id, order_index);

-- users: 被験者の name は重ならない（研究者は重複を許す）
create unique index users_participant_name_unique
  on users (name)
  where role = 'participant';

-- attributes: 同じノードに同じ attribute_type は 1 行だけ（不変条件4）
create unique index attributes_node_type_unique
  on attributes (node_id, attribute_type)
  where node_id is not null;

-- attributes: 同じリンクに同じ attribute_type は 1 行だけ（不変条件4）
create unique index attributes_link_type_unique
  on attributes (link_id, attribute_type)
  where link_id is not null;

-- ----------------------------------------------------------------
-- 外部キーのインデックス
-- （PostgreSQL は外部キー列にインデックスを自動で作らないため）
-- ----------------------------------------------------------------

create index projects_user_id_idx          on projects (user_id);
create index requirement_documents_project_id_idx on requirement_documents (project_id);
create index guis_project_id_idx           on guis (project_id);
create index nodes_gui_id_idx              on nodes (gui_id);
create index nodes_parent_node_id_idx      on nodes (parent_node_id);
create index links_source_node_id_idx      on links (source_node_id);
create index links_target_node_id_idx      on links (target_node_id);
create index attributes_node_id_idx        on attributes (node_id);
create index attributes_link_id_idx        on attributes (link_id);
create index design_decisions_attribute_id_idx on design_decisions (attribute_id);
create index sessions_participant_id_idx   on sessions (participant_id);
create index sessions_project_id_idx       on sessions (project_id);
create index operation_logs_session_id_idx on operation_logs (session_id);
create index operation_logs_target_node_id_idx on operation_logs (target_node_id);
create index questions_session_id_idx      on questions (session_id);
create index answers_question_id_idx       on answers (question_id);
create index timeline_events_project_id_idx on timeline_events (project_id);
create index timeline_events_target_node_id_idx on timeline_events (target_node_id);

-- operation_logs: セッション×時刻の複合インデックス（CSV 出力用）
create index operation_logs_session_occurred_at_idx
  on operation_logs (session_id, occurred_at);
