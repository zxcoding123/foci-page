"use client"

import { motion, Reorder } from "framer-motion"
import {
  FaCheck, FaTrash, FaTag, FaBullseye, FaGripVertical, FaPlus, FaMinus,
  FaFlag, FaList, FaThLarge, FaBrain, FaMagic, FaChartBar
} from "react-icons/fa"
import { Priority, Todo } from "./constants"

interface MixTodosProps {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
  newTodo: string
  setNewTodo: (value: string) => void
  newTodoPomos: number
  setNewTodoPomos: (value: number) => void
  newTodoTags: string
  setNewTodoTags: (value: string) => void
  newTodoPriority: Priority
  setNewTodoPriority: (value: Priority) => void
  newTodoDeadline: string
  setNewTodoDeadline: (value: string) => void
  viewMode: "list" | "grid"
  setViewMode: (value: "list" | "grid") => void
  isChaosMode: boolean
  setIsChaosMode: (value: boolean) => void
  chaosText: string
  setChaosText: (value: string) => void
  dailyGoal: number
  setDailyGoal: (value: number) => void
  dailySessions: number
  activeColor: string
  totalPomos: number
  setOneThingView: (value: boolean) => void
  addTodo: (e: React.FormEvent) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  incrementPomo: (id: string) => void
  updatePomoEstimate: (id: string, newEstimate: number) => void
  autoSortTasks: () => void
  handleChaosCleanup: () => void
  formatDeadline: (deadline: string) => string
}

