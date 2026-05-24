'use client'

import { useState, useEffect, useRef } from 'react'

type Todo = {
  id: string
  text: string
  done: boolean
  createdAt: number
}

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-5 h-5 transition-all duration-200"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        stroke={checked ? '#6366f1' : '#d1d5db'}
        strokeWidth="1.5"
        fill={checked ? '#6366f1' : 'transparent'}
        className="transition-all duration-200"
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
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [hydrated, setHydrated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) {
      try {
        setTodos(JSON.parse(saved))
      } catch {
        setTodos([])
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('todos', JSON.stringify(todos))
    }
  }, [todos, hydrated])

  const addTodo = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setTodos(prev => [
      { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
      ...prev,
    ])
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const activeCount = todos.filter(t => !t.done).length

  if (!hydrated) return null

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            タスク
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount > 0
              ? `残り ${activeCount} 件`
              : todos.length > 0
              ? 'すべて完了！'
              : 'タスクを追加してください'}
          </p>
        </div>

        {/* 入力フォーム */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-4 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 select-none"
          >
            追加
          </button>
        </div>

        {/* フィルター */}
        {todos.length > 0 && (
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
            {(['all', 'active', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  filter === f
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了'}
              </button>
            ))}
          </div>
        )}

        {/* タスクリスト */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {filter === 'done' ? '完了したタスクはありません' : 'タスクはありません'}
            </div>
          )}
          {filtered.map(todo => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border transition-all duration-200 ${
                todo.done
                  ? 'border-gray-100 opacity-60'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0 transition-transform duration-150 active:scale-90"
                aria-label={todo.done ? '未完了に戻す' : '完了にする'}
              >
                <CheckIcon checked={todo.done} />
              </button>

              <span
                className={`flex-1 text-sm transition-all duration-200 ${
                  todo.done
                    ? 'line-through text-gray-400'
                    : 'text-gray-800'
                }`}
              >
                {todo.text}
              </span>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-90"
                aria-label="削除"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        {/* フッター */}
        {todos.some(t => t.done) && (
          <div className="mt-4 text-right">
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
