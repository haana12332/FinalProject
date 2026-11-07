-- 状態遷移リンク操作 RPC（Issue #24）

-- ----------------------------------------------------------------
-- get_gui_tree を上書き: nodes / attributes / links をまとめて返す
-- ----------------------------------------------------------------
create or replace function get_gui_tree(p_gui_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_node_ids uuid[];
  v_link_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_node_ids
  from nodes
  where gui_id = p_gui_id;

  select coalesce(array_agg(id), '{}') into v_link_ids
  from links
  where source_node_id = any(v_node_ids)
     or target_node_id = any(v_node_ids);

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
                     where a.node_id = any(v_node_ids)
                        or a.link_id = any(v_link_ids)),
                    '[]'::jsonb
                  ),
    'links',      coalesce(
                    (select jsonb_agg(to_jsonb(l))
                     from links l
                     where l.source_node_id = any(v_node_ids)
                        or l.target_node_id = any(v_node_ids)),
                    '[]'::jsonb
                  )
  );
end;
$$;

-- ----------------------------------------------------------------
-- create_link: リンクと属性を 1 トランザクションで保存する
--
-- p_source_node_id : 遷移元ノードの id
-- p_target_node_id : 遷移先ノードの id
-- p_name           : リンク名
-- p_attributes     : [{ attribute_type, value }] の JSON 配列
-- ----------------------------------------------------------------
create or replace function create_link(
  p_source_node_id uuid,
  p_target_node_id uuid,
  p_name           text,
  p_attributes     jsonb default '[]'::jsonb
) returns jsonb
language plpgsql
as $$
declare
  v_link_id uuid;
  v_attr    jsonb;
begin
  insert into links (source_node_id, target_node_id, name)
  values (p_source_node_id, p_target_node_id, p_name)
  returning id into v_link_id;

  for v_attr in
    select * from jsonb_array_elements(coalesce(p_attributes, '[]'::jsonb))
  loop
    insert into attributes (link_id, attribute_type, value, source)
    values (
      v_link_id,
      (v_attr->>'attribute_type')::attribute_types,
      v_attr->'value',
      'manual'
    );
  end loop;

  return jsonb_build_object('link_id', v_link_id);
end;
$$;
