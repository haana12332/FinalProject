-- pgTAP テスト: 階層制約・CHECK 制約・一意制約の検証
-- supabase test db で実行する

begin;

select plan(18);

-- ----------------------------------------------------------------
-- テスト用の共通データ（gui + users）
-- ----------------------------------------------------------------

insert into users (id, name, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'tester', 'researcher');

insert into projects (id, user_id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'test project');

insert into guis (id, project_id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'test gui'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'other gui');

-- ----------------------------------------------------------------
-- 1. 正しい木が入る（page → template → organism → molecule → atom → 図形）
-- ----------------------------------------------------------------

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000001',
       'aaaaaaaa-0000-0000-0000-000000000003',
       null,
       'P_Test', 'page', 'frame', 0)
  $$,
  'page ノードを挿入できる'
);

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000002',
       'aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000001',
       'T_Test', 'template', 'group', 0)
  $$,
  'page → template を挿入できる'
);

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000003',
       'aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000002',
       'O_Test', 'organism', 'group', 0)
  $$,
  'template → organism を挿入できる'
);

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000004',
       'aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000003',
       'M_Test', 'molecule', 'group', 0)
  $$,
  'organism → molecule を挿入できる'
);

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000005',
       'aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000004',
       'A_Test', 'atom', 'group', 0)
  $$,
  'molecule → atom を挿入できる'
);

select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000006',
       'aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000005',
       'Shape_Bg', null, 'rectangle', 0)
  $$,
  'atom → 図形（rectangle）を挿入できる'
);

-- ----------------------------------------------------------------
-- 2. DR001 になるケース
-- ----------------------------------------------------------------

-- 2-1. page の下の organism（template を飛ばす）
select throws_ok(
  $$
    insert into nodes (gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000001',
       'O_Bad', 'organism', 'group', 99)
  $$,
  'DR001',
  null,
  'page の直下に organism → DR001'
);

-- 2-2. atom の下の atom
select throws_ok(
  $$
    insert into nodes (gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000005',
       'A_Bad', 'atom', 'group', 99)
  $$,
  'DR001',
  null,
  'atom の下に atom → DR001'
);

-- 2-3. 図形の下に子（layer_type が null のノードを親にする）
select throws_ok(
  $$
    insert into nodes (gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000006',
       'Shape_Child', null, 'rectangle', 0)
  $$,
  'DR001',
  null,
  '図形の下に子ノード → DR001'
);

-- 2-4. page の直下に図形
select throws_ok(
  $$
    insert into nodes (gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000001',
       'Shape_AtPage', null, 'rectangle', 99)
  $$,
  'DR001',
  null,
  'page の直下に図形 → DR001'
);

-- 2-5. 別 GUI の親
-- gui2 にページを作り、gui1 のノードを gui2 ページの子にしようとする
select lives_ok(
  $$
    insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('bbbbbbbb-0000-0000-0000-000000000010',
       'aaaaaaaa-0000-0000-0000-000000000004',
       null,
       'P_OtherGui', 'page', 'frame', 0)
  $$,
  'other gui にページを作る'
);

select throws_ok(
  $$
    insert into nodes (gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
      ('aaaaaaaa-0000-0000-0000-000000000003',
       'bbbbbbbb-0000-0000-0000-000000000010',
       'T_CrossGui', 'template', 'group', 0)
  $$,
  'DR001',
  null,
  '別 GUI の親 → DR001'
);

-- ----------------------------------------------------------------
-- 3. CHECK 違反（23514）
-- ----------------------------------------------------------------

-- 3-1. attributes: node_id と link_id の両方に値がある
select throws_ok(
  $$
    insert into links (id, source_node_id, target_node_id, name) values
      ('cccccccc-0000-0000-0000-000000000001',
       'bbbbbbbb-0000-0000-0000-000000000001',
       'bbbbbbbb-0000-0000-0000-000000000001',
       'self link');
    insert into attributes (node_id, link_id, attribute_type, value, source) values
      ('bbbbbbbb-0000-0000-0000-000000000001',
       'cccccccc-0000-0000-0000-000000000001',
       'x', '0'::jsonb, 'figma')
  $$,
  '23514',
  null,
  'attributes: node_id と link_id 両方に値 → 23514'
);

-- 3-2. attributes: node_id と link_id の両方が null
select throws_ok(
  $$
    insert into attributes (node_id, link_id, attribute_type, value, source) values
      (null, null, 'x', '0'::jsonb, 'figma')
  $$,
  '23514',
  null,
  'attributes: node_id と link_id 両方が null → 23514'
);

-- ----------------------------------------------------------------
-- 4. 一意制約違反（23505）
-- ----------------------------------------------------------------

-- 4-1. 同じノードに同じ attribute_type が 2 行
select lives_ok(
  $$
    insert into attributes (node_id, attribute_type, value, source) values
      ('bbbbbbbb-0000-0000-0000-000000000001', 'x', '0'::jsonb, 'figma')
  $$,
  'node に attribute_type x を 1 行目を挿入できる'
);

select throws_ok(
  $$
    insert into attributes (node_id, attribute_type, value, source) values
      ('bbbbbbbb-0000-0000-0000-000000000001', 'x', '10'::jsonb, 'figma')
  $$,
  '23505',
  null,
  '同じノードに同じ attribute_type 2 行目 → 23505'
);

-- ----------------------------------------------------------------
-- 完了
-- ----------------------------------------------------------------

select * from finish();

rollback;
