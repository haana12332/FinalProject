-- ページ位置更新 RPC（Issue #23）
-- 研究者がキャンバス上でページをドラッグした後に呼ばれる。
-- x・y 属性を上書きする（ノード自体は更新しない）。

create or replace function update_page_position(
  p_page_node_id uuid,
  p_x            numeric,
  p_y            numeric
) returns void
language plpgsql
as $$
begin
  update attributes
     set value = to_jsonb(p_x)
   where node_id = p_page_node_id
     and attribute_type = 'x';

  update attributes
     set value = to_jsonb(p_y)
   where node_id = p_page_node_id
     and attribute_type = 'y';
end;
$$;
