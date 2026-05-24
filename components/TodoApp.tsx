'use client'

import { useState, useEffect, useRef } from 'react'

type Priority = 'high' | 'medium' | 'low'
type Category = 'work' | 'private' | 'other'

type Todo = {
  id: string
  text: string
  done: boolean
  createdAt: number
  priority: Priority
  category: Category
  deadline: string
}

const PRIORITY_LABELS: Record<Priority, string> = { high: '高', medium: '中', low: '低' }
const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 border-red-200',
  medium: 'bg-amber-100 text-amber-600 border-amber-200',
  low: 'bg-sky-100 text-sky-600 border-sky-200',
}
const CATEGORY_LABELS: Record<Category, string> = {
  work: '仕事',
  private: 'プライベート',
  other: 'その他',
}
const CATEGORY_COLORS: Record<Category, string> = {
  work: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  private: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200',
}

function isOverdue(deadline: string): boolean {
  if (!deadline) return false
  const [y, m, d] = deadline.split('-').map(Number)
  const deadlineDate = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return deadlineDate < today
}

function CircularProgress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} stroke="#d1fae5" strokeWidth="8" fill="none" />
        <circle
          cx="48" cy="48" r={r}
          stroke="#059669"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-emerald-700">{pct}%</div>
        <div className="text-[10px] text-emerald-500 font-medium">完了</div>
      </div>
    </div>
  )
}

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <circle
        cx="10" cy="10" r="9"
        stroke={checked ? '#059669' : '#a7f3d0'}
        strokeWidth="1.5"
        fill={checked ? '#059669' : 'transparent'}
        className="transition-all duration-300"
      />
      {checked && (
        <path
          d="M6 10l3 3 5-5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path
        d="M7 4V3a1 1 0 011-1h4a1 1 0 011 1v1M4 4h12M5 4l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newCategory, setNewCategory] = useState<Category>('work')
  const [newDeadline, setNewDeadline] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [hydrated, setHydrated] = useState(false)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [justToggledId, setJustToggledId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos-v2')
    if (saved) {
      try { setTodos(JSON.parse(saved)) } catch { setTodos([]) }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('todos-v2', JSON.stringify(todos))
  }, [todos, hydrated])

  const addTodo = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    setTodos(prev => [
      {
        id, text: trimmed, done: false, createdAt: Date.now(),
        priority: newPriority, category: newCategory, deadline: newDeadline,
      },
      ...prev,
    ])
    setInput('')
    setNewDeadline('')
    setJustAddedId(id)
    setTimeout(() => setJustAddedId(null), 500)
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    setJustToggledId(id)
    setTimeout(() => setJustToggledId(null), 450)
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const filtered = todos.filter(t => {
    if (statusFilter === 'active' && t.done) return false
    if (statusFilter === 'done' && !t.done) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const doneCount = todos.filter(t => t.done).length

  if (!hydrated) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-start justify-center pt-10 px-4 pb-12">
      <div className="w-full max-w-2xl">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900">タスク管理</h1>
            <p className="text-sm text-emerald-500 mt-1">
              {todos.length === 0
                ? 'タスクを追加してください'
                : `${doneCount} / ${todos.length} 件完了`}
            </p>
          </div>
          <CircularProgress done={doneCount} total={todos.length} />
        </div>

        {/* 追加フォーム */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50 p-4 mb-5">
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-gray-800 placeholder-emerald-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            />
            <button
              onClick={addTodo}
              disabled={!input.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-emerald-200"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* 優先度選択 */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">優先度:</span>
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    newPriority === p
                      ? PRIORITY_COLORS[p] + ' shadow-sm'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>

            {/* カテゴリ選択 */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">カテゴリ:</span>
              {(['work', 'private', 'other'] as Category[]).map(c => (
                <button
                  key={c}
                  onClick={() => setNewCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    newCategory === c
                      ? CATEGORY_COLORS[c] + ' shadow-sm'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>

            {/* 締め切り */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">締切:</span>
              <input
                type="date"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-gray-600 outline-none focus:border-emerald-300 transition-all"
              />
            </div>
          </div>
        </div>

        {/* フィルター */}
        {todos.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-emerald-100 p-4 mb-5 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-14 shrink-0">状態</span>
              {(['all', 'active', 'done'] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                    statusFilter === f
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-14 shrink-0">カテゴリ</span>
              <button onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  categoryFilter === 'all' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {(['work', 'private', 'other'] as Category[]).map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    categoryFilter === c
                      ? CATEGORY_COLORS[c] + ' shadow-sm'
                      : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-14 shrink-0">優先度</span>
              <button onClick={() => setPriorityFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  priorityFilter === 'all' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button key={p} onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    priorityFilter === p
                      ? PRIORITY_COLORS[p] + ' shadow-sm'
                      : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* タスクリスト */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-14 text-emerald-300 text-sm">
              {statusFilter === 'done' ? '完了したタスクはありません' : 'タスクはありません'}
            </div>
          )}
          {filtered.map(todo => {
            const overdue = isOverdue(todo.deadline) && !todo.done
            return (
              <div
                key={todo.id}
                className={`group flex items-start gap-3 px-4 py-3.5 bg-white rounded-2xl border transition-all duration-300 ${
                  todo.done
                    ? 'border-gray-100 opacity-60'
                    : overdue
                    ? 'border-red-200 hover:border-red-300 hover:shadow-sm hover:shadow-red-50'
                    : 'border-emerald-100 hover:border-emerald-200 hover:shadow-sm hover:shadow-emerald-50'
                } ${justAddedId === todo.id ? 'todo-enter' : ''}`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 mt-0.5 active:scale-90 ${justToggledId === todo.id ? 'check-bounce' : ''}`}
                  aria-label={todo.done ? '未完了に戻す' : '完了にする'}
                >
                  <CheckIcon checked={todo.done} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm transition-all duration-300 ${
                    todo.done ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${CATEGORY_COLORS[todo.category]}`}>
                      {CATEGORY_LABELS[todo.category]}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${PRIORITY_COLORS[todo.priority]}`}>
                      {PRIORITY_LABELS[todo.priority]}
                    </span>
                    {todo.deadline && (
                      <span className={`text-[10px] font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                        {overdue ? '⚠ 期限切れ: ' : '締切: '}{todo.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-90 mt-0.5"
                  aria-label="削除"
                >
                  <TrashIcon />
                </button>
              </div>
            )
          })}
        </div>

        {/* フッター */}
        {todos.some(t => t.done) && (
          <div className="mt-5 text-right">
            <button
              onClick={() => setTodos(prev => prev.filter(t => !t.done))}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-150"
            >
              完了済みを削除
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
