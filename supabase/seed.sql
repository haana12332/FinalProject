-- Seed data
-- 研究者 1 人・プロジェクト 1 件・要件書 1 件・GUI 1 件・ページ 1 件（37 ノード）
-- UUID は固定値（再実行しても同じ ID になる）
--
-- 固定 UUID の割り当て:
--   researcher   : 00000000-0000-0000-0000-000000000001
--   project      : 00000000-0000-0000-0000-000000000002
--   req_document : 00000000-0000-0000-0000-000000000003
--   gui          : 00000000-0000-0000-0000-000000000004
--   node ref "N" : 00000000-0000-0000-0001-{N padded to 12 digits}

-- ----------------------------------------------------------------
-- 研究者
-- ----------------------------------------------------------------
insert into users (id, name, role) values
  ('00000000-0000-0000-0000-000000000001', 'researcher01', 'researcher');

-- ----------------------------------------------------------------
-- プロジェクト
-- ----------------------------------------------------------------
insert into projects (id, user_id, name) values
  ('00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'T1 大学グッズ購入');

-- ----------------------------------------------------------------
-- 要件書
-- ----------------------------------------------------------------
insert into requirement_documents (id, project_id, name, summary, todo, notodo, dod, comment) values
  ('00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000002',
   '大学グッズ購入 要件書',
   '大学のオンラインショップで商品を選んでカートに入れるまでの操作を設計する。',
   array['商品詳細ページの表示', '数量選択', 'カートへの追加'],
   array['決済フロー', 'ユーザー登録'],
   '被験者が商品詳細ページを見て「カートに入れる」ボタンを押せる',
   null);

-- ----------------------------------------------------------------
-- GUI
-- ----------------------------------------------------------------
insert into guis (id, project_id, name, description) values
  ('00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000002',
   '商品詳細ページ（P_ProductDetail）',
   'docs/samples/valid/P_ProductDetail.svg から取り込んだサンプルページ。37 ノード（レイヤー 17・図形 20）。');

-- ----------------------------------------------------------------
-- ノード
-- P_ProductDetail.expected.json の 37 ノードをそのまま挿入する。
-- ref → parent_ref のマッピングは固定 UUID で解決する。
-- 図形は layer_type = null。
-- ----------------------------------------------------------------

-- ref 1: P_ProductDetail (page / frame)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000004',
   null,
   'P_ProductDetail', 'page', 'frame', 0);

-- ref 2: T_ProductDetailTemplate (template / group, parent=1)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000001',
   'T_ProductDetailTemplate', 'template', 'group', 0);

-- ref 3: Template_Bg (shape / rectangle, parent=2)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000002',
   'Template_Bg', null, 'rectangle', 0);

-- ref 4: O_Header (organism / group, parent=2)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000004',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000002',
   'O_Header', 'organism', 'group', 1);

-- ref 5: Header_Bg (shape / rectangle, parent=4)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000005',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000004',
   'Header_Bg', null, 'rectangle', 0);

-- ref 6: A_Logo (atom / group, parent=4)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000006',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000004',
   'A_Logo', 'atom', 'group', 1);

-- ref 7: Logo_Text (shape / text, parent=6)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000007',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000006',
   'Logo_Text', null, 'text', 0);

-- ref 8: M_SearchBox (molecule / group, parent=4)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000008',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000004',
   'M_SearchBox', 'molecule', 'group', 2);

-- ref 9: A_SearchInput (atom / group, parent=8)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000009',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000008',
   'A_SearchInput', 'atom', 'group', 0);

-- ref 10: SearchInput_Bg (shape / rectangle, parent=9)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000010',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000009',
   'SearchInput_Bg', null, 'rectangle', 0);

-- ref 11: SearchInput_Placeholder (shape / text, parent=9)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000011',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000009',
   'SearchInput_Placeholder', null, 'text', 1);

-- ref 12: A_SearchButton (atom / group, parent=8)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000012',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000008',
   'A_SearchButton', 'atom', 'group', 1);

-- ref 13: SearchButton_Bg (shape / rectangle, parent=12)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000013',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000012',
   'SearchButton_Bg', null, 'rectangle', 0);

