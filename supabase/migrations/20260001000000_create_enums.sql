-- 列挙型
-- 値は front/src/domain/enums.ts と完全に一致させる

create type user_roles as enum (
  'researcher',
  'participant'
);

create type layer_types as enum (
  'page',
  'template',
  'organism',
  'molecule',
  'atom'
);

create type node_kinds as enum (
  'frame',
  'group',
  'rectangle',
  'ellipse',
  'vector',
  'text',
  'image'
);

create type attribute_sources as enum (
  'figma',
  'manual'
);

-- 41 種（enums.ts の AttributeTypeSchema と完全一致）
create type attribute_types as enum (
  -- Figma 由来の視覚属性
  'x',
  'y',
  'width',
  'height',
  'opacity',
  'fill',
  'stroke',
  'corner_radius',
  'path',
  'image_ref',
  'characters',
  'font_family',
  'font_size',
  'font_weight',
  'line_height',
  'letter_spacing',
  'text_align',
  -- 手動：静的プロパティ
  'padding',
  -- 手動：配置
  'order',
  'gap',
  -- 手動：子オブジェクトの組み合わせ
  'composition',
  -- 手動：目的
  'purpose',
  -- 手動：クラス／トークン
  'class_or_token',
  -- 手動：動的プロパティ
  'visibility',
  'scroll_behavior',
  'responsive',
  -- 手動：状態
  'variant',
  -- 手動：データ入力
  'input_format',
  'selection_rule',
  'validation_rule',
  -- 手動：対象デバイス
  'target_device',
  -- リンク属性（state transition）
  'link_source',
  'hit_area',
  'trigger',
  'transition_method',
  'impact_scope',
  'animation',
  'initial_state',
  'source_handling',
  'return_state',
  'passed_values'
);

-- 設計時の判断型（12 種）
create type determine_types as enum (
  'static_property',
  'child_composition',
  'object_purpose',
  'dynamic_property',
  'state_transition',
  'arrangement',
  'class_or_token_purpose',
  'class_or_token_reuse',
  'interaction',
  'state',
  'data_input',
  'target_device'
);

-- 実験の手法
create type methods as enum (
  'timeline',
  'structural'
);
