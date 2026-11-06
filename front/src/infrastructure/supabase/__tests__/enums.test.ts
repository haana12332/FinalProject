/**
 * DB の enum 値とドメイン層の Zod enum 値が一致することを確認する。
 *
 * supabase gen types で生成した types.ts の Constants.public.Enums と、
 * front/src/domain/enums.ts の Zod スキーマの値を突き合わせ、
 * 将来的な値のずれを防ぐ。
 */
import { describe, it, expect } from 'vitest'
import { Constants } from '../types'
import {
  UserRoleSchema,
  LayerTypeSchema,
  NodeKindSchema,
  AttributeSourceSchema,
  AttributeTypeSchema,
  DetermineTypeSchema,
  MethodSchema,
} from '../../../domain/enums'

const dbEnums = Constants.public.Enums

describe('DB enum と domain enum の値が一致する', () => {
  it('user_roles', () => {
    expect([...dbEnums.user_roles].sort()).toEqual(
      [...UserRoleSchema.options].sort(),
    )
  })

  it('layer_types', () => {
    expect([...dbEnums.layer_types].sort()).toEqual(
      [...LayerTypeSchema.options].sort(),
    )
  })

  it('node_kinds', () => {
    expect([...dbEnums.node_kinds].sort()).toEqual(
      [...NodeKindSchema.options].sort(),
    )
  })

  it('attribute_sources', () => {
    expect([...dbEnums.attribute_sources].sort()).toEqual(
      [...AttributeSourceSchema.options].sort(),
    )
  })

  it('attribute_types（41 種）', () => {
    expect(dbEnums.attribute_types.length).toBe(41)
    expect([...dbEnums.attribute_types].sort()).toEqual(
      [...AttributeTypeSchema.options].sort(),
    )
  })

  it('determine_types（12 種）', () => {
    expect(dbEnums.determine_types.length).toBe(12)
    expect([...dbEnums.determine_types].sort()).toEqual(
      [...DetermineTypeSchema.options].sort(),
    )
  })

  it('methods', () => {
    expect([...dbEnums.methods].sort()).toEqual(
      [...MethodSchema.options].sort(),
    )
  })
})