-- ref 14: SearchButton_Icon (shape / ellipse, parent=12)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000014',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000012',
   'SearchButton_Icon', null, 'ellipse', 1);

-- ref 15: A_CartIcon (atom / group, parent=4)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000015',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000004',
   'A_CartIcon', 'atom', 'group', 3);

-- ref 16: CartIcon_Shape (shape / rectangle, parent=15)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000016',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000015',
   'CartIcon_Shape', null, 'rectangle', 0);

-- ref 17: O_Body (organism / group, parent=2)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000017',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000002',
   'O_Body', 'organism', 'group', 2);

-- ref 18: A_ProductImage (atom / group, parent=17)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000018',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000017',
   'A_ProductImage', 'atom', 'group', 0);

-- ref 19: ProductImage_Bg (shape / rectangle, parent=18)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000019',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000018',
   'ProductImage_Bg', null, 'rectangle', 0);

-- ref 20: ProductImage_Label (shape / text, parent=18)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000020',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000018',
   'ProductImage_Label', null, 'text', 1);

-- ref 21: A_ProductName (atom / group, parent=17)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000021',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000017',
   'A_ProductName', 'atom', 'group', 1);

-- ref 22: ProductName_Text (shape / text, parent=21)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000022',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000021',
   'ProductName_Text', null, 'text', 0);

-- ref 23: A_Price (atom / group, parent=17)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000023',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000017',
   'A_Price', 'atom', 'group', 2);

-- ref 24: Price_Text (shape / text, parent=23)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000024',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000023',
   'Price_Text', null, 'text', 0);

-- ref 25: M_QuantitySelector (molecule / group, parent=17)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000025',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000017',
   'M_QuantitySelector', 'molecule', 'group', 3);

-- ref 26: A_DecrementButton (atom / group, parent=25)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000026',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000025',
   'A_DecrementButton', 'atom', 'group', 0);

-- ref 27: DecrementButton_Bg (shape / rectangle, parent=26)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000027',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000026',
   'DecrementButton_Bg', null, 'rectangle', 0);

-- ref 28: DecrementButton_Label (shape / text, parent=26)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000028',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000026',
   'DecrementButton_Label', null, 'text', 1);

-- ref 29: A_QuantityValue (atom / group, parent=25)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000029',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000025',
   'A_QuantityValue', 'atom', 'group', 1);

-- ref 30: QuantityValue_Bg (shape / rectangle, parent=29)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000030',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000029',
   'QuantityValue_Bg', null, 'rectangle', 0);

-- ref 31: QuantityValue_Text (shape / text, parent=29)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000031',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000029',
   'QuantityValue_Text', null, 'text', 1);

-- ref 32: A_IncrementButton (atom / group, parent=25)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000032',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000025',
   'A_IncrementButton', 'atom', 'group', 2);

-- ref 33: IncrementButton_Bg (shape / rectangle, parent=32)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000033',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000032',
   'IncrementButton_Bg', null, 'rectangle', 0);

-- ref 34: IncrementButton_Label (shape / text, parent=32)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000034',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000032',
   'IncrementButton_Label', null, 'text', 1);

-- ref 35: A_AddToCartButton (atom / group, parent=17)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000035',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000017',
   'A_AddToCartButton', 'atom', 'group', 4);

-- ref 36: AddToCartButton_Bg (shape / rectangle, parent=35)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000036',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000035',
   'AddToCartButton_Bg', null, 'rectangle', 0);

-- ref 37: AddToCartButton_Label (shape / text, parent=35)
insert into nodes (id, gui_id, parent_node_id, layer_name, layer_type, node_kind, sort_order) values
  ('00000000-0000-0000-0001-000000000037',
   '00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0001-000000000035',
   'AddToCartButton_Label', null, 'text', 1);

-- ----------------------------------------------------------------
-- 属性（P_ProductDetail.expected.json のまま）
-- すべて source = 'figma'（SVG 取り込みで自動的に入る属性）
-- ----------------------------------------------------------------

-- node 1: P_ProductDetail
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000001', 'x',      '0'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000001', 'y',      '0'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000001', 'width',  '375'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000001', 'height', '640'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000001', 'fill',   '[{"color":"#FFFFFF","opacity":1}]'::jsonb,      'figma');