export default function MixTodos({
  todos,
  setTodos,
  newTodo,
  setNewTodo,
  newTodoPomos,
  setNewTodoPomos,
  newTodoTags,
  setNewTodoTags,
  newTodoPriority,
  setNewTodoPriority,
  newTodoDeadline,
  setNewTodoDeadline,
  viewMode,
  setViewMode,
  isChaosMode,
  setIsChaosMode,
  chaosText,
  setChaosText,
  dailyGoal,
  setDailyGoal,
  dailySessions,
  activeColor,
  totalPomos,
  setOneThingView,
  addTodo,
  toggleTodo,
  deleteTodo,
  incrementPomo,
  updatePomoEstimate,
  autoSortTasks,
  handleChaosCleanup,
  formatDeadline,
}: MixTodosProps) {
  return (
    <div className={`mx-auto animate-in fade-in duration-500 ${viewMode === 'grid' ? 'max-w-4xl' : 'max-w-2xl'}`}>
      {/* Daily Goal Progress */}
      <div className="mb-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border-2" style={{ borderColor: activeColor }}>
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 font-bold" style={{ color: activeColor }}>
                  <FaBullseye />
                  <span>Daily Goal</span>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-black" style={{ color: activeColor }}>{dailySessions}</span>
                  <span className="text-sm opacity-50 font-bold">/</span>
                  <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-transparent font-bold text-xl focus:outline-none text-right"
                      style={{ color: activeColor }}
                  />
              </div>
          </div>
          <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
              <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: activeColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (dailySessions / dailyGoal) * 100)}%` }}
              />
          </div>
      </div>

      <div className="flex justify-between items-end mb-8">
          <div className="flex items-baseline gap-4">
              <h2
                  className="text-3xl font-bold text-center transition-colors duration-500"
                  style={{ color: activeColor }}
              >
                  Tasks
              </h2>
              {totalPomos > 0 && (
                  <span className="font-bold text-lg" style={{ color: activeColor }}>
                  {totalPomos} 🍅
                  </span>
              )}
          </div>
          <div className="flex items-center gap-2 relative z-30">
              <button
                  onClick={() => setIsChaosMode(!isChaosMode)}
                  className={`p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80 ${isChaosMode ? 'bg-white/80' : ''}`}
                  style={{ borderColor: activeColor, color: activeColor }}
                  title="Brain Dump"
              >
                  <FaBrain size={14} />
              </button>
              <button
                  onClick={() => setOneThingView(true)}
                  className="p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80"
                  style={{ borderColor: activeColor, color: activeColor }}
                  title="Focus on one task"
              >
                  <FaBullseye size={14} />
              </button>
              <button
                  onClick={autoSortTasks}
                  className="p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80"
                  style={{ borderColor: activeColor, color: activeColor }}
                  title="Auto-sort by heat map"
              >
                  <FaChartBar size={14} />
              </button>
              <div className="flex gap-1 bg-white/40 backdrop-blur-sm p-1 rounded-xl border-2" style={{ borderColor: activeColor }}>
              <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                  style={{ color: viewMode === "list" ? activeColor : "#4A4A4A" }}
              >
                  <FaList size={14} />
              </button>
              <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                  style={{ color: viewMode === "grid" ? activeColor : "#4A4A4A" }}
              >
                  <FaThLarge size={14} />
              </button>
              </div>
          </div>
      </div>

      {isChaosMode ? (
        <div className="flex flex-col gap-4 mb-8 relative z-20 animate-in fade-in duration-300">
          <textarea
            value={chaosText}
            onChange={(e) => setChaosText(e.target.value)}
            placeholder="Vent everything on your mind... then let the AI sort it out."
            className="w-full h-40 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all placeholder:text-gray-400 text-lg"
            style={{
              borderColor: chaosText ? activeColor : 'transparent',
              color: '#4A4A4A',
              resize: 'none'
            }}
          />
          <button
            type="button"
            onClick={handleChaosCleanup}
            className="w-full px-8 py-4 rounded-2xl font-bold text-white transition-transform active:scale-95 shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-3"
            style={{ backgroundColor: activeColor }}
            disabled={!chaosText.trim()}
          >
            <FaMagic />
            <span>Clean Up</span>
          </button>
        </div>
      ) : (
        <form onSubmit={addTodo} className="flex flex-col gap-4 mb-8 relative z-20">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all placeholder:text-gray-400 text-lg"
              style={{
                borderColor: newTodo ? activeColor : 'transparent',
                color: '#4A4A4A'
              }}
            />
            <input
              type="date"
              value={newTodoDeadline}
              onChange={(e) => setNewTodoDeadline(e.target.value)}
              className="px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all text-gray-400"
              style={{
                borderColor: newTodoDeadline ? activeColor : 'transparent',
              }}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all">
              <FaTag className="text-gray-400" />
              <input
                type="text"
                value={newTodoTags}
                onChange={(e) => setNewTodoTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm"
                style={{ color: '#4A4A4A' }}
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all">
                <FaFlag className={newTodoPriority === 'high' ? 'text-red-500' : newTodoPriority === 'medium' ? 'text-yellow-500' : 'text-green-500'} />
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as Priority)}
                  className="bg-transparent focus:outline-none text-sm font-bold uppercase tracking-wider cursor-pointer"
                  style={{ color: '#4A4A4A' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
            </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4">
            <span className="text-2xl">🍅</span>
            <input
              type="number"
              value={newTodoPomos}
              onChange={(e) => setNewTodoPomos(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-12 bg-transparent focus:outline-none text-lg font-bold text-center"
              style={{ color: '#4A4A4A' }}
            />
          </div>
          <button
            type="submit"
            className="px-8 py-4 rounded-2xl font-bold text-white transition-transform active:scale-95 shadow-lg hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: activeColor }}
          >
            Add
          </button>
          </div>
        </form>
      )}

      {viewMode === "list" ? (
      <Reorder.Group axis="y" values={todos} onReorder={setTodos} className="space-y-3 relative z-20">
        {todos.map((todo) => (
          <Reorder.Item
            key={todo.id}
            value={todo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm group hover:bg-white/80 transition-colors"
          >
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0">
              <FaGripVertical />
            </div>
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer`}
              style={{
                borderColor: activeColor,
                backgroundColor: todo.completed ? activeColor : 'transparent'
              }}
            >
              {todo.completed && <FaCheck size={12} className="text-white" />}
            </button>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-lg transition-all ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {todo.text}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                  }`}>
                      {todo.priority}
                  </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {todo.deadline && (
                  <span className="text-xs font-bold text-gray-500">{formatDeadline(todo.deadline)}</span>
                )}
                {todo.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/50 font-bold uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 text-sm font-bold cursor-pointer hover:scale-110 transition-transform"
                style={{ color: activeColor }}
                onClick={() => incrementPomo(todo.id)}
              >
                <span>{todo.completedPomos || 0}/{todo.pomoSessions}</span>
                <span>🍅</span>
              </div>
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, todo.pomoSessions + 1) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaPlus /></button>
                  <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, Math.max(1, todo.pomoSessions - 1)) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaMinus /></button>
              </div>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-2 cursor-pointer"
            >
              <FaTrash size={16} />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
              {todos.map((todo) => (
                  <motion.div
                      layout
                      key={todo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col p-6 rounded-3xl bg-white/60 backdrop-blur-sm group hover:bg-white/80 transition-colors border-2 border-transparent hover:border-white/50"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <button
                                  onClick={() => toggleTodo(todo.id)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer`}
                                  style={{
                                  borderColor: activeColor,
                                  backgroundColor: todo.completed ? activeColor : 'transparent'
                                  }}
                              >
                                  {todo.completed && <FaCheck size={12} className="text-white" />}
                              </button>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                              }`}>
                                  {todo.priority}
                              </span>
                          </div>
                          <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                              <FaTrash size={14} />
                          </button>
                      </div>

                      <div className="mb-4 flex-1">
                          <p className={`text-lg font-medium mb-2 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {todo.text}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {todo.deadline && (
                              <span className="text-xs font-bold text-gray-500">{formatDeadline(todo.deadline)}</span>
                            )}
                            {todo.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/50 font-bold uppercase tracking-wider">{tag}</span>
                            ))}
                          </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-black/5">
                          <div className="flex items-center gap-2">
                              <div
                              className="flex items-center gap-1 text-sm font-bold cursor-pointer hover:scale-110 transition-transform"
                              style={{ color: activeColor }}
                              onClick={() => incrementPomo(todo.id)}
                              >
                              <span>{todo.completedPomos || 0}/{todo.pomoSessions}</span>
                              <span>🍅</span>
                              </div>
                              <div className="flex flex-col">
                                  <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, todo.pomoSessions + 1) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaPlus /></button>
                                  <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, Math.max(1, todo.pomoSessions - 1)) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaMinus /></button>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              ))}
          </div>
      )}

        {todos.length === 0 && (
          <p className="text-center text-gray-400 italic mt-8">No tasks yet. Time to focus!</p>
        )}
    </div>
  )
}
