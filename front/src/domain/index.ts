/**
 * domain 層の公開 API
 *
 * application / infrastructure / presentation から import するときは
 * このファイルを経由する。
 */

// 列挙型とその Zod スキーマ
export {
  UserRoleSchema,
  LayerTypeSchema,
  NodeKindSchema,
  AttributeSourceSchema,
  AttributeTypeSchema,
  DetermineTypeSchema,
  MethodSchema,
} from './enums'
export type {
  UserRole,
  LayerType,
  NodeKind,
  AttributeSource,
  AttributeType,
  DetermineType,
  Method,
} from './enums'

// 属性の値スキーマ
export { ATTRIBUTE_VALUE_SCHEMAS, parseAttributeValue } from './valueSchemas'

// node_kind / 属性の対応
export {
  FIGMA_ATTRIBUTE_TYPES,
  LINK_ATTRIBUTE_TYPES,
  FIGMA_ATTRIBUTE_FOR_NODE_KIND,
} from './nodeAttributeMap'

// 判断型と属性の対応
export {
  DETERMINE_TYPE_TO_ATTRIBUTE_TYPES,
  ATTRIBUTE_TYPE_TO_DETERMINE_TYPES,
} from './determineTypeMap'

// エンティティの型
export type {
  JsonValue,
  User,
  Project,
  RequirementDocument,
  GUI,
  Node,
  Link,
  Attribute,
  DesignDecision,
  Session,
  OperationLog,
  Question,
  Answer,
  TimelineEvent,
} from './entities'

// レイヤーユーティリティ
export {
  getLayerTypeFromName,
  isLayerName,
  isValidLayerName,
  isValidShapeName,
  LAYER_PREFIXES,
} from './layerUtils'

// 不変条件の検証関数
export type { ValidationResult } from './invariants'
export {
  checkAttributeOwnership,
  checkAttributeTypeForNodeKind,
  checkAttributeValue,
  checkAttributeSource,
  checkDetermineType,
  checkNodeHierarchy,
  checkShapeParent,
  validateAttribute,
} from './invariants'