-- node 2: T_ProductDetailTemplate
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000002', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000002', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000002', 'width',  '375'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000002', 'height', '640'::jsonb, 'figma');

-- node 3: Template_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000003', 'x',      '0'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000003', 'y',      '0'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000003', 'width',  '375'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000003', 'height', '640'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000003', 'fill',   '[{"color":"#FFFFFF","opacity":1}]'::jsonb,      'figma');

-- node 4: O_Header
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000004', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000004', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000004', 'width',  '375'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000004', 'height', '64'::jsonb,  'figma');

-- node 5: Header_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000005', 'x',      '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000005', 'y',      '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000005', 'width',  '375'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000005', 'height', '64'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000005', 'fill',   '[{"color":"#1E3A5F","opacity":1}]'::jsonb,       'figma');

-- node 6: A_Logo
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000006', 'x',      '16'::jsonb,    'figma'),
  ('00000000-0000-0000-0001-000000000006', 'y',      '20.64'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000006', 'width',  '80.02'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000006', 'height', '20'::jsonb,    'figma');

-- node 7: Logo_Text
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000007', 'x',              '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000007', 'y',              '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000007', 'width',          '80.02'::jsonb,                                   'figma'),
  ('00000000-0000-0000-0001-000000000007', 'height',         '20'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000007', 'characters',     '"生協ストア"'::jsonb,                              'figma'),
  ('00000000-0000-0000-0001-000000000007', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000007', 'font_size',      '16'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000007', 'font_weight',    '700'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000007', 'letter_spacing', '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000007', 'fill',           '[{"color":"#FFFFFF","opacity":1}]'::jsonb,       'figma');

-- node 8: M_SearchBox
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000008', 'x',      '112'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000008', 'y',      '16'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000008', 'width',  '212'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000008', 'height', '32'::jsonb,  'figma');

-- node 9: A_SearchInput
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000009', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000009', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000009', 'width',  '176'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000009', 'height', '32'::jsonb,  'figma');

-- node 10: SearchInput_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000010', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000010', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000010', 'width',         '176'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000010', 'height',        '32'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000010', 'fill',          '[{"color":"#FFFFFF","opacity":1}]'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000010', 'corner_radius', '6'::jsonb,                                       'figma');

-- node 11: SearchInput_Placeholder
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000011', 'x',              '10'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000011', 'y',              '7.73'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000011', 'width',          '60.02'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000011', 'height',         '15'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000011', 'characters',     '"商品を検索"'::jsonb,                              'figma'),
  ('00000000-0000-0000-0001-000000000011', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000011', 'font_size',      '12'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000011', 'font_weight',    '400'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000011', 'letter_spacing', '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000011', 'fill',           '[{"color":"#9AA5B1","opacity":1}]'::jsonb,        'figma');

-- node 12: A_SearchButton
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000012', 'x',      '180'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000012', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000012', 'width',  '32'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000012', 'height', '32'::jsonb,  'figma');

-- node 13: SearchButton_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000013', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000013', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000013', 'width',         '32'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000013', 'height',        '32'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000013', 'fill',          '[{"color":"#F2A623","opacity":1}]'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000013', 'corner_radius', '6'::jsonb,                                       'figma');

-- node 14: SearchButton_Icon
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000014', 'x',      '9'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000014', 'y',      '9'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000014', 'width',  '12'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000014', 'height', '12'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000014', 'stroke', '[{"color":"#FFFFFF","weight":2}]'::jsonb,        'figma');

-- node 15: A_CartIcon
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000015', 'x',      '334'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000015', 'y',      '20'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000015', 'width',  '26'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000015', 'height', '24'::jsonb,  'figma');

-- node 16: CartIcon_Shape
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000016', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000016', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000016', 'width',         '26'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000016', 'height',        '24'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000016', 'stroke',        '[{"color":"#FFFFFF","weight":2}]'::jsonb,        'figma'),
  ('00000000-0000-0000-0001-000000000016', 'corner_radius', '4'::jsonb,                                       'figma');

-- node 17: O_Body
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000017', 'x',      '16'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000017', 'y',      '80'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000017', 'width',  '343'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000017', 'height', '536'::jsonb, 'figma');

