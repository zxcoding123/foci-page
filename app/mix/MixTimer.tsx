"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaPlay, FaPause, FaStop, FaRedo, FaExternalLinkAlt, FaMinus, FaPlus, FaCoffee, FaBolt, FaLayerGroup } from "react-icons/fa"
import { TimerButton, timerPresets, microBreakPrompts } from "./constants"

type SessionType = "work" | "break" | null

interface MixTimerProps {
  timer: number | null
  isPaused: boolean
  initialTime: number | null
  sessionType: SessionType
  activeColor: string
  isCustomTimerOpen: boolean
  setIsCustomTimerOpen: (value: boolean) => void
  setIsPaused: (value: boolean) => void
  setTimer: (value: number | null) => void
  startTimer: (seconds: number, breakSeconds?: number | null) => void
  onEndSession: () => void
  formatTime: (seconds: number) => string
  pipSupported: boolean
  pipActive: boolean
  onOpenPip: () => void
  onClosePip: () => void
  currentTaskText?: string
  nextTaskText?: string
  isOvertime: boolean
  overtimeSeconds: number
  awaitingBreakChoice: boolean
  onResolveBreakChoice: (choice: "break" | "flow") => void
  onWrapUpFlow: () => void
}

export default function MixTimer({
  timer,
  isPaused,
  initialTime,
  sessionType,
  activeColor,
  isCustomTimerOpen,
  setIsCustomTimerOpen,
  setIsPaused,
  setTimer,
  startTimer,
  onEndSession,
  formatTime,
  pipSupported,
  pipActive,
  onOpenPip,
  onClosePip,
  currentTaskText,
  nextTaskText,
  isOvertime,
  overtimeSeconds,
  awaitingBreakChoice,
  onResolveBreakChoice,
  onWrapUpFlow,
}: MixTimerProps) {
  const [workH, setWorkH] = useState(0)
  const [workM, setWorkM] = useState(25)
  const [workS, setWorkS] = useState(0)
  const [breakH, setBreakH] = useState(0)
  const [breakM, setBreakM] = useState(0)
  const [breakS, setBreakS] = useState(0)

  const restartTimer = () => {
    if (initialTime === null) return
    setTimer(initialTime)
    setIsPaused(true)
  }

  const [breakKey, setBreakKey] = useState<number | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)

  const activeBreakKey = sessionType === "break" ? initialTime : null
  if (activeBreakKey !== breakKey) {
    setBreakKey(activeBreakKey)
    if (activeBreakKey !== null) {
      setPromptIndex((i) => (i + 1) % microBreakPrompts.length)
    }
  }
  const microBreakPrompt = activeBreakKey !== null ? microBreakPrompts[promptIndex] : null

  const displaySeconds = isOvertime ? overtimeSeconds : (timer ?? 0)
  const progress = isOvertime ? 1 : (timer !== null && initialTime ? 1 - timer / initialTime : 0)
  const ringRadius = 140
  const ringCircumference = 2 * Math.PI * ringRadius

  const workTotalSeconds = workH * 3600 + workM * 60 + workS
  const breakTotalSeconds = breakH * 3600 + breakM * 60 + breakS

  const closeCustomTimer = () => setIsCustomTimerOpen(false)

  const submitCustomTimer = () => {
    if (workTotalSeconds <= 0) return
    startTimer(workTotalSeconds, breakTotalSeconds > 0 ? breakTotalSeconds : null)
  }

  useEffect(() => {
    if (!isCustomTimerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCustomTimer()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isCustomTimerOpen])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in duration-500">
      {timer === null ? (
        <div className="flex flex-col items-center gap-8">

          {/* Pomodoro Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: activeColor }}>Pomodoro</span>
            <div className="flex flex-wrap justify-center gap-3">
              {timerPresets.filter(p => p.break).map((preset) => (
                <TimerButton
                  key={preset.label}
                  label={preset.label}
                  onClick={() => startTimer(preset.work * 60, preset.break ? preset.break * 60 : null)}
                  activeColor={activeColor}
                />
              ))}
            </div>
          </div>

          {/* Straight Timer Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: activeColor }}>Timer</span>
            <div className="flex flex-wrap justify-center gap-3">
              {timerPresets.filter(p => !p.break).map((preset) => (
                <TimerButton
                  key={preset.label}
                  label={preset.label}
                  onClick={() => startTimer(preset.work * 60, null)}
                  activeColor={activeColor}
                />
              ))}
              <TimerButton label="Custom" onClick={() => setIsCustomTimerOpen(true)} activeColor={activeColor} />
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
           {pipSupported && (
             <button
               onClick={pipActive ? onClosePip : onOpenPip}
               className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-sm"
               style={{ borderColor: activeColor, color: activeColor }}
             >
               <FaExternalLinkAlt size={12} />
               <span>{pipActive ? "Bring Back" : "Pop Out"}</span>
             </button>
           )}

           {currentTaskText && (
             <div className="flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm" style={{ color: activeColor }}>
               <FaLayerGroup size={12} />
               <span className="max-w-[60vw] truncate">{currentTaskText}</span>
             </div>
           )}

           <div
             className="relative flex items-center justify-center"
             style={{ width: "min(85vw, 360px)", height: "min(85vw, 360px)" }}
           >
             <svg viewBox="0 0 300 300" className="absolute inset-0 -rotate-90">
               <circle
                 cx="150"
                 cy="150"
                 r={ringRadius}
                 fill="none"
                 stroke={activeColor}
                 strokeOpacity={0.12}
                 strokeWidth={10}
               />
               <motion.circle
                 cx="150"
                 cy="150"
                 r={ringRadius}
                 fill="none"
                 stroke={activeColor}
                 strokeWidth={10}
                 strokeLinecap="round"
                 strokeDasharray={ringCircumference}
                 animate={isOvertime ? { strokeDashoffset: 0, opacity: [1, 0.5, 1] } : { strokeDashoffset: ringCircumference * progress }}
                 transition={isOvertime ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: isPaused ? 0.3 : 1, ease: "linear" }}
               />
             </svg>

             <div className="relative flex flex-col items-center gap-5 px-6">
               {(sessionType || isOvertime) && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: activeColor }}>
                  {isOvertime && <FaBolt size={12} />}
                  {isOvertime ? "Flow / Overtime" : sessionType}
                </div>
               )}
               <div className="text-[11vw] sm:text-6xl font-black font-mono leading-none tracking-tighter transition-colors duration-500 select-none" style={{ color: activeColor }}>
                 {isOvertime && "+"}{formatTime(displaySeconds)}
               </div>
               {sessionType === "break" && microBreakPrompt && (
                 <div className="flex items-center gap-2 text-xs font-medium text-center max-w-55 opacity-70" style={{ color: activeColor }}>
                   <FaCoffee size={12} className="shrink-0" />
                   <span>{microBreakPrompt}</span>
                 </div>
               )}

               {isPaused && timer === initialTime && !isOvertime ? (
                 <button
                   onClick={() => setIsPaused(false)}
                   className="p-6 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                   style={{ backgroundColor: activeColor }}
                   title="Play"
                 >
                   <FaPlay size={28} />
                 </button>
               ) : (
                 <div className="flex items-center gap-4">
                   {!isOvertime && (
                     <button
                       onClick={restartTimer}
                       className="p-4 rounded-full border-2 transition-all hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-sm"
                       style={{ borderColor: activeColor, color: activeColor }}
                       title="Reset"
                     >
                       <FaRedo size={20} />
                     </button>
                   )}

                   <button
                     onClick={() => setIsPaused(!isPaused)}
                     className="p-6 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                     style={{ backgroundColor: activeColor }}
                     title={isPaused ? "Play" : "Pause"}
                   >
                     {isPaused ? <FaPlay size={28} /> : <FaPause size={28} />}
                   </button>

                   <button
                     onClick={isOvertime ? onWrapUpFlow : onEndSession}
                     className="p-4 rounded-full border-2 transition-all hover:scale-105 active:scale-95 hover:bg-red-50 hover:border-red-500 hover:text-red-500 bg-white/50 backdrop-blur-sm"
                     style={{ borderColor: activeColor, color: activeColor }}
                     title={isOvertime ? "Wrap Up" : "Stop"}
                   >
                     <FaStop size={20} />
                   </button>
                 </div>
               )}
             </div>
           </div>

           {nextTaskText && !awaitingBreakChoice && (
             <div className="text-xs font-bold opacity-50 uppercase tracking-widest" style={{ color: activeColor }}>
               Up next: {nextTaskText}
             </div>
           )}

           {isPaused && timer === initialTime && (
             <button
               onClick={onEndSession}
               className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
               style={{ color: activeColor }}
             >
               Cancel
             </button>
           )}
        </div>
      )}

      {/* Break vs. Flow prompt */}
      {awaitingBreakChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: activeColor }}>Focus session complete!</h3>
            <p className="text-sm text-gray-500 mb-6">Still in the zone? Keep flowing, or take your break.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onResolveBreakChoice("flow")}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
                style={{ backgroundColor: activeColor }}
              >
                <FaBolt size={14} />
                Keep Flowing
              </button>
              <button
                onClick={() => onResolveBreakChoice("break")}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold border-2 transition-transform active:scale-95"
                style={{ borderColor: activeColor, color: activeColor }}
              >
                <FaCoffee size={14} />
                Start Break
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">Break starts automatically if you don&apos;t choose.</p>
          </motion.div>
        </div>
      )}

      {/* Custom Timer Dialog */}
      {isCustomTimerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCustomTimer()
          }}
        >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"
            >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitCustomTimer()
                  }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: activeColor }}>Set Custom Timer</h3>

                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Focus</span>
                  <div className="flex gap-2 mt-2 mb-5">
                    <TimeUnitField label="hr" value={workH} onChange={setWorkH} max={23} activeColor={activeColor} autoFocus />
                    <TimeUnitField label="min" value={workM} onChange={setWorkM} max={59} activeColor={activeColor} />
                    <TimeUnitField label="sec" value={workS} onChange={setWorkS} max={59} activeColor={activeColor} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Break (optional)</span>
                  <div className="flex gap-2 mt-2">
                    <TimeUnitField label="hr" value={breakH} onChange={setBreakH} max={23} activeColor={activeColor} />
                    <TimeUnitField label="min" value={breakM} onChange={setBreakM} max={59} activeColor={activeColor} />
                    <TimeUnitField label="sec" value={breakS} onChange={setBreakS} max={59} activeColor={activeColor} />
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                        type="submit"
                        disabled={workTotalSeconds <= 0}
                        className="px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: activeColor }}
                      >
                        Start
                    </button>
                    <button
                      type="button"
                      onClick={closeCustomTimer}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 w-full text-center transition-colors py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  )
}

function TimeUnitField({
  label,
  value,
  onChange,
  max,
  activeColor,
  autoFocus,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  max: number
  activeColor: string
  autoFocus?: boolean
}) {
  const clamp = (n: number) => Math.min(max, Math.max(0, n))

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full flex items-center rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          className="px-2 py-3 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          <FaMinus size={10} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={0}
          max={max}
          autoFocus={autoFocus}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10)
            onChange(Number.isNaN(parsed) ? 0 : clamp(parsed))
          }}
          onFocus={(e) => e.target.select()}
          className="w-full min-w-0 px-1 py-3 text-center text-lg font-bold text-gray-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ caretColor: activeColor }}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          className="px-2 py-3 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          <FaPlus size={10} />
        </button>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  )
}
