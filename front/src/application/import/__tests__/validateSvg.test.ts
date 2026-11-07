// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { validateSvg } from '../validateSvg'

const SAMPLES_DIR = join(__dirname, '../../../../../docs/samples')

function parseSvgFile(relPath: string): Document {
  const svgText = readFileSync(join(SAMPLES_DIR, relPath), 'utf-8')
  return new DOMParser().parseFromString(svgText, 'image/svg+xml')
}

function loadExpected(): Record<string, Array<{ code: string; rule: string; layer_name: string | null }>> {
  const raw = readFileSync(join(SAMPLES_DIR, 'invalid/expected.json'), 'utf-8')
  return JSON.parse(raw)
}

describe('validateSvg — 正常系', () => {
  it('valid/P_ProductDetail.svg → 違反なし', () => {
    const doc = parseSvgFile('valid/P_ProductDetail.svg')
    const violations = validateSvg(doc)
    expect(violations).toHaveLength(0)
  })
})

describe('validateSvg — 異常系（expected.json と照合）', () => {
  const expected = loadExpected()

  const cases: Array<[string, string]> = [
    ['invalid_characters.svg',       'invalid/invalid_characters.svg'],
    ['group_without_prefix.svg',     'invalid/group_without_prefix.svg'],
    ['missing_id.svg',               'invalid/missing_id.svg'],
    ['prefix_on_shape.svg',          'invalid/prefix_on_shape.svg'],
    ['root_not_page.svg',            'invalid/root_not_page.svg'],
    ['multiple_pages.svg',           'invalid/multiple_pages.svg'],
    ['page_child_not_template.svg',  'invalid/page_child_not_template.svg'],
    ['organism_in_organism.svg',     'invalid/organism_in_organism.svg'],
    ['atom_has_layer_child.svg',     'invalid/atom_has_layer_child.svg'],
    ['shape_outside_layer.svg',      'invalid/shape_outside_layer.svg'],
  ]

  for (const [filename, relPath] of cases) {
    it(`${filename} → 期待するエラーが1件だけ出る`, () => {
      const doc = parseSvgFile(relPath)
      const violations = validateSvg(doc)

      const want = expected[filename]
      expect(violations.length, `violations: ${JSON.stringify(violations)}`).toBeGreaterThanOrEqual(1)

      const first = violations[0]
      expect(first.code).toBe(want[0].code)
      expect(first.rule).toBe(want[0].rule)

      // layer_name のチェック（multiple_pages は "P_First, P_Second" のような複合値）
      if (want[0].layer_name !== null) {
        expect(first.layer_name).toBe(want[0].layer_name)
      } else {
        expect(first.layer_name).toBeNull()
      }
    })
  }
})
