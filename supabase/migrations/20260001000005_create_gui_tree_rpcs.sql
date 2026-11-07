-- GUI ツリー操作 RPC
-- svg-import-spec.md §6 / api.md §6.2

-- ----------------------------------------------------------------
-- get_gui_tree: GUI に属する全ノード・属性を返す
-- ----------------------------------------------------------------

create or replace function get_gui_tree(p_gui_id uuid)
returns jsonb
language plpgsql
as $$
begin
  return jsonb_build_object(
    'gui_id',     p_gui_id,
    'nodes',      coalesce(
                    (select jsonb_agg(to_jsonb(n) order by n.sort_order)
                     from nodes n
                     where n.gui_id = p_gui_id),
                    '[]'::jsonb
                  ),
    'attributes', coalesce(
                    (select jsonb_agg(to_jsonb(a))
                     from attributes a
                     where a.node_id in (
                       select id from nodes where gui_id = p_gui_id
                     )),
                    '[]'::jsonb
                  )
  );
end;
$$;

-- ----------------------------------------------------------------
-- import_page: GUI にページノード一式を挿入する
--
-- p_gui_id  : 対象 GUI の id
-- p_nodes   : ImportNodePayload[] の JSON 配列（ref で親子を解決）
--             各要素: { ref, parent_ref, layer_name, layer_type,
--                       node_kind, sort_order, attributes: [...] }
--
-- 戻り値: get_gui_tree(p_gui_id) と同じ構造
-- ----------------------------------------------------------------

create or replace function import_page(p_gui_id uuid, p_nodes jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_ref_map  jsonb := '{}'::jsonb;  -- text(ref) → uuid の対応表
  v_node     jsonb;
  v_node_id  uuid;
  v_parent   uuid;
  v_attr     jsonb;
begin
  for v_node in select value from jsonb_array_elements(p_nodes) loop
    -- parent_ref → 実 UUID
    if (v_node->>'parent_ref') is null then
      v_parent := null;
    else
      v_parent := (v_ref_map->>(v_node->>'parent_ref'))::uuid;
    end if;

    insert into nodes (
      gui_id, parent_node_id, layer_name,
      layer_type, node_kind, sort_order
    )
    values (
      p_gui_id,
      v_parent,
      v_node->>'layer_name',
      (v_node->>'layer_type')::layer_types,   -- json null → sql null ✓
      (v_node->>'node_kind')::node_kinds,
      (v_node->>'sort_order')::integer
    )
    returning id into v_node_id;

    -- ref を UUID に登録
    v_ref_map := v_ref_map || jsonb_build_object(v_node->>'ref', v_node_id);

    -- 属性を挿入
    for v_attr in select value from jsonb_array_elements(v_node->'attributes') loop
      insert into attributes (node_id, attribute_type, value, source)
      values (
        v_node_id,
        (v_attr->>'attribute_type')::attribute_types,
        v_attr->'value',   -- jsonb（数値・文字列・配列 そのまま保持）
        'figma'
      );
    end loop;
  end loop;

  return get_gui_tree(p_gui_id);
end;
$$;

-- ----------------------------------------------------------------
-- reimport_page: 既存ページを削除して再取り込みする
--
-- p_page_node_id : 既存ページノードの id
-- p_nodes        : import_page と同じ形式
-- ----------------------------------------------------------------

create or replace function reimport_page(p_page_node_id uuid, p_nodes jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_gui_id uuid;
begin
  select gui_id into v_gui_id
  from nodes
  where id = p_page_node_id and layer_type = 'page';

  if v_gui_id is null then
    raise exception 'page node not found: %', p_page_node_id
      using errcode = 'P0002';
  end if;

  -- カスケード削除（子ノード・属性がすべて消える）
  delete from nodes where id = p_page_node_id;

  return import_page(v_gui_id, p_nodes);
end;
$$;
