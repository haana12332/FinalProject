/**
 * 要件定義書テーブル（Issue #21）
 *
 * readOnly=false → 研究者モード（追加・編集・削除・並べ替え）
 * readOnly=true  → 被験者モード（閲覧のみ）
 */
import { useState, useRef } from 'react'
import type { RequirementDocument } from '../../../domain/entities'
import styles from './RequirementsTable.module.css'

const CATEGORIES = ['商品探索', '商品選定', '商品購入管理', 'ユーザー管理'] as const

type DraftRow = {
  name: string
  summary: string
  todo: string
  notodo: string
  dod: string
  comment: string
}

const EMPTY_DRAFT: DraftRow = {
  name: CATEGORIES[0],
  summary: '',
  todo: '',
  notodo: '',
  dod: '',
  comment: '',
}

function toDraftRow(doc: RequirementDocument): DraftRow {
  return {
    name: doc.name,
    summary: doc.summary ?? '',
    todo: doc.todo.join('\n'),
    notodo: doc.notodo.join('\n'),
    dod: doc.dod ?? '',
    comment: doc.comment ?? '',
  }
}

function draftToPayload(draft: DraftRow) {
  return {
    name: draft.name.trim(),
    summary: draft.summary.trim() || null,
    todo: draft.todo.split('\n').map(s => s.trim()).filter(Boolean),
    notodo: draft.notodo.split('\n').map(s => s.trim()).filter(Boolean),
    dod: draft.dod.trim() || null,
    comment: draft.comment.trim() || null,
  }
}

type Props = {
  projectId: string
  docs: RequirementDocument[]
  readOnly: boolean
  saving: boolean
  onCreate(payload: ReturnType<typeof draftToPayload>): void
  onUpdate(id: string, payload: ReturnType<typeof draftToPayload>): void
  onDelete(id: string): void
  onReorder(ids: string[]): void
}