-- node 18: A_ProductImage
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000018', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000018', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000018', 'width',  '343'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000018', 'height', '240'::jsonb, 'figma');

-- node 19: ProductImage_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000019', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000019', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000019', 'width',         '343'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000019', 'height',        '240'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000019', 'fill',          '[{"color":"#E4E7EB","opacity":1}]'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000019', 'corner_radius', '8'::jsonb,                                       'figma');

-- node 20: ProductImage_Label
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000020', 'x',              '134'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000020', 'y',              '111.73'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000020', 'width',          '48.02'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000020', 'height',         '15'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000020', 'characters',     '"商品画像"'::jsonb,                                'figma'),
  ('00000000-0000-0000-0001-000000000020', 'font_family',    '"Inter"'::jsonb,                                   'figma'),
  ('00000000-0000-0000-0001-000000000020', 'font_size',      '12'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000020', 'font_weight',    '400'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000020', 'letter_spacing', '0'::jsonb,                                         'figma'),
  ('00000000-0000-0000-0001-000000000020', 'fill',           '[{"color":"#7B8794","opacity":1}]'::jsonb,         'figma');

-- node 21: A_ProductName
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000021', 'x',      '0'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000021', 'y',      '258.09'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000021', 'width',  '180'::jsonb,     'figma'),
  ('00000000-0000-0000-0001-000000000021', 'height', '21'::jsonb,      'figma');

-- node 22: ProductName_Text
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000022', 'x',              '0'::jsonb,                                            'figma'),
  ('00000000-0000-0000-0001-000000000022', 'y',              '0'::jsonb,                                            'figma'),
  ('00000000-0000-0000-0001-000000000022', 'width',          '180'::jsonb,                                          'figma'),
  ('00000000-0000-0000-0001-000000000022', 'height',         '21'::jsonb,                                           'figma'),
  ('00000000-0000-0000-0001-000000000022', 'characters',     '"大学ロゴ入りパーカー"'::jsonb,                        'figma'),
  ('00000000-0000-0000-0001-000000000022', 'font_family',    '"Inter"'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000022', 'font_size',      '18'::jsonb,                                           'figma'),
  ('00000000-0000-0000-0001-000000000022', 'font_weight',    '700'::jsonb,                                          'figma'),
  ('00000000-0000-0000-0001-000000000022', 'letter_spacing', '0'::jsonb,                                            'figma'),
  ('00000000-0000-0000-0001-000000000022', 'fill',           '[{"color":"#1F2933","opacity":1}]'::jsonb,            'figma');

-- node 23: A_Price
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000023', 'x',      '0'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000023', 'y',      '289.55'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000023', 'width',  '70.38'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000023', 'height', '24'::jsonb,      'figma');

-- node 24: Price_Text
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000024', 'x',              '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000024', 'y',              '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000024', 'width',          '70.38'::jsonb,                                   'figma'),
  ('00000000-0000-0000-0001-000000000024', 'height',         '24'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000024', 'characters',     '"¥4,800"'::jsonb,                                'figma'),
  ('00000000-0000-0000-0001-000000000024', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000024', 'font_size',      '20'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000024', 'font_weight',    '700'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000024', 'letter_spacing', '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000024', 'fill',           '[{"color":"#C62828","opacity":1}]'::jsonb,       'figma');

-- node 25: M_QuantitySelector
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000025', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000025', 'y',      '334'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000025', 'width',  '152'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000025', 'height', '40'::jsonb,  'figma');

-- node 26: A_DecrementButton
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000026', 'x',      '0'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000026', 'y',      '0'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000026', 'width',  '40'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000026', 'height', '40'::jsonb, 'figma');

-- node 27: DecrementButton_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000027', 'x',             '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000027', 'y',             '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000027', 'width',         '40'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000027', 'height',        '40'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000027', 'stroke',        '[{"color":"#9AA5B1","weight":1}]'::jsonb,         'figma'),
  ('00000000-0000-0000-0001-000000000027', 'corner_radius', '6'::jsonb,                                        'figma');

-- node 28: DecrementButton_Label
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000028', 'x',              '15'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000028', 'y',              '8.09'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000028', 'width',          '11.92'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000028', 'height',         '21'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000028', 'characters',     '"−"'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000028', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000028', 'font_size',      '18'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000028', 'font_weight',    '400'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000028', 'letter_spacing', '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000028', 'fill',           '[{"color":"#1F2933","opacity":1}]'::jsonb,        'figma');