export function RequirementsTable({
  docs,
  readOnly,
  saving,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const [order, setOrder] = useState<string[]>(() => docs.map(d => d.id))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [draft, setDraft] = useState<DraftRow>(EMPTY_DRAFT)
  const dragSrcRef = useRef<string | null>(null)

  // keep order in sync when docs list changes from parent
  const prevIdsRef = useRef<string>('')
  const currentIds = docs.map(d => d.id).join(',')
  if (prevIdsRef.current !== currentIds) {
    prevIdsRef.current = currentIds
    setOrder(prev => {
      const newIds = docs.map(d => d.id)
      // preserve relative order of existing ids, append newcomers at end
      const existing = prev.filter(id => newIds.includes(id))
      const added = newIds.filter(id => !prev.includes(id))
      return [...existing, ...added]
    })
  }

  const docById = new Map(docs.map(d => [d.id, d]))
  const orderedDocs = order.map(id => docById.get(id)).filter(Boolean) as RequirementDocument[]

  // ---- drag-and-drop reorder ----
  const handleDragStart = (id: string) => {
    dragSrcRef.current = id
  }

  const handleDrop = (targetId: string) => {
    const srcId = dragSrcRef.current
    if (!srcId || srcId === targetId) return
    setOrder(prev => {
      const next = [...prev]
      const srcIdx = next.indexOf(srcId)
      const tgtIdx = next.indexOf(targetId)
      next.splice(srcIdx, 1)
      next.splice(tgtIdx, 0, srcId)
      onReorder(next)
      return next
    })
    dragSrcRef.current = null
  }

  // ---- edit helpers ----
  const startEdit = (doc: RequirementDocument) => {
    setAddingNew(false)
    setDraft(toDraftRow(doc))
    setEditingId(doc.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAddingNew(false)
    setDraft(EMPTY_DRAFT)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    onUpdate(editingId, draftToPayload(draft))
    setEditingId(null)
  }

  const startAdd = () => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setAddingNew(true)
  }

  const handleSaveNew = () => {
    onCreate(draftToPayload(draft))
    setAddingNew(false)
    setDraft(EMPTY_DRAFT)
  }

  // ---- render helpers ----
  const renderDraftFields = () => (
    <>
      <td>
        <select
          className={styles.select}
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
          {/* allow free text if already set outside the enum */}
          {!CATEGORIES.includes(draft.name as typeof CATEGORIES[number]) && (
            <option value={draft.name}>{draft.name}</option>
          )}
        </select>
      </td>
      <td>
        <textarea
          className={styles.inputArea}
          value={draft.summary}
          onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))}
          placeholder="概要"
          rows={2}
        />
      </td>
      <td>
        <textarea
          className={styles.inputArea}
          value={draft.todo}
          onChange={e => setDraft(d => ({ ...d, todo: e.target.value }))}
          placeholder="1行1件"
          rows={2}
        />
      </td>
      <td>
        <textarea
          className={styles.inputArea}
          value={draft.notodo}
          onChange={e => setDraft(d => ({ ...d, notodo: e.target.value }))}
          placeholder="1行1件"
          rows={2}
        />
      </td>
      <td>
        <textarea
          className={styles.inputArea}
          value={draft.dod}
          onChange={e => setDraft(d => ({ ...d, dod: e.target.value }))}
          placeholder="完了条件"
          rows={2}
        />
      </td>
      <td>
        <textarea
          className={styles.inputArea}
          value={draft.comment}
          onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))}
          placeholder="補足"
          rows={2}
        />
      </td>
    </>
  )

  return (
    <div className={styles.wrapper}>
      {!readOnly && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={startAdd}
            disabled={addingNew || saving}
          >
            ＋ 要件を追加
          </button>
        </div>
      )}

      <table className={styles.table}>
        <colgroup>
          {!readOnly && <col className={styles.colOrder} />}
          <col className={styles.colCategory} />
          <col className={styles.colSummary} />
          <col className={styles.colTodo} />
          <col className={styles.colNotodo} />
          <col className={styles.colDod} />
          <col className={styles.colComment} />
          {!readOnly && <col className={styles.colActions} />}
        </colgroup>
        <thead>
          <tr>
            {!readOnly && <th />}
            <th>業務カテゴリ</th>
            <th>内容</th>
            <th>やること</th>
            <th>やらないこと</th>
            <th>完了条件</th>
            <th>補足</th>
            {!readOnly && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {orderedDocs.length === 0 && !addingNew && (
            <tr>
              <td colSpan={readOnly ? 6 : 8} className={styles.empty}>
                {readOnly ? '要件定義書がありません。' : '「＋ 要件を追加」から登録してください。'}
              </td>
            </tr>
          )}

          {orderedDocs.map((doc, idx) => {
            const isEditing = editingId === doc.id
            return (
              <tr
                key={doc.id}
                className={isEditing ? styles.editRow : undefined}
                draggable={!readOnly && !isEditing}
                onDragStart={() => handleDragStart(doc.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(doc.id)}
              >
                {!readOnly && (
                  <td>
                    <span className={styles.dragHandle} title="ドラッグして並べ替え">⠿</span>
                    <span style={{ marginLeft: 4, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                      {idx + 1}
                    </span>
                  </td>
                )}

                {isEditing ? (
                  renderDraftFields()
                ) : (
                  <>
                    <td>{doc.name}</td>
                    <td>{doc.summary}</td>
                    <td>
                      {doc.todo.length > 0 && (
                        <ul className={styles.listCell}>
                          {doc.todo.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      )}
                    </td>
                    <td>
                      {doc.notodo.length > 0 && (
                        <ul className={styles.listCell}>
                          {doc.notodo.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      )}
                    </td>
                    <td>{doc.dod}</td>
                    <td>{doc.comment}</td>
                  </>
                )}

                {!readOnly && (
                  <td>
                    {isEditing ? (
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.btnSave}
                          onClick={handleSaveEdit}
                          disabled={saving || !draft.name.trim()}
                        >
                          保存
                        </button>
                        <button type="button" className={styles.btnCancel} onClick={cancelEdit}>
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.btnEdit}
                          onClick={() => startEdit(doc)}
                          disabled={saving}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          className={styles.btnDelete}
                          onClick={() => {
                            if (confirm(`「${doc.name}」を削除しますか？`)) onDelete(doc.id)
                          }}
                          disabled={saving}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}

          {addingNew && (
            <tr className={styles.editRow}>
              {!readOnly && <td />}
              {renderDraftFields()}
              <td>
                <div className={styles.actionGroup}>
                  <button
                    type="button"
                    className={styles.btnSave}
                    onClick={handleSaveNew}
                    disabled={saving || !draft.name.trim()}
                  >
                    保存
                  </button>
                  <button type="button" className={styles.btnCancel} onClick={cancelEdit}>
                    取消
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