-- node 29: A_QuantityValue
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000029', 'x',      '48'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000029', 'y',      '0'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000029', 'width',  '56'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000029', 'height', '40'::jsonb, 'figma');

-- node 30: QuantityValue_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000030', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000030', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000030', 'width',         '56'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000030', 'height',        '40'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000030', 'fill',          '[{"color":"#F5F7FA","opacity":1}]'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000030', 'corner_radius', '6'::jsonb,                                       'figma');

-- node 31: QuantityValue_Text
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000031', 'x',              '24'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000031', 'y',              '8.64'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000031', 'width',          '6.52'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000031', 'height',         '20'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000031', 'characters',     '"1"'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000031', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000031', 'font_size',      '16'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000031', 'font_weight',    '400'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000031', 'letter_spacing', '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000031', 'fill',           '[{"color":"#1F2933","opacity":1}]'::jsonb,        'figma');

-- node 32: A_IncrementButton
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000032', 'x',      '112'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000032', 'y',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000032', 'width',  '40'::jsonb,  'figma'),
  ('00000000-0000-0000-0001-000000000032', 'height', '40'::jsonb,  'figma');

-- node 33: IncrementButton_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000033', 'x',             '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000033', 'y',             '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000033', 'width',         '40'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000033', 'height',        '40'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000033', 'stroke',        '[{"color":"#9AA5B1","weight":1}]'::jsonb,         'figma'),
  ('00000000-0000-0000-0001-000000000033', 'corner_radius', '6'::jsonb,                                        'figma');

-- node 34: IncrementButton_Label
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000034', 'x',              '13'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000034', 'y',              '8.09'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000034', 'width',          '11.92'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000034', 'height',         '21'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000034', 'characters',     '"+"'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000034', 'font_family',    '"Inter"'::jsonb,                                  'figma'),
  ('00000000-0000-0000-0001-000000000034', 'font_size',      '18'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000034', 'font_weight',    '400'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000034', 'letter_spacing', '0'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000034', 'fill',           '[{"color":"#1F2933","opacity":1}]'::jsonb,        'figma');

-- node 35: A_AddToCartButton
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000035', 'x',      '0'::jsonb,   'figma'),
  ('00000000-0000-0000-0001-000000000035', 'y',      '480'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000035', 'width',  '343'::jsonb, 'figma'),
  ('00000000-0000-0000-0001-000000000035', 'height', '56'::jsonb,  'figma');

-- node 36: AddToCartButton_Bg
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000036', 'x',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000036', 'y',             '0'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000036', 'width',         '343'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000036', 'height',        '56'::jsonb,                                      'figma'),
  ('00000000-0000-0000-0001-000000000036', 'fill',          '[{"color":"#F2A623","opacity":1}]'::jsonb,       'figma'),
  ('00000000-0000-0000-0001-000000000036', 'corner_radius', '8'::jsonb,                                       'figma');

-- node 37: AddToCartButton_Label
insert into attributes (node_id, attribute_type, value, source) values
  ('00000000-0000-0000-0001-000000000037', 'x',              '116'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000037', 'y',              '16.64'::jsonb,                                     'figma'),
  ('00000000-0000-0000-0001-000000000037', 'width',          '112.02'::jsonb,                                    'figma'),
  ('00000000-0000-0000-0001-000000000037', 'height',         '20'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000037', 'characters',     '"カートに入れる"'::jsonb,                           'figma'),
  ('00000000-0000-0000-0001-000000000037', 'font_family',    '"Inter"'::jsonb,                                   'figma'),
  ('00000000-0000-0000-0001-000000000037', 'font_size',      '16'::jsonb,                                        'figma'),
  ('00000000-0000-0000-0001-000000000037', 'font_weight',    '700'::jsonb,                                       'figma'),
  ('00000000-0000-0000-0001-000000000037', 'letter_spacing', '0'::jsonb,                                         'figma'),
  ('00000000-0000-0000-0001-000000000037', 'fill',           '[{"color":"#FFFFFF","opacity":1}]'::jsonb,         'figma');
